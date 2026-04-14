import React from 'react';
import { Button } from '@/components/ui/button';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-s3 max-w-md w-full space-y-s2 animate-fade-in">
        <h3 className="font-heading text-lg font-bold text-foreground">Contacta a tu asesor</h3>
        <p className="font-body text-sm text-muted-foreground">
          Estos son los datos de contacto de tu asesor para que puedas comunicarte directamente:
        </p>
        <div className="bg-secondary rounded-lg p-s2 space-y-2 text-sm font-body">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-user text-primary w-4 text-center" />
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Nombre</p>
              <p className="text-foreground font-medium">Skandia Colombia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-envelope text-primary w-4 text-center" />
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Correo</p>
              <p className="text-foreground font-medium">asesoria@skandia.com.co</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-phone text-primary w-4 text-center" />
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Celular</p>
              <p className="text-foreground font-medium">+57 601 658 0000</p>
            </div>
          </div>
        </div>
        <div className="bg-accent/50 rounded-lg p-s2 border border-primary/20">
          <p className="text-xs font-body text-muted-foreground">
            <i className="fa-solid fa-circle-info mr-1 text-primary" />
            Al aceptar, también le comunicaremos a tu asesor tu necesidad de contacto para que puedan asistirte de manera oportuna.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={onClose}>
            <i className="fa-solid fa-check mr-2" />
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
