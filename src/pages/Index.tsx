import React, { useState } from 'react';
import ProgressSteps from '@/components/ProgressSteps';
import WelcomeScreen from '@/components/WelcomeScreen';
import SimulatorForm from '@/components/SimulatorForm';
import ResultsScreen from '@/components/ResultsScreen';
import ContactModal from '@/components/ContactModal';
import { SimulatorInputs, UVT, SMLV } from '@/lib/taxEngine';
import skandiaLogo from '@/assets/skandia-logo.svg';
import accaiLegal from '@/assets/accai-legal.png';

const STEPS = ['Tus datos', 'Simulación', 'Resultados'];

const defaultInputs: SimulatorInputs = {
  salario: 25000000,
  tipoSal: 'ordinario',
  indep: 0,
  bonoOn: false,
  bono: 0,
  mesBono: 1,
  bonoSal: false,
  auxOn: false,
  auxTipo: 'fijo',
  auxFijo: 0,
  auxMeses: Array(12).fill(0),
  comOn: false,
  comTipo: 'fijo',
  comFijo: 0,
  comMeses: Array(12).fill(0),
  proc: 1,
  pctProc2: 15,
  dep: 0,
  intViv: 0,
  salud: 0,
  volFPV: 0,
  volObl: 0,
  facturas: 0,
};

const formatCurrency = (v: number) => v.toLocaleString('es-CO');

const Index: React.FC = () => {
  const [step, setStep] = useState(1);
  const [showContactModal, setShowContactModal] = useState(false);
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    esCliente: false,
    tieneAsesor: false,
  });
  const [inputs, setInputs] = useState<SimulatorInputs>(defaultInputs);

  return (
    <div className="skandia-client-shell min-h-screen bg-background flex">
      {/* Sidebar (decorative, non-functional) */}
      <aside className="hidden md:flex sticky top-0 h-screen w-[88px] flex-col items-stretch border-r border-border bg-card z-40">
        <button type="button" className="h-14 flex items-center justify-center text-foreground/70 hover:text-primary" aria-label="Menú">
          <i className="fa-solid fa-bars text-lg" />
        </button>
        <nav className="flex-1 flex flex-col items-stretch py-2">
          {[
            { icon: 'fa-house', label: 'Inicio', active: true },
            { icon: 'fa-arrows-rotate', label: 'Transacciones' },
            { icon: 'fa-chart-pie', label: 'Gestión' },
            { icon: 'fa-file-lines', label: 'Documentos' },
            { icon: 'fa-circle-question', label: 'Ayuda' },
          ].map((it) => (
            <button
              key={it.label}
              type="button"
              className={`relative flex flex-col items-center gap-1 py-3 text-[10px] font-body transition-colors ${
                it.active ? 'text-primary' : 'text-foreground/60 hover:text-primary'
              }`}
            >
              {it.active && <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-primary" />}
              <i className={`fa-solid ${it.icon} text-lg`} />
              <span>{it.label}</span>
            </button>
          ))}
        </nav>
        <button type="button" className="flex flex-col items-center gap-1 py-4 text-[10px] font-body text-foreground/60 hover:text-primary border-t border-border">
          <i className="fa-solid fa-right-from-bracket text-lg" />
          <span>Salir</span>
        </button>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="px-4 md:px-s4 py-s2 flex items-center justify-between gap-3">
          <img src={skandiaLogo} alt="Skandia" className="h-6" />
          <div className="flex items-center gap-3">
            <button type="button" className="relative w-10 h-10 rounded-full border border-primary/30 bg-card flex items-center justify-center text-primary hover:bg-accent transition-colors" aria-label="Notificaciones">
              <i className="fa-solid fa-bell" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">1</span>
            </button>
            <button type="button" className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-body font-semibold px-4 h-10 rounded-full transition-colors">
              <i className="fa-solid fa-bolt" />
              Acciones rápidas
              <i className="fa-solid fa-chevron-down text-xs" />
            </button>
            <div className="hidden md:flex items-center gap-2 pl-2">
              <div className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center text-primary text-[11px] font-bold font-heading">AP</div>
              <span className="text-xs font-body text-foreground">
                Hola, <span className="font-bold">Apellido</span>
              </span>
              <i className="fa-solid fa-chevron-down text-[10px] text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-[800px] mx-auto w-full px-4 md:px-s6">
        <ProgressSteps currentStep={step} steps={STEPS} />
      </div>

      {/* Content */}
      <main className="max-w-[800px] mx-auto w-full px-4 md:px-s6 pb-20">
        {step === 1 && (
          <WelcomeScreen
            onNext={(data) => {
              setUserData(data);
              setStep(2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {step === 2 && (
          <SimulatorForm
            inputs={inputs}
            setInputs={setInputs}
            onBack={() => {
              setStep(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNext={() => {
              setStep(3);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {step === 3 && (
          <ResultsScreen
            inputs={inputs}
            userData={userData}
            onBack={() => {
              setStep(2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenContact={() => setShowContactModal(true)}
          />
        )}
      </main>

      <ContactModal open={showContactModal} onClose={() => setShowContactModal(false)} />

      <footer className="border-t border-border mt-8 py-6 px-4">
        <div className="max-w-[800px] mx-auto flex flex-col items-center gap-4">
          <button
            onClick={() => setShowContactModal(true)}
            className="flex items-center gap-1.5 text-[12px] font-body font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <i className="fa-solid fa-headset text-xs" />
            ¿Necesitas ayuda?
          </button>
          <img src={accaiLegal} alt="Vigilado Superintendencia Financiera de Colombia - Skandia AFP - ACCAI S.A." className="h-auto opacity-80" style={{ width: "34%" }} />
          <span className="text-[10px] font-body text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            UVT ${formatCurrency(UVT)} · SMLV ${formatCurrency(SMLV)} · 2026
          </span>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Index;
