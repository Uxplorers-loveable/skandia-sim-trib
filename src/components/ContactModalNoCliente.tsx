import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ContactModalNoClienteProps {
  open: boolean;
  onClose: () => void;
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
    <div ref={ref} className="relative w-[100px] shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-10 w-full flex items-center gap-1.5 px-2.5 rounded-lg border border-border font-body text-sm text-foreground bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
      >
        <img
          src={`https://flagcdn.com/w40/${selected.iso}.png`}
          alt={selected.label}
          className="w-5 h-3.5 object-cover rounded-sm"
        />
        <span className="text-xs">{selected.code}</span>
        <i className="fa-solid fa-chevron-down text-[9px] text-muted-foreground ml-auto" />
      </button>
      {open && (
        <ul className="absolute bottom-full left-0 mb-1 w-[210px] max-h-44 overflow-y-auto bg-card border border-border rounded-lg shadow-lg z-50 py-1">
          {COUNTRY_CODES.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => { onChange(c.code); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm font-body hover:bg-secondary transition-colors ${c.code === value ? 'bg-secondary font-medium' : ''}`}
              >
                <img
                  src={`https://flagcdn.com/w40/${c.iso}.png`}
                  alt={c.label}
                  className="w-5 h-3.5 object-cover rounded-sm"
                />
                <span className="text-foreground">{c.label}</span>
                <span className="text-muted-foreground ml-auto text-xs">{c.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ContactModalNoCliente: React.FC<ContactModalNoClienteProps> = ({ open, onClose }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [countryCode, setCountryCode] = useState('+57');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = 'Ingresa tu nombre';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Ingresa un correo válido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      setSubmitted(true);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setNombre('');
    setEmail('');
    setTelefono('');
    setCountryCode('+57');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-s3 max-w-md w-full space-y-s2 animate-fade-in">
        {submitted ? (
          <>
            <div className="text-center space-y-3 py-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <i className="fa-solid fa-check text-2xl text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">¡Datos enviados!</h3>
              <p className="font-body text-sm text-muted-foreground">
                Hemos recibido tu información. Un asesor de Skandia se pondrá en contacto contigo pronto.
              </p>
            </div>
            <Button className="w-full" onClick={handleClose}>
              Cerrar
            </Button>
          </>
        ) : (
          <>
            <h3 className="font-heading text-lg font-bold text-foreground">¿Necesitas ayuda?</h3>
            <p className="font-body text-sm text-muted-foreground">
              Déjanos tus datos y un asesor de Skandia se comunicará contigo para ayudarte.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-heading text-xs font-medium text-foreground mb-1">
                  Nombre completo <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full h-10 px-3 rounded-lg border border-border font-body text-sm text-foreground bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block font-heading text-xs font-medium text-foreground mb-1">
                  Correo electrónico <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full h-10 px-3 rounded-lg border border-border font-body text-sm text-foreground bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block font-heading text-xs font-medium text-foreground mb-1">
                  Teléfono <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
                </label>
                <div className="flex gap-2">
                  <CountryCodePicker value={countryCode} onChange={setCountryCode} />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="300 123 4567"
                    className="w-full h-10 px-3 rounded-lg border border-border font-body text-sm text-foreground bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="bg-accent/50 rounded-lg p-s2 border border-primary/20">
              <p className="text-xs font-body text-muted-foreground">
                <i className="fa-solid fa-circle-info mr-1 text-primary" />
                Al enviar tus datos, un asesor de Skandia se pondrá en contacto contigo para brindarte orientación personalizada.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                <i className="fa-solid fa-paper-plane mr-2" />
                Enviar datos
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactModalNoCliente;
