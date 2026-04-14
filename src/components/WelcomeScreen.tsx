import React, { useState } from 'react';
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

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [esCliente, setEsCliente] = useState(false);
  const [tieneAsesor, setTieneAsesor] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!nombre.trim()) errs.nombre = 'Ingresa tu nombre completo para personalizar tu simulación.';
    if (!email.trim()) errs.email = 'Necesitamos tu correo para enviarte los resultados.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Revisa que el correo tenga el formato correcto, por ejemplo: nombre@correo.com';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({ nombre, email, telefono, esCliente, tieneAsesor });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-s5">
        <h1 className="font-heading font-bold text-[32px] leading-[40px] text-foreground mb-s2">
          Optimiza tus impuestos y paga menos en retención en la fuente.
        </h1>
        <p className="font-heading text-base text-foreground mb-3 font-medium">Qué esperar con este simulador:</p>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-primary text-lg" />
            </div>
            <p className="font-heading text-sm font-semibold text-foreground">Ahorro fiscal</p>
            <p className="font-body text-xs text-muted-foreground">Descubre cuánto puedes ahorrar con tu aporte óptimo a FPV/AFC.</p>
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
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="300 123 4567"
              className="w-full h-12 px-4 rounded-lg border border-border font-body text-sm text-foreground bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
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

          {/* Asesor asignado (conditional) */}
          {esCliente && (
            <div className="flex items-center justify-between py-2 animate-fade-in">
              <span className="font-heading text-sm font-medium text-foreground">
                ¿Tienes asesor asignado?
              </span>
              <Switch checked={tieneAsesor} onCheckedChange={setTieneAsesor} />
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 text-xs text-muted-foreground font-body">
          <i className="fa-solid fa-shield-check text-primary mt-0.5" />
          <p>
            Tus datos se usan exclusivamente para personalizar tu simulación y facilitar el contacto con tu asesor.
            No almacenamos información en el navegador.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
        >
          Iniciar simulación
          <i className="fa-solid fa-arrow-right ml-1" />
        </Button>
      </form>
    </div>
  );
};

export default WelcomeScreen;
