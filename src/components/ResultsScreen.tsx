import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { SimulatorResults, SimulatorInputs, fmtN, MESES, calculate } from '@/lib/taxEngine';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ResultsScreenProps {
  inputs: SimulatorInputs;
  userData: { nombre: string; email: string; esCliente: boolean; tieneAsesor: boolean };
  onBack: () => void;
}

const MetricCard: React.FC<{
  label: string;
  value: string;
  variant?: 'default' | 'highlight' | 'savings';
}> = ({ label, value, variant = 'default' }) => {
  const bg = variant === 'highlight' ? 'bg-accent border-primary' :
    variant === 'savings' ? 'bg-accent border-primary' : 'bg-card border-border';
  const textColor = variant === 'savings' ? 'text-primary' : 'text-foreground';

  return (
    <div className={`rounded-xl border p-s3 ${bg}`}>
      <p className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-heading font-bold font-body tracking-tight ${textColor}`}>{value}</p>
    </div>
  );
};

const ResultsScreen: React.FC<ResultsScreenProps> = ({ inputs, userData, onBack }) => {
  const [showTable, setShowTable] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const results = useMemo(() => calculate(inputs), [inputs]);

  // Monthly retention chart data
  const chartData = results.dataMes.map((d) => ({
    name: MESES[d.m],
    actual: Math.round(d.reteM),
    optima: Math.round(
      (() => {
        // Compute optimal retention per month (simplified: proportional reduction)
        const totalActual = results.reteTot;
        const totalOptimal = totalActual - results.ahorroOpt;
        if (totalActual === 0) return 0;
        return d.reteM * (totalOptimal / totalActual);
      })()
    ),
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
      {/* Top metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-s2">
        <MetricCard
          label="Retención mensual actual"
          value={fmtN(reteMensualActual)}
        />
        <MetricCard
          label="Retención mensual óptima"
          value={fmtN(reteMensualOptima)}
          variant="highlight"
        />
        <MetricCard
          label="Ahorro mensual potencial"
          value={fmtN(ahorroMensual)}
          variant="savings"
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
              Aporte sugerido para maximizar tu beneficio tributario FPV/AFC — mensual
            </p>
            <p className="text-3xl font-heading font-bold font-body tracking-tight text-primary">
              {fmtN(results.xOptAdicional / 12)}
            </p>
            <p className="text-sm font-body text-muted-foreground mt-1">
              {results.subMsg}
            </p>
            <div className="grid grid-cols-2 gap-s2 mt-s2">
              <div>
                <p className="text-[10px] font-body font-bold uppercase text-muted-foreground">Ahorro impuesto anual</p>
                <p className="text-lg font-body font-bold text-primary">{fmtN(results.ahorroOpt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-body font-bold uppercase text-muted-foreground">Retorno de la Inversión sobre aporte</p>
                <p className="text-lg font-body font-bold text-primary">{results.roi.toFixed(1)}%</p>
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
        <h3 className="font-heading text-sm font-bold text-foreground mb-s2">Retención mensual: actual vs. óptima</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={2}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fontFamily: 'Open Sans' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => '$' + (v / 1000000).toFixed(1) + 'M'}
              />
              <Tooltip
                formatter={(value: number) => formatTooltip(value)}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  fontFamily: 'IBM Plex Mono',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontFamily: 'Open Sans', fontSize: '12px', fontWeight: 700 }}
              />
              <Bar name="Retención actual" dataKey="actual" fill="#8ba2c1" radius={[4, 4, 0, 0]} />
              <Bar name="Retención óptima" dataKey="optima" fill="#00c73d" radius={[4, 4, 0, 0]} />
            </BarChart>
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
          <Button className="flex-1" onClick={() => setShowContactModal(true)}>
            <i className={`fa-solid ${ctaConfig.primaryIcon} mr-2`} />
            {ctaConfig.primary}
          </Button>
          <Button variant="outline" className="flex-1">
            <i className="fa-solid fa-envelope mr-2" />
            Recibir resultados por correo
          </Button>
        </div>
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

      {/* Contact confirmation modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-s3 max-w-md w-full space-y-s2 animate-fade-in">
            <h3 className="font-heading text-lg font-bold text-foreground">Confirmar contacto</h3>
            <p className="font-body text-sm text-muted-foreground">
              Se enviará la siguiente información a tu asesor:
            </p>
            <div className="bg-secondary rounded-lg p-s2 space-y-1 text-sm font-body">
              <p><strong>Nombre:</strong> {userData.nombre}</p>
              <p><strong>Correo:</strong> {userData.email}</p>
              <p><strong>Aporte óptimo sugerido:</strong> {fmtN(results.xOptAdicional / 12)}/mes</p>
              <p><strong>Ahorro anual estimado:</strong> {fmtN(results.ahorroOpt)}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowContactModal(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={() => setShowContactModal(false)}>
                Confirmar envío
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsScreen;
