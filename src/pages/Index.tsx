import React, { useState } from 'react';
import ProgressSteps from '@/components/ProgressSteps';
import WelcomeScreen from '@/components/WelcomeScreen';
import SimulatorForm from '@/components/SimulatorForm';
import ResultsScreen from '@/components/ResultsScreen';
import { SimulatorInputs } from '@/lib/taxEngine';

const STEPS = ['Tus datos', 'Simulación', 'Resultados'];

const defaultInputs: SimulatorInputs = {
  salario: 25000000,
  tipoSal: 'integral',
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

const Index: React.FC = () => {
  const [step, setStep] = useState(1);
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
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-[800px] mx-auto px-s6 md:px-s6 py-s2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-sm">S</span>
            </div>
            <span className="font-heading font-bold text-lg text-foreground">Skandia</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            UVT $52.374 · 2026
          </span>
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
          />
        )}
      </main>
    </div>
  );
};

export default Index;
