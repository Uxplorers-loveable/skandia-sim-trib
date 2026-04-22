import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { SimulatorResults, SimulatorInputs, fmtN, MESES, calculate } from '@/lib/taxEngine';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import InfoTooltip from '@/components/InfoTooltip';

interface ResultsScreenProps {
  inputs: SimulatorInputs;
  userData: { nombre: string; email: string; esCliente: boolean; tieneAsesor: boolean };
  onBack: () => void;
  onOpenContact: () => void;
}

const MetricCard: React.FC<{
  label: string;
  value: string;
  variant?: 'default' | 'highlight' | 'savings';
  tooltip?: string;
}> = ({ label, value, variant = 'default', tooltip }) => {
  const bg = variant === 'highlight' ? 'bg-accent border-primary' :
    variant === 'savings' ? 'bg-accent border-primary' : 'bg-card border-border';
  const textColor = variant === 'savings' ? 'text-primary' : 'text-foreground';

  return (
    <div className={`rounded-xl border p-s3 ${bg}`}>
      <p className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </p>
      <p className={`text-2xl font-heading font-bold font-body tracking-tight ${textColor}`}>{value}</p>
    </div>
  );
};

const ResultsScreen: React.FC<ResultsScreenProps> = ({ inputs, userData, onBack, onOpenContact }) => {
  const [showTable, setShowTable] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);

  const results = useMemo(() => calculate(inputs), [inputs]);

  // Monthly retention chart data
  const chartData = results.dataMes.map((d) => ({
    name: MESES[d.m],
    retencion: Math.round(d.reteM),
    alivios: Math.round(d.alivM),
  }));

  const reteMensualActual = results.reteTot / 12;
  const reteMensualOptima = (results.reteTot - results.ahorroOpt) / 12;
  const ahorroMensual = reteMensualActual - reteMensualOptima;

  // CTA scenario
  const getCtaScenario = () => {
    if (userData.esCliente && userData.tieneAsesor) return 'A';
    if (userData.esCliente && !userData.tieneAsesor) return 'B';
    return 'C';
  };
  const scenario = getCtaScenario();

  const ctaConfig = {
    A: {
      title: 'Tu asesor puede ayudarte a implementar el aporte sugerido',
      primary: 'Habla con tu asesor',
      primaryIcon: 'fa-user-tie',
    },
    B: {
      title: 'Solicita un asesor especializado en optimización tributaria',
      primary: 'Solicitar asesoría personalizada',
      primaryIcon: 'fa-user-plus',
    },
    C: {
      title: 'Descubre el valor de contar con un asesor Skandia para implementar tu estrategia',
      primary: 'Contactar con un asesor',
      primaryIcon: 'fa-building',
    },
  }[scenario];

  const formatTooltip = (value: number) => '$' + Math.abs(Math.round(value)).toLocaleString('es-CO');

  return (
    <div className="space-y-s3 animate-fade-in">
      {/* Annual tax summary */}
      <div className="bg-secondary/20 rounded-lg border border-border/60 p-s2">
        <h3 className="font-heading text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center">
          <i className="fa-solid fa-file-invoice text-muted-foreground/70 mr-1.5 text-[11px]" />
          Resumen tributario anual
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="p-2">
            <p className="text-[10px] font-body uppercase text-muted-foreground/80 flex items-center gap-1">
              Impuesto de renta anual
              <InfoTooltip text="Es el impuesto que tendrías que pagar al declarar renta, calculado sobre tu base gravable anual según la tabla del Art. 241 ET." />
            </p>
            <p className="text-sm font-body font-semibold text-foreground/80 mt-0.5">{fmtN(results.impActual)}</p>
          </div>
          <div className="p-2">
            <p className="text-[10px] font-body uppercase text-muted-foreground/80 flex items-center gap-1">
              Retención en la fuente anual
              <InfoTooltip text="Es el total de retenciones que tu empleador descontará de tu salario durante el año como anticipo del impuesto de renta." />
            </p>
            <p className="text-sm font-body font-semibold text-foreground/80 mt-0.5">{fmtN(results.reteTot)}</p>
          </div>
          <div className="p-2">
            <p className="text-[10px] font-body uppercase text-muted-foreground/80 flex items-center gap-1">
              {results.impCargo >= 0 ? 'Saldo a pagar estimado' : 'Saldo a favor estimado'}
              <InfoTooltip text="Diferencia entre tu impuesto de renta anual y la retención en la fuente. Si es positivo, deberás pagar al declarar; si es negativo, tendrías saldo a favor." />
            </p>
            <p className={`text-sm font-body font-semibold mt-0.5 ${results.impCargo >= 0 ? 'text-foreground/80' : 'text-primary/90'}`}>
              {fmtN(Math.abs(results.impCargo))}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly retention metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-s2">
        <MetricCard
          label="Retención mensual actual"
          value={fmtN(reteMensualActual)}
          tooltip="Es el promedio mensual que tu empleador te descuenta del salario como retención en la fuente con tu configuración actual."
        />
        <MetricCard
          label="Retención mensual óptima"
          value={fmtN(reteMensualOptima)}
          variant="highlight"
          tooltip="Es la retención mensual que tendrías si aplicas el aporte voluntario sugerido para optimizar tu carga tributaria."
        />
        <MetricCard
          label="Ahorro mensual potencial"
          value={fmtN(ahorroMensual)}
          variant="savings"
          tooltip="Es la diferencia entre tu retención actual y la óptima: el dinero que dejarías de descontarte cada mes al optimizar."
        />
      </div>

      {/* Optimal contribution card */}
      <div className="rounded-xl border-2 border-primary bg-accent p-s3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-check text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-heading font-bold uppercase tracking-wider text-primary mb-1">
              Aporte sugerido para maximizar tu beneficio tributario FPV — mensual
            </p>
            <p className="text-3xl font-heading font-bold font-body tracking-tight text-primary">
              {fmtN(results.xOptAdicional / 12)}
            </p>
            <p className="text-sm font-body text-muted-foreground mt-1">
              {results.subMsg}
            </p>
            <div className="grid grid-cols-2 gap-s2 mt-s2">
              <div>
                <p className="text-[10px] font-body font-bold uppercase text-muted-foreground flex items-center gap-1">
                  Ahorro impuesto anual
                  <InfoTooltip text="Es el dinero que dejarías de pagar en impuestos durante el año al realizar este aporte." />
                </p>
                <p className="text-lg font-body font-bold text-primary">{fmtN(results.ahorroOpt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-body font-bold uppercase text-muted-foreground flex items-center gap-1">
                  Retorno de la Inversión sobre aporte
                  <InfoTooltip text="Indica cuánto recuperas en ahorro tributario por cada peso aportado." />
                </p>
                <p className="text-lg font-body font-bold text-primary">{results.roi.toFixed(1)}%</p>
              </div>
            </div>

            {/* Actionable steps inside the card */}
            <div className="mt-s3 pt-s2 border-t border-primary/20">
              <p className="text-xs font-heading font-bold text-primary mb-2">
                <i className="fa-solid fa-list-check mr-1.5" />
                Pasos para implementar tu estrategia
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <p className="font-body text-xs text-foreground">
                    <strong>Abre o ajusta tu FPV:</strong> Si aún no tienes un Fondo Voluntario de Pensiones, solicita la apertura con tu asesor Skandia.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <p className="font-body text-xs text-foreground">
                    <strong>Configura aportes automáticos:</strong> Programa un débito mensual de <strong className="text-primary">{fmtN(results.xOptAdicional / 12)}</strong> para mantener la disciplina de ahorro.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <p className="font-body text-xs text-foreground">
                    <strong>Solicita el certificado tributario:</strong> Al cierre del año, descarga tu certificado para incluirlo en tu declaración de renta.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly table (collapsible) */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="w-full flex items-center gap-3 p-s3 hover:bg-secondary/50 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <i className="fa-solid fa-table text-sm text-primary" />
          </div>
          <span className="font-heading text-sm font-medium text-foreground flex-1 text-left">
            Ver desglose mes a mes
          </span>
          <i className={`fa-solid fa-chevron-${showTable ? 'up' : 'down'} text-xs text-muted-foreground`} />
        </button>
        {showTable && (
          <div className="px-s3 pb-s3 overflow-x-auto animate-fade-in">
            <table className="w-full text-xs font-body">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-heading font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Mes</th>
                  <th className="text-right py-2 px-2 font-heading font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Ingreso</th>
                  <th className="text-right py-2 px-2 font-heading font-bold text-muted-foreground uppercase text-[10px] tracking-wider">INCRGO</th>
                  <th className="text-right py-2 px-2 font-heading font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Alivios</th>
                  <th className="text-right py-2 px-2 font-heading font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Base</th>
                  <th className="text-right py-2 px-2 font-heading font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Retención</th>
                </tr>
              </thead>
              <tbody>
                {results.dataMes.map((d, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-2 px-2 font-heading font-bold text-foreground">{MESES[d.m]}</td>
                    <td className="py-2 px-2 text-right font-body text-foreground">{fmtN(d.ingM)}</td>
                    <td className="py-2 px-2 text-right font-body text-foreground">{fmtN(d.incrgoM)}</td>
                    <td className="py-2 px-2 text-right font-body text-foreground">{fmtN(d.alivM)}</td>
                    <td className="py-2 px-2 text-right font-body text-foreground">{fmtN(d.baseM)}</td>
                    <td className="py-2 px-2 text-right font-body font-bold text-foreground">{fmtN(d.reteM)}</td>
                  </tr>
                ))}
                <tr className="bg-secondary font-bold">
                  <td className="py-2 px-2 font-heading text-foreground">Total</td>
                  <td className="py-2 px-2 text-right font-body text-foreground">{fmtN(results.dataMes.reduce((s, d) => s + d.ingM, 0))}</td>
                  <td className="py-2 px-2 text-right font-body text-foreground">{fmtN(results.dataMes.reduce((s, d) => s + d.incrgoM, 0))}</td>
                  <td className="py-2 px-2 text-right font-body text-foreground">{fmtN(results.dataMes.reduce((s, d) => s + d.alivM, 0))}</td>
                  <td className="py-2 px-2 text-right font-body text-foreground">{fmtN(results.dataMes.reduce((s, d) => s + d.baseM, 0))}</td>
                  <td className="py-2 px-2 text-right font-body font-bold text-foreground">{fmtN(results.reteTot)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bar chart */}
      <div className="bg-card rounded-xl border border-border p-s3">
        <h3 className="font-heading text-sm font-bold text-foreground mb-s2">Retención mensual</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} barGap={2}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fontFamily: 'Open Sans', fill: '#666666' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fontFamily: 'Open Sans', fill: '#666666' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => '$' + (v / 1000000).toFixed(1) + 'M'}
              />
              <Tooltip
                formatter={(value: number) => formatTooltip(value)}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #dddddd',
                  fontFamily: 'Open Sans',
                  fontSize: '12px',
                  color: '#404040',
                }}
              />
              <Legend
                wrapperStyle={{ fontFamily: 'Open Sans', fontSize: '12px', fontWeight: 700, color: '#404040' }}
              />
              <Bar name="Retención mes" dataKey="retencion" fill="#00c73d" radius={[4, 4, 0, 0]} />
              <Line name="Alivios tributarios" dataKey="alivios" type="monotone" stroke="#ffae08" strokeWidth={2.5} dot={{ r: 4, fill: '#ffae08' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-card rounded-xl border border-border p-s3 space-y-s2">
        <h3 className="font-heading text-lg font-bold text-foreground">
          {ctaConfig.title}
        </h3>
        <p className="font-body text-sm text-muted-foreground">
          Con base en tu simulación, {userData.nombre.split(' ')[0]}, puedes optimizar tu retención aportando{' '}
          <strong className="text-primary">{fmtN(results.xOptAdicional / 12)}/mes</strong> a FPV/AFC y ahorrar{' '}
          <strong className="text-primary">{fmtN(results.ahorroOpt)}</strong> al año en impuestos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1" onClick={onOpenContact}>
            <i className={`fa-solid ${ctaConfig.primaryIcon} mr-2`} />
            {ctaConfig.primary}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setShowEmailConfirm(true);
              setTimeout(() => setShowEmailConfirm(false), 4000);
            }}
          >
            <i className="fa-solid fa-envelope mr-2" />
            Recibir resultados por correo
          </Button>
        </div>
        {showEmailConfirm && (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 animate-fade-in">
            <i className="fa-solid fa-circle-check text-primary" />
            <p className="text-sm font-body text-foreground">
              Hemos enviado los resultados de tu simulación a <span className="font-medium">{userData.email}</span>.
            </p>
          </div>
        )}
      </div>

      {/* Corporate savings banner — only if user has salarial bonus */}
      {inputs.bonoOn && (
        <div className="bg-foreground px-s3 py-4 flex items-center gap-4 rounded-sm">
          <div className="w-10 h-10 rounded-full bg-warning flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-lightbulb text-foreground text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-sm font-bold text-primary-foreground">
              ¿Conoces los planes de ahorro corporativo?
            </p>
            <p className="font-body text-xs text-primary-foreground/70 mt-0.5">
              Una herramienta de planeación tributaria y creación de capital para ti y tu empresa.
            </p>
          </div>
          <Button
            className="rounded-full flex-shrink-0"
            onClick={() => window.open('https://planescorpskandia.netlify.app', '_blank')}
          >
            Conoce más
            <i className="fa-solid fa-arrow-right ml-1" />
          </Button>
        </div>
      )}

      {/* Disclaimers */}
      <div className="space-y-3 pt-s2">
        <p className="text-[11px] font-body text-muted-foreground leading-relaxed">
          <i className="fa-solid fa-circle-info mr-1 text-muted-foreground/60" />
          Esta simulación es exclusivamente tributaria, no constituye una recomendación de inversión ni una asesoría personalizada. El aporte sugerido maximiza el beneficio fiscal pero no evalúa el perfil de riesgo, horizonte de inversión ni necesidades de liquidez del usuario.
        </p>
        <p className="text-[11px] font-body text-muted-foreground leading-relaxed">
          <i className="fa-solid fa-circle-info mr-1 text-muted-foreground/60" />
          Esta simulación calcula el beneficio tributario estimado de aportar a un Fondo Voluntario de Pensiones. No constituye asesoría de inversión ni recomendación profesional. La decisión de invertir en un FPV debe considerar tu perfil de riesgo, horizonte de inversión y necesidades de liquidez. Las rentabilidades pasadas no garantizan rentabilidades futuras. Consulta con un asesor para una evaluación integral.
        </p>
        <p className="text-[11px] font-body text-muted-foreground leading-relaxed">
          <i className="fa-solid fa-circle-info mr-1 text-muted-foreground/60" />
          El beneficio tributario de los aportes a FPV está condicionado a que los recursos permanezcan en el fondo por mínimo 10 años o hasta el cumplimiento de requisitos para acceder a la pensión (Art. 126-1 E.T.). El retiro anticipado genera retención en la fuente sobre el valor retirado.
        </p>
      </div>

      {/* Back button */}
      <div className="pt-s2">
        <Button variant="ghost" onClick={onBack} className="w-full">
          <i className="fa-solid fa-arrow-left mr-2" />
          Ajustar mis datos
        </Button>
      </div>

    </div>
  );
};

export default ResultsScreen;
