'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const resultado = await login(usuario, contrasena);
    setEnviando(false);
    if (resultado.ok) {
      toast.success('Bienvenido a PercepciónEMI');
      router.push('/dashboard');
    } else {
      setError(resultado.error ?? 'Error al iniciar sesión.');
    }
  }

  return (
    <div className="login-gradient flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="emi-card p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy shadow-lg">
              <Shield className="h-8 w-8 text-gold" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-navy">
              PercepciónEMI
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Escuela Militar de Ingeniería — EMI-UALP, Bolivia
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="usuario"
                  placeholder="Ingrese su usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="pl-9"
                  autoComplete="username"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contrasena">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="contrasena"
                  type="password"
                  placeholder="Ingrese su contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="pl-9"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={enviando}
              className="emi-btn-primary h-11 w-full rounded-xl font-semibold"
            >
              {enviando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-white/60">
          Sistema de identificación de factores de percepción institucional en
          redes sociales
        </p>
      </div>
    </div>
  );
}
