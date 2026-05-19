import React, { useState } from 'react';
import ProgressSteps from '@/components/ProgressSteps';
import WelcomeScreen from '@/components/WelcomeScreen';
import SimulatorForm from '@/components/SimulatorForm';
import ResultsScreen from '@/components/ResultsScreen';
import ContactModal from '@/components/ContactModal';
import { SimulatorInputs, UVT, SMLV } from '@/lib/taxEngine';
import skandiaLogo from '@/assets/skandia-logo.svg';
import accaiLegal from '@/assets/accai-legal.png';
import portalIllustration from '@/assets/portal-clientes-illustration.png';

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

const IndexPortalClientes: React.FC = () => {
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
      {/* Sidebar (decorative) */}
      <aside className="hidden md:flex sticky top-0 h-screen w-[88px] flex-col items-stretch border-r border-border bg-card z-40">
        <button type="button" className="h-14 flex items-center justify-center text-foreground/70 hover:text-primary" aria-label="Menú">
          <i className="fa-solid fa-bars text-lg" />
        </button>
        <nav className="flex-1 flex flex-col items-stretch py-2">
          {[
            { icon: 'fa-house', label: 'Inicio', active: true },
            { icon: 'fa-hand-holding-dollar', label: 'Retiros' },
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
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="px-4 md:px-s4 py-s2 flex items-center gap-3">
            <img src={skandiaLogo} alt="Skandia" className="h-6" />
            <span className="text-muted-foreground/40 text-lg font-light">|</span>
            <span className="font-heading font-semibold text-foreground text-sm">Portal Clientes</span>
          </div>
        </header>

        {/* Two-column layout */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Left column - illustration */}
          <div className="lg:w-[42%] lg:min-h-[calc(100vh-57px)] bg-accent/40 flex flex-col items-center justify-center px-6 py-12 lg:py-16">
            <div className="max-w-sm w-full flex flex-col items-center text-center">
              <img
                src={portalIllustration}
                alt="Beneficio tributario"
                width={280}
                height={280}
                loading="lazy"
                className="w-[220px] h-[220px] lg:w-[280px] lg:h-[280px] object-contain mb-6"
              />
              <h1 className="font-heading font-bold text-foreground text-2xl lg:text-3xl mb-3">
                Beneficio tributario
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-5">
                Optimiza tus impuestos y paga menos en retención en la fuente, de forma ágil, fácil y segura.
              </p>
              <button
                onClick={() => setShowContactModal(true)}
                className="flex items-center gap-1.5 text-sm font-body font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <i className="fa-regular fa-circle-question" />
                Ayuda
              </button>
            </div>
          </div>

          {/* Right column - simulator */}
          <div className="lg:w-[58%] flex flex-col">
            {/* Breadcrumb */}
            <div className="w-full px-4 md:px-s4 pt-s3">
              <nav aria-label="Breadcrumb" className="font-body text-muted-foreground mb-s2">
                <ol className="flex items-center gap-2">
                  {step > 1 && (
                    <li>
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="text-primary hover:text-primary/80 transition-colors"
                        aria-label="Volver"
                      >
                        <i className="fa-solid fa-arrow-left text-xs" />
                      </button>
                    </li>
                  )}
                  <li><a href="#" className="hover:text-primary transition-colors text-xs">Inicio</a></li>
                  <li aria-hidden="true">/</li>
                  <li><a href="#" className="hover:text-primary transition-colors text-xs">Simuladores</a></li>
                  <li aria-hidden="true">/</li>
                  <li className="text-primary font-semibold text-xs">Beneficio tributario</li>
                </ol>
              </nav>
            </div>

            <div className="max-w-[800px] mx-auto w-full px-4 md:px-s6">
              <ProgressSteps currentStep={step} steps={STEPS} variant="bar" />
            </div>

            <main className="max-w-[800px] mx-auto w-full px-4 md:px-s6 pb-20 flex-1">
              {step === 1 && (
                <WelcomeScreen
                  hideClienteSwitch
                  hideDataModule
                  hideHeading
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
                  onBack={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  onNext={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              )}
              {step === 3 && (
                <ResultsScreen
                  inputs={inputs}
                  userData={userData}
                  onBack={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  onOpenContact={() => setShowContactModal(true)}
                />
              )}
            </main>

            <footer className="mt-8 py-6 px-4">
              <div className="max-w-[800px] mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
                <img src={accaiLegal} alt="Vigilado Superintendencia Financiera de Colombia - Skandia AFP - ACCAI S.A." className="h-auto opacity-80" style={{ width: "220px" }} />
                <span className="text-[10px] font-body text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  UVT ${formatCurrency(UVT)} · SMLV ${formatCurrency(SMLV)} · 2026
                </span>
              </div>
            </footer>
          </div>
        </div>
      </div>

      <ContactModal open={showContactModal} onClose={() => setShowContactModal(false)} />
    </div>
  );
};

export default IndexPortalClientes;