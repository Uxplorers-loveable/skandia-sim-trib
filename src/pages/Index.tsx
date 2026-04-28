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
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="max-w-[800px] mx-auto px-4 md:px-s6 py-s2 flex items-center justify-between">
          <img src={skandiaLogo} alt="Skandia" className="h-5" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowContactModal(true)}
              className="flex items-center gap-1.5 text-[11px] font-body font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <i className="fa-solid fa-headset text-xs" />
              ¿Necesitas ayuda?
            </button>
            <span className="text-[10px] font-body text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              UVT ${formatCurrency(UVT)} · SMLV ${formatCurrency(SMLV)} · 2026
            </span>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-[800px] mx-auto px-4 md:px-s6">
        <ProgressSteps currentStep={step} steps={STEPS} />
      </div>

      {/* Content */}
      <main className="max-w-[800px] mx-auto px-4 md:px-s6 pb-20">
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
        <div className="max-w-[800px] mx-auto flex justify-center">
          <img src={accaiLegal} alt="Vigilado Superintendencia Financiera de Colombia - Skandia AFP - ACCAI S.A." className="h-auto opacity-80" style={{ width: "20%" }} />
        </div>
      </footer>
    </div>
  );
};

export default Index;
