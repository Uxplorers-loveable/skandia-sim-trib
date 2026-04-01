import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SimulatorInputs, SMLV, TOPE_VIV_MES, TOPE_SAL_MES, MESES } from '@/lib/taxEngine';

interface SimulatorFormProps {
  onBack: () => void;
  onNext: () => void;
  inputs: SimulatorInputs;
  setInputs: React.Dispatch<React.SetStateAction<SimulatorInputs>>;
}

// Format number with Colombian thousands separator
const formatMoney = (v: number): string => v === 0 ? '0' : v.toLocaleString('es-CO');
const parseMoney = (s: string): number => parseInt(s.replace(/\./g, '').replace(/[^0-9]/g, ''), 10) || 0;

const MoneyInput: React.FC<{
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  placeholder?: string;
}> = ({ value, onChange, disabled, placeholder }) => {
  const [display, setDisplay] = useState(formatMoney(value));
  const [focused, setFocused] = useState(false);

  const handleFocus = () => {
    setFocused(true);
    setDisplay(value === 0 ? '' : String(value));
  };
  const handleBlur = () => {
    setFocused(false);
    const n = parseMoney(display);
    setDisplay(formatMoney(n));
    onChange(n);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setDisplay(raw);
    onChange(parseInt(raw, 10) || 0);
  };

  // Sync display with external value changes when not focused
  React.useEffect(() => {
    if (!focused) setDisplay(formatMoney(value));
  }, [value, focused]);

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">$</span>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full h-12 pl-8 pr-4 rounded-lg border border-border font-mono text-sm text-foreground bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-secondary"
      />
    </div>
  );
};

const PillToggle: React.FC<{
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}> = ({ options, value, onChange }) => (
  <div className="flex rounded-xl border border-border overflow-hidden">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`flex-1 px-4 py-2.5 text-sm font-body font-bold transition-all ${
          value === opt.value
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-muted-foreground hover:bg-secondary'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);


const HelpTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block ml-1.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        <i className="fa-solid fa-circle-question text-xs" />
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-foreground text-primary-foreground text-xs font-body rounded-lg shadow-lg">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45 -mt-1" />
        </div>
      )}
    </span>
  );
};

const CollapsibleSection: React.FC<{
  title: string;
  icon: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-s3 hover:bg-secondary/50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
          <i className={`${icon} text-sm text-primary`} />
        </div>
        <span className="font-heading text-sm font-medium text-foreground flex-1 text-left">
          {title}
        </span>
        <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-xs text-muted-foreground transition-transform`} />
      </button>
      {isOpen && (
        <div className="px-s3 pb-s3 animate-fade-in">
          <div className="border-t border-border pt-s3">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const BarIndicator: React.FC<{ value: number; max: number; label?: string }> = ({ value, max, label }) => {
  const pct = Math.min(100, (value / max) * 100);
  const atLimit = pct >= 100;
  return (
    <div className="mt-1.5">
      <div className="h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${atLimit ? 'bg-warning' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {value > 0 && (
        <p className="text-[10px] text-muted-foreground mt-0.5 font-body">
          {label || (atLimit
            ? `Tope alcanzado — $${Math.round(max).toLocaleString('es-CO')}/mes máx`
            : `$${Math.round(Math.min(value, max)).toLocaleString('es-CO')} de $${Math.round(max).toLocaleString('es-CO')}/mes usados`
          )}
        </p>
      )}
    </div>
  );
};

