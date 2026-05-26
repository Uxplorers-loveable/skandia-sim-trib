import React, { useRef, useState } from 'react';
import ProgressSteps from '@/components/ProgressSteps';
import WelcomeScreen from '@/components/WelcomeScreen';
import SimulatorForm from '@/components/SimulatorForm';
import ResultsScreen from '@/components/ResultsScreen';
import ContactModal from '@/components/ContactModal';
import { SimulatorInputs, UVT, SMLV } from '@/lib/taxEngine';
import { Button } from '@/components/ui/button';
import skandiaLogo from '@/assets/skandia-logo.svg';
import accaiLegal from '@/assets/accai-legal.png';
import portalIllustration from '@/assets/portal-clientes-illustration.webp';
import simBeneficio from '@/assets/sim-beneficio.webp';
import simFlujoCaja from '@/assets/sim-flujo-caja.webp';
import simOtros from '@/assets/sim-otros.webp';

const STEPS = ['Tus datos', 'Tu ingreso', 'Otros ingresos', 'Deducciones', 'Aportes voluntarios', 'Resultados'];

// Step indices (1-based to match `step` state)
const STEP_DATOS = 1;
const STEP_INGRESO = 2;
const STEP_OTROS = 3;
const STEP_DEDUC = 4;
const STEP_APORTES = 5;
const STEP_RESULTS = 6;

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
  const [view, setView] = useState<'simuladores' | 'simulator'>('simuladores');
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
  const rightColRef = useRef<HTMLDivElement>(null);
  const scrollTop = () => rightColRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  const [salarioError, setSalarioError] = useState<string>('');

  const goTo = (s: number) => {
    setStep(s);
    scrollTop();
  };

  const sectionFor = (s: number): 'ingreso' | 'otros' | 'deducciones' | 'aportes' | null => {
    if (s === STEP_INGRESO) return 'ingreso';
    if (s === STEP_OTROS) return 'otros';
    if (s === STEP_DEDUC) return 'deducciones';
    if (s === STEP_APORTES) return 'aportes';
    return null;
  };

  const handleNextFromForm = () => {
    if (step === STEP_INGRESO && (!inputs.salario || inputs.salario <= 0)) {
      setSalarioError('Ingresa tu salario mensual para continuar.');
      return;
    }
    setSalarioError('');
    goTo(step + 1);
  };

  return (
    <div className="skandia-client-shell skandia-portal-shell lg:h-screen lg:overflow-hidden bg-background flex">
      {/* Sidebar (decorative, non-functional) - mismo que versión clientes */}
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

      <div className="flex-1 min-w-0 flex flex-col lg:h-screen">
        {/* Header - mismo que versión clientes */}
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

        {/* Two-column layout */}
        {view === 'simuladores' ? (
          <main className="flex-1 min-h-0 overflow-y-auto bg-background">
            <div className="w-full px-4 md:px-s6 py-s4">
              <nav aria-label="Breadcrumb" className="font-body text-muted-foreground mb-s3">
                <ol className="flex items-center gap-2 text-xs">
                  <li>
                    <a href="#" className="text-primary hover:text-primary/80 transition-colors mr-1" aria-label="Volver">
                      <i className="fa-solid fa-arrow-left text-xs" />
                    </a>
                  </li>
                  <li><a href="#" className="hover:text-primary transition-colors">Inicio</a></li>
                  <li aria-hidden="true">/</li>
                  <li className="text-primary font-semibold">Simuladores</li>
                </ol>
              </nav>
              <h1 className="font-heading font-bold text-foreground md:text-4xl mb-2 text-2xl">
                Simuladores
              </h1>
              <p className="font-body text-sm md:text-base text-muted-foreground mb-s4 w-full">
                Explora nuestros simuladores y proyecta tus decisiones financieras de forma ágil, fácil y segura.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {[
                  {
                    img: simBeneficio,
                    title: 'Simulador de beneficio tributario',
                    desc: 'Optimiza tus impuestos y paga menos en retención en la fuente.',
                    onClick: () => setView('simulator'),
                  },
                  {
                    img: simFlujoCaja,
                    title: 'Simulador de flujo de caja',
                    desc: 'Planea y proyecta tus ingresos y gastos para tomar mejores decisiones.',
                    onClick: () => {},
                  },
                  {
                    img: simOtros,
                    title: 'Otros simuladores',
                    desc: 'Herramientas que te ayudarán a conocer la proyección de tus inversiones a futuro.',
                    href: 'https://portal.skandia.com.co/mercadeo/distribuidores/simuladores_planeacion_financiera/index.php?idSession=82e-326d2edfsdfds',
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="group w-full bg-card rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] transition-shadow p-6 flex flex-col items-center text-center"
                  >
                    <img src={card.img} alt={card.title} className="hidden lg:block h-[108px] w-auto object-contain mb-s3" />
                    <h2 className="font-heading font-bold text-foreground text-lg mb-2">
                      {card.title}
                    </h2>
                    <p className="font-body text-sm text-muted-foreground mb-s3 flex-1">
                      {card.desc}
                    </p>
                    {'href' in card && card.href ? (
                      <a
                        href={card.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-2 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border-2 border-primary text-primary font-heading font-bold text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        Seleccionar
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={card.onClick}
                        className="w-full mt-2 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border-2 border-primary text-primary font-heading font-bold text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        Seleccionar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </main>
        ) : (
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
          {/* Left column - illustration (solo desktop) */}
          <div className="hidden lg:flex lg:w-[42%] lg:h-full lg:overflow-hidden bg-[#EDFEFA] flex-col px-6">
            {/* Breadcrumb aligned with progress bar */}
            <nav aria-label="Breadcrumb" className="font-body text-muted-foreground w-full pt-s3">
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
                <li><button type="button" onClick={() => setView('simuladores')} className="hover:text-primary transition-colors text-xs">Inicio</button></li>
                <li aria-hidden="true">/</li>
                <li><button type="button" onClick={() => setView('simuladores')} className="hover:text-primary transition-colors text-xs">Simuladores</button></li>
                <li aria-hidden="true">/</li>
                <li className="text-primary font-semibold text-xs">Beneficio tributario</li>
              </ol>
            </nav>
            <div className="max-w-sm w-full mx-auto flex-1 flex flex-col items-center justify-center text-center py-12 lg:py-16">
              <img
                src={portalIllustration}
                alt="Beneficio tributario"
                width={180}
                height={180}
                loading="lazy"
                className="w-[180px] h-[180px] object-contain mb-6"
              />
              <h1 className="font-heading font-bold text-foreground text-2xl lg:text-3xl mb-3">
                Beneficio tributario
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-5">
                Optimiza tus impuestos y paga menos en retención en la fuente, de forma ágil, fácil y segura.
              </p>
              <button
                onClick={() => setShowContactModal(true)}
                className="flex items-center gap-1.5 text-sm font-body font-medium text-[#0099DE] hover:opacity-80 transition-opacity"
              >
                <i className="fa-regular fa-circle-question" />
                Ayuda
              </button>
            </div>
          </div>

          {/* Right column - simulator (scrollable) */}
          <div ref={rightColRef} className="lg:w-[58%] flex flex-col lg:h-full lg:overflow-y-auto">
            {/* Miga de pan mobile/tablet - todas las páginas */}
            <div className="lg:hidden bg-background px-4 pt-4 pb-2">
              <nav aria-label="Breadcrumb" className="font-body text-muted-foreground">
                <ol className="flex items-center gap-2">
                  {step > 1 && (
                    <li>
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="text-primary hover:text-primary/80 transition-colors mr-1"
                        aria-label="Volver"
                      >
                        <i className="fa-solid fa-arrow-left text-sm" />
                      </button>
                    </li>
                  )}
                  <li><button type="button" onClick={() => setView('simuladores')} className="hover:text-primary transition-colors text-xs">Inicio</button></li>
                  <li aria-hidden="true">/</li>
                  <li><button type="button" onClick={() => setView('simuladores')} className="hover:text-primary transition-colors text-xs">Simuladores</button></li>
                  <li aria-hidden="true">/</li>
                  <li className="text-primary font-semibold text-xs">Beneficio tributario</li>
                </ol>
              </nav>
            </div>
            {/* Encabezado simplificado mobile/tablet - solo primer paso */}
            {step === STEP_DATOS && (
              <div className="lg:hidden bg-background px-4 pb-6">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h1 className="font-heading font-bold text-foreground text-2xl">
                    Beneficio tributario
                  </h1>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="inline-flex items-center gap-1.5 text-sm font-body font-medium text-[#0099DE] hover:opacity-80 transition-opacity mt-1 shrink-0"
                  >
                    <i className="fa-regular fa-circle-question" />
                    Ayuda
                  </button>
                </div>
                <p className="font-body text-sm text-muted-foreground">
                  Optimiza tus impuestos y paga menos en retención en la fuente, de forma ágil, fácil y segura.
                </p>
              </div>
            )}
            <div className="max-w-[800px] mx-auto w-full px-4 md:px-s6 pt-s3">
              <ProgressSteps currentStep={step} steps={STEPS} variant="bar" />
            </div>

            <main className="max-w-[800px] mx-auto w-full px-4 md:px-s6 pb-20 flex-1">
              {step === STEP_DATOS && (
              <WelcomeScreen
                hideClienteSwitch
                hideDataModule
                hideHeading
                portalClientes
                onNext={(data) => {
                  setUserData(data);
                  goTo(STEP_INGRESO);
                }}
              />
              )}
              {sectionFor(step) && (
                <div className="animate-fade-in">
                  <SimulatorForm
                    inputs={inputs}
                    setInputs={setInputs}
                    section={sectionFor(step)!}
                  />
                  {step === STEP_INGRESO && salarioError && (
                    <p className="text-xs text-destructive font-body font-bold mt-2">{salarioError}</p>
                  )}
                  <div className="flex gap-3 pt-s3">
                    <Button variant="outline" onClick={() => goTo(step - 1)} className="flex-1">
                      Volver
                    </Button>
                    <Button onClick={handleNextFromForm} className="flex-[2]">
                      {step === STEP_APORTES ? 'Ver mis resultados' : 'Continuar'}
                    </Button>
                  </div>
                </div>
              )}
              {step === STEP_RESULTS && (
                <ResultsScreen
                  inputs={inputs}
                  userData={userData}
                  onBack={() => goTo(STEP_APORTES)}
                  onOpenContact={() => setShowContactModal(true)}
                  portalClientes
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
        )}
      </div>

      <ContactModal open={showContactModal} onClose={() => setShowContactModal(false)} />
    </div>
  );
};

export default IndexPortalClientes;