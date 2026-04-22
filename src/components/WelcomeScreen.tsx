import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

interface WelcomeScreenProps {
  onNext: (data: {
    nombre: string;
    email: string;
    telefono: string;
    esCliente: boolean;
    tieneAsesor: boolean;
  }) => void;
}

const COUNTRY_CODES = [
  { code: '+57', iso: 'co', label: 'Colombia' },
  { code: '+1', iso: 'us', label: 'Estados Unidos' },
  { code: '+52', iso: 'mx', label: 'México' },
  { code: '+34', iso: 'es', label: 'España' },
  { code: '+51', iso: 'pe', label: 'Perú' },
  { code: '+56', iso: 'cl', label: 'Chile' },
  { code: '+54', iso: 'ar', label: 'Argentina' },
  { code: '+593', iso: 'ec', label: 'Ecuador' },
  { code: '+507', iso: 'pa', label: 'Panamá' },
];

const CountryCodePicker: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = COUNTRY_CODES.find(c => c.code === value) || COUNTRY_CODES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-[105px] shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-12 w-full flex items-center gap-2 px-3 rounded-lg border border-border font-body text-sm text-foreground bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
      >
        <img
          src={`https://flagcdn.com/w40/${selected.iso}.png`}
          alt={selected.label}
          className="w-6 h-4 object-cover rounded-sm"
        />
        <span>{selected.code}</span>
        <i className="fa-solid fa-chevron-down text-[10px] text-muted-foreground ml-auto" />
      </button>
      {open && (
        <ul className="absolute top-full left-0 mt-1 w-[220px] max-h-52 overflow-y-auto bg-card border border-border rounded-lg shadow-lg z-50 py-1">
          {COUNTRY_CODES.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => { onChange(c.code); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-body hover:bg-secondary transition-colors ${c.code === value ? 'bg-secondary font-medium' : ''}`}
              >
                <img
                  src={`https://flagcdn.com/w40/${c.iso}.png`}
                  alt={c.label}
                  className="w-6 h-4 object-cover rounded-sm"
                />
                <span className="text-foreground">{c.label}</span>
                <span className="text-muted-foreground ml-auto">{c.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [countryCode, setCountryCode] = useState('+57');
  const [esCliente, setEsCliente] = useState(false);
  const [tieneAsesor, setTieneAsesor] = useState(false);
  const [politica, setPolitica] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPrepModal, setShowPrepModal] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!nombre.trim()) errs.nombre = 'Ingresa tu nombre completo para personalizar tu simulación.';
    if (!email.trim()) errs.email = 'Necesitamos tu correo para enviarte los resultados.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Revisa que el correo tenga el formato correcto, por ejemplo: nombre@correo.com';
    if (!politica) errs.politica = 'Debes aceptar la Política de Tratamiento de Datos Personales para continuar.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Revisa que el correo tenga el formato correcto, por ejemplo: nombre@correo.com';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowPrepModal(true);
    }
  };

  const handleContinue = () => {
    setShowPrepModal(false);
    onNext({ nombre, email, telefono: telefono ? `${countryCode} ${telefono}` : '', esCliente, tieneAsesor });
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-s5">
        <h1 className="font-heading font-bold text-[32px] leading-[40px] text-foreground mb-s2">
          Optimiza tus impuestos y paga menos en retención en la fuente.
        </h1>
        <p className="font-heading text-base text-foreground mb-3 font-medium">Qué puedes esperar con este simulador:</p>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-primary text-lg" />
            </div>
            <p className="font-heading text-sm font-semibold text-foreground">Ahorro fiscal</p>
            <p className="font-body text-xs text-muted-foreground">Descubre cuánto puedes ahorrar con tu aporte óptimo al Fondo de Pensión Voluntaria.</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <i className="fa-solid fa-user-tie text-primary text-lg" />
            </div>
            <p className="font-heading text-sm font-semibold text-foreground">Asesoría personalizada</p>
            <p className="font-body text-xs text-muted-foreground">Recibe una recomendación y conéctate con tu asesor Skandia.</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <i className="fa-solid fa-clock text-primary text-lg" />
            </div>
            <p className="font-heading text-sm font-semibold text-foreground">Rápido y fácil</p>
            <p className="font-body text-xs text-muted-foreground">Completa la simulación en menos de 5 minutos.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-s3">
        <div className="bg-card rounded-xl border border-border p-s3 space-y-s3">
          {/* Nombre */}
          <div>
            <label className="block font-heading text-sm font-medium text-foreground mb-1.5">
              Nombre completo <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: María Alejandra Gómez"
              className={`w-full h-12 px-4 rounded-lg border font-body text-sm text-foreground bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                errors.nombre ? 'border-destructive ring-2 ring-destructive/20' : 'border-border'
              }`}
            />
            {errors.nombre && (
              <p className="text-xs text-destructive font-body font-bold mt-1.5">
                {errors.nombre}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block font-heading text-sm font-medium text-foreground mb-1.5">
              Correo electrónico <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@correo.com"
              className={`w-full h-12 px-4 rounded-lg border font-body text-sm text-foreground bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                errors.email ? 'border-destructive ring-2 ring-destructive/20' : 'border-border'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-destructive font-body font-bold mt-1.5">
                {errors.email}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block font-heading text-sm font-medium text-foreground mb-1.5">
              Teléfono de contacto <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
            </label>
            <div className="flex gap-2">
              <CountryCodePicker value={countryCode} onChange={setCountryCode} />
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="300 123 4567"
                className="w-full h-12 px-4 rounded-lg border border-border font-body text-sm text-foreground bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-body">
              Tu teléfono nos permite agilizar el contacto con tu asesor si lo necesitas.
            </p>
          </div>

          {/* Cliente Skandia */}
          <div className="flex items-center justify-between py-2">
            <span className="font-heading text-sm font-medium text-foreground">
              ¿Eres cliente Skandia?
            </span>
            <Switch checked={esCliente} onCheckedChange={setEsCliente} />
          </div>

        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="politica"
            checked={politica}
            onCheckedChange={(checked) => setPolitica(checked === true)}
            className="mt-0.5"
          />
          <label htmlFor="politica" className="text-xs text-muted-foreground font-body cursor-pointer">
            He leído y acepto la{' '}
            <a
              href="https://www.skandia.co/politica-de-tratamiento-de-informacion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              Política de Tratamiento de Datos Personales
            </a>{' '}
            de Skandia. Autorizo el tratamiento de mis datos para la personalización de esta simulación y, si lo solicito, para el contacto con un asesor.
          </label>
        </div>
        {errors.politica && (
          <p className="text-xs text-destructive font-body font-bold -mt-1">
            {errors.politica}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
        >
          Iniciar simulación
          <i className="fa-solid fa-arrow-right ml-1" />
        </Button>
      </form>

      {/* Preparation modal */}
      {showPrepModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-s3 max-w-md w-full space-y-s2 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-clipboard-list text-primary text-lg" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">Antes de comenzar</h3>
            </div>
            <p className="font-body text-sm text-muted-foreground">
              Para obtener resultados más precisos, te recomendamos tener a la mano la siguiente información:
            </p>

            <div className="space-y-3">
              <div className="bg-secondary rounded-lg p-s2">
                <p className="text-xs font-heading font-bold uppercase tracking-wider text-primary mb-1.5">
                  <i className="fa-solid fa-money-bill-wave mr-1.5" />
                  Tu ingreso
                </p>
                <p className="text-xs font-body text-muted-foreground">Auxilios, bonos, comisiones</p>
              </div>

              <div className="bg-secondary rounded-lg p-s2">
                <p className="text-xs font-heading font-bold uppercase tracking-wider text-primary mb-1.5">
                  <i className="fa-solid fa-receipt mr-1.5" />
                  Tus deducciones
                </p>
                <p className="text-xs font-body text-muted-foreground">Dependientes, intereses de vivienda, salud prepagada, compras electrónicas</p>
              </div>

              <div className="bg-secondary rounded-lg p-s2">
                <p className="text-xs font-heading font-bold uppercase tracking-wider text-primary mb-1.5">
                  <i className="fa-solid fa-piggy-bank mr-1.5" />
                  Aportes voluntarios
                </p>
                <p className="text-xs font-body text-muted-foreground">Fondo de Pensiones Voluntarias (FPV), Ahorro para el Fomento de la Construcción (AFC)</p>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setShowPrepModal(false)}>
                Volver
              </Button>
              <Button className="flex-1" onClick={handleContinue}>
                Continuar
                <i className="fa-solid fa-arrow-right ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