const SimulatorForm: React.FC<SimulatorFormProps> = ({ onBack, onNext, inputs, setInputs }) => {
  const update = useCallback(<K extends keyof SimulatorInputs>(key: K, val: SimulatorInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  }, [setInputs]);

  const min13 = 13 * SMLV;
  const integralInvalido = inputs.tipoSal === 'integral' && inputs.salario > 0 && inputs.salario < min13;

  return (
    <div className="space-y-s2 animate-fade-in">
      {/* Section 1 — Tu ingreso base */}
      <CollapsibleSection title="Tu ingreso base" icon="fa-solid fa-wallet" defaultOpen>
        <div className="space-y-s3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-s2">
            <div>
              <label className="block font-heading text-sm font-medium text-foreground mb-1.5">
                Salario mensual
                <HelpTooltip text="Tu salario mensual bruto antes de deducciones. Es la base principal para calcular tu retención." />
              </label>
              <MoneyInput value={inputs.salario} onChange={(v) => update('salario', v)} />
              {integralInvalido && (
                <p className="text-xs text-destructive font-body font-bold mt-1.5">
                  ⚠ Mínimo ${min13.toLocaleString('es-CO')} (13 SMLV) para salario integral.
                </p>
              )}
            </div>
            <div>
              <label className="block font-heading text-sm font-medium text-foreground mb-1.5">
                Ingreso independiente mensual
                <HelpTooltip text="Si tienes ingresos adicionales por actividades independientes, ingrésalos aquí. Se calcula seguridad social sobre el 40% de estos ingresos." />
              </label>
              <MoneyInput value={inputs.indep} onChange={(v) => update('indep', v)} />
            </div>
          </div>

          <div>
            <label className="block font-heading text-sm font-medium text-foreground mb-1.5">
              Tipo de contrato
              <HelpTooltip text="El salario integral incluye todas las prestaciones sociales. Para aplicar, debe ser mínimo 13 veces el salario mínimo ($22.761.765 en 2026)." />
            </label>
            <PillToggle
              options={[
                { label: 'Ordinario', value: 'ordinario' },
                { label: 'Integral', value: 'integral' },
              ]}
              value={inputs.tipoSal}
              onChange={(v) => update('tipoSal', v as 'ordinario' | 'integral')}
            />
          </div>

          <div>
            <label className="block font-heading text-sm font-medium text-foreground mb-1.5">
              Procedimiento de retención
              <HelpTooltip text="Procedimiento 1: la retención se calcula cada mes con base en tu ingreso de ese mes. Procedimiento 2: tu empleador calcula un porcentaje fijo en diciembre o junio del año anterior." />
            </label>
            <PillToggle
              options={[
                { label: 'Procedimiento 1', value: '1' },
                { label: 'Procedimiento 2', value: '2' },
              ]}
              value={String(inputs.proc)}
              onChange={(v) => update('proc', Number(v) as 1 | 2)}
            />
          </div>

          {inputs.proc === 2 && (
            <div className="animate-fade-in">
              <label className="block font-heading text-sm font-medium text-foreground mb-1.5">
                Porcentaje fijo (Proc. 2)
                <HelpTooltip text="Porcentaje calculado por el empleador (Art. 386 ET). Ingresa el valor sin el símbolo %." />
              </label>
              <input
                type="number"
                value={inputs.pctProc2}
                onChange={(e) => update('pctProc2', Number(e.target.value) || 0)}
                min={0}
                max={100}
                className="w-full h-12 px-4 rounded-lg border border-border font-mono text-sm text-foreground bg-background text-right transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="ej. 15"
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Section 2 — Otros ingresos */}
      <CollapsibleSection title="Otros ingresos" icon="fa-solid fa-coins">
        <div className="space-y-s2">
          {/* Bono */}
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="font-heading text-sm font-medium text-foreground">¿Recibes bono?</span>
              <p className="text-xs text-muted-foreground mt-0.5">Prima extralegal, bono de desempeño u otro pago adicional</p>
            </div>
            <YesNoToggle value={inputs.bonoOn} onChange={(v) => update('bonoOn', v)} />
          </div>
          {inputs.bonoOn && (
            <div className="bg-secondary rounded-lg p-s2 space-y-s2 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-s2">
                <div>
                  <label className="block text-xs font-body font-bold text-muted-foreground mb-1">Valor del bono</label>
                  <MoneyInput value={inputs.bono} onChange={(v) => update('bono', v)} />
                </div>
                <div>
                  <label className="block text-xs font-body font-bold text-muted-foreground mb-1">Mes en que lo recibes</label>
                  <select
                    value={inputs.mesBono}
                    onChange={(e) => update('mesBono', Number(e.target.value))}
                    className="w-full h-12 px-3 rounded-lg border border-border font-body text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-body font-bold text-muted-foreground mb-1">
                    ¿Es salarial?
                    <HelpTooltip text="Si no conoces este dato, consúltalo con el equipo de nómina de tu empresa." />
                  </label>
                  <PillToggle
                    options={[
                      { label: 'No (no SS)', value: 'no' },
                      { label: 'Sí (base SS)', value: 'si' },
                    ]}
                    value={inputs.bonoSal ? 'si' : 'no'}
                    onChange={(v) => update('bonoSal', v === 'si')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Auxilios */}
          <div className="border-t border-border pt-s2">
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="font-heading text-sm font-medium text-foreground">¿Recibes auxilios o bonificaciones no salariales?</span>
                <p className="text-xs text-muted-foreground mt-0.5">No forman parte de la base de seguridad social (INCNR)</p>
              </div>
              <YesNoToggle value={inputs.auxOn} onChange={(v) => update('auxOn', v)} />
            </div>
            {inputs.auxOn && (
              <div className="bg-secondary rounded-lg p-s2 space-y-s2 animate-fade-in">
                <PillToggle
                  options={[
                    { label: 'Fijo mensual', value: 'fijo' },
                    { label: 'Variable por mes', value: 'variable' },
                  ]}
                  value={inputs.auxTipo}
                  onChange={(v) => update('auxTipo', v as 'fijo' | 'variable')}
                />
                {inputs.auxTipo === 'fijo' ? (
                  <div>
                    <label className="block text-xs font-body font-bold text-muted-foreground mb-1">Valor del auxilio mensual</label>
                    <MoneyInput value={inputs.auxFijo} onChange={(v) => update('auxFijo', v)} />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {MESES.map((m, i) => (
                      <div key={i}>
                        <label className="block text-[10px] font-body font-bold text-muted-foreground uppercase mb-0.5">{m}</label>
                        <MoneyInput
                          value={inputs.auxMeses[i] || 0}
                          onChange={(v) => {
                            const newMeses = [...inputs.auxMeses];
                            newMeses[i] = v;
                            update('auxMeses', newMeses);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comisiones */}
          <div className="border-t border-border pt-s2">
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="font-heading text-sm font-medium text-foreground">¿Recibes comisiones?</span>
                <p className="text-xs text-muted-foreground mt-0.5">Sí forman parte de la base de seguridad social</p>
              </div>
              <YesNoToggle value={inputs.comOn} onChange={(v) => update('comOn', v)} />
            </div>
            {inputs.comOn && (
              <div className="bg-secondary rounded-lg p-s2 space-y-s2 animate-fade-in">
                <PillToggle
                  options={[
                    { label: 'Fija mensual', value: 'fijo' },
                    { label: 'Variable por mes', value: 'variable' },
                  ]}
                  value={inputs.comTipo}
                  onChange={(v) => update('comTipo', v as 'fijo' | 'variable')}
                />
                {inputs.comTipo === 'fijo' ? (
                  <div>
                    <label className="block text-xs font-body font-bold text-muted-foreground mb-1">Valor de la comisión mensual</label>
                    <MoneyInput value={inputs.comFijo} onChange={(v) => update('comFijo', v)} />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {MESES.map((m, i) => (
                      <div key={i}>
                        <label className="block text-[10px] font-body font-bold text-muted-foreground uppercase mb-0.5">{m}</label>
                        <MoneyInput
                          value={inputs.comMeses[i] || 0}
                          onChange={(v) => {
                            const newMeses = [...inputs.comMeses];
                            newMeses[i] = v;
                            update('comMeses', newMeses);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cesantías (read-only) */}
          <div className="border-t border-border pt-s2">
            <label className="block font-heading text-sm font-medium text-foreground mb-1.5">
              Cesantías del año
              <span className="ml-2 text-[10px] font-body font-bold bg-accent text-primary rounded px-2 py-0.5">
                Calculado automáticamente
              </span>
              <HelpTooltip text="Prestación social equivalente a un mes de salario por cada año trabajado. Solo aplica para contratos de salario ordinario." />
            </label>
            <div className="h-12 px-4 flex items-center rounded-lg border border-border bg-secondary font-mono text-sm text-muted-foreground">
              ${inputs.tipoSal === 'ordinario' ? inputs.salario.toLocaleString('es-CO') : '0 (integral)'}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 3 — Tus deducciones */}
      <CollapsibleSection title="Tus deducciones" icon="fa-solid fa-file-invoice-dollar">
        <div className="space-y-s3">
          <div>
            <label className="block font-heading text-sm font-medium text-foreground mb-1.5">
              Número de dependientes (máx. 4)
              <HelpTooltip text="Persona que depende económicamente de ti: cónyuge sin ingresos, hijos menores de 18 años, hijos entre 18 y 23 años que estudian, o familiares con limitación física o mental. Cada dependiente reduce tu base de retención. (Art. 387 + Ley 2277/2022)" />
            </label>
            <input
              type="number"
              value={inputs.dep}
              onChange={(e) => update('dep', Math.min(4, Math.max(0, Number(e.target.value) || 0)))}
              min={0}
              max={4}
              className="w-full h-12 px-4 rounded-lg border border-border font-mono text-sm text-foreground bg-background text-right transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <p className="text-[10px] text-muted-foreground mt-1 font-body italic">
              <strong>Art. 387:</strong> descuenta el 10% del ingreso hasta 32 UVT/mes — afecta retención y aporte óptimo (solo aplica por el 1.er dependiente dentro del 40%).
            </p>
          </div>

          <div>
            <label className="block font-heading text-sm font-medium text-foreground mb-1.5">
              Intereses vivienda mensual
              <span className="text-[10px] text-muted-foreground font-normal ml-1">(máx 100 UVT/mes · $5.237.400)</span>
              <HelpTooltip text="Si pagas un crédito hipotecario, puedes deducir los intereses pagados. El tope es de 100 UVT por mes ($5.237.400)." />
            </label>
            <MoneyInput value={inputs.intViv} onChange={(v) => update('intViv', v)} />
            <BarIndicator value={inputs.intViv} max={TOPE_VIV_MES} />
          </div>

          <div>
            <label className="block font-heading text-sm font-medium text-foreground mb-1.5">
              Salud prepagada mensual
              <span className="text-[10px] text-muted-foreground font-normal ml-1">(máx 16 UVT/mes · $837.984)</span>
              <HelpTooltip text="Los pagos de medicina prepagada son deducibles. El tope es de 16 UVT por mes ($837.984)." />
            </label>
            <MoneyInput value={inputs.salud} onChange={(v) => update('salud', v)} />
            <BarIndicator value={inputs.salud} max={TOPE_SAL_MES} />
          </div>

          <div>
            <label className="block font-heading text-sm font-medium text-foreground mb-1.5">
              Compras con factura electrónica anual
              <span className="text-[10px] text-muted-foreground font-normal ml-1">(deducción = 1% del valor, máx 240 UVT)</span>
              <HelpTooltip text="Art. 336 num. 5 · Ley 2277/2022 — Se deduce el 1% del valor ingresado, tope 240 UVT. Fuera del 40%/1.340 UVT. No afecta retención en la fuente ni el aporte óptimo." />
            </label>
            <MoneyInput value={inputs.facturas} onChange={(v) => update('facturas', v)} />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 4 — Tus aportes voluntarios */}
      <CollapsibleSection title="Tus aportes voluntarios" icon="fa-solid fa-piggy-bank">
        <div className="space-y-s3">
          <div>
            <label className="block font-heading text-sm font-medium text-foreground mb-1.5">
              Aporte voluntario FPV/AFC mensual
              <HelpTooltip text="Los Fondos de Pensiones Voluntarias (FPV) y las cuentas de Ahorro para el Fomento de la Construcción (AFC) permiten hacer aportes que reducen tu base de retención. Es el mecanismo más eficiente de optimización tributaria para empleados." />
            </label>
            <MoneyInput value={inputs.volFPV} onChange={(v) => update('volFPV', v)} />
          </div>

          <div>
            <label className="block font-heading text-sm font-medium text-foreground mb-1.5">
              Aporte voluntario al obl. (RAIS) mensual
              <span className="ml-1.5 text-[10px] font-body font-bold bg-accent text-primary rounded px-2 py-0.5">INCRGO</span>
              <HelpTooltip text="Aportes adicionales que haces directamente a tu fondo de pensiones obligatorio. Tienen tratamiento como INCRGO, diferente al FPV/AFC. Máx 25% del ingreso o 2.500 UVT/año." />
            </label>
            <MoneyInput value={inputs.volObl} onChange={(v) => update('volObl', v)} />
          </div>
        </div>
      </CollapsibleSection>

      {/* Navigation buttons */}
      <div className="flex gap-3 pt-s2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <i className="fa-solid fa-arrow-left mr-1" />
          Volver
        </Button>
        <Button onClick={onNext} className="flex-[2]">
          Ver mis resultados
          <i className="fa-solid fa-arrow-right ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default SimulatorForm;
