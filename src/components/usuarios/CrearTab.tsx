'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { KeyRound, UserPlus } from 'lucide-react';
import { useUsuarios } from '@/contexts/UsuariosContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROL_LABEL } from '@/types';

const esquema = z
  .object({
    usuario: z
      .string()
      .min(3, 'El usuario debe tener al menos 3 caracteres')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Solo letras, números, punto, guion y guion bajo'),
    contrasena: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmar: z.string(),
    nombres: z.string().min(2, 'Ingrese los nombres'),
    apellidos: z.string().min(2, 'Ingrese los apellidos'),
    cargo: z.string().min(3, 'Ingrese el cargo'),
    rol: z.enum(['superadministrador', 'administrador', 'usuario'], {
      required_error: 'Seleccione un rol',
    }),
    estado: z.enum(['activo', 'inactivo'], {
      required_error: 'Seleccione un estado inicial',
    }),
  })
  .refine((d) => d.contrasena === d.confirmar, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar'],
  });

type FormValues = z.infer<typeof esquema>;

function ErrorCampo({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null;
  return <p className="mt-1 text-xs text-destructive">{mensaje}</p>;
}

export default function CrearTab() {
  const { crear, usuarios } = useUsuarios();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(esquema),
    defaultValues: {
      estado: 'activo',
      rol: undefined,
      usuario: '',
      contrasena: '',
      confirmar: '',
      nombres: '',
      apellidos: '',
      cargo: '',
    },
  });

  const rol = watch('rol');
  const estado = watch('estado');

  async function onSubmit(values: FormValues) {
    if (usuarios.some((u) => u.usuario.toLowerCase() === values.usuario.toLowerCase())) {
      toast.error('El nombre de usuario ya existe.');
      return;
    }
    const resultado = crear(values);
    if (resultado.ok) {
      toast.success(`Usuario "${values.usuario}" creado correctamente.`);
      reset();
    } else {
      toast.error(resultado.error ?? 'No se pudo crear el usuario.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="emi-card p-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Datos de acceso */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-emiblue" />
            <h2 className="text-base font-semibold text-navy">Datos de acceso</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cusuario">Usuario</Label>
              <Input id="cusuario" placeholder="p. ej. jlopez" {...register('usuario')} />
              <ErrorCampo mensaje={errors.usuario?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ccontrasena">Contraseña</Label>
              <Input
                id="ccontrasena"
                type="password"
                placeholder="Mínimo 8 caracteres"
                {...register('contrasena')}
              />
              <ErrorCampo mensaje={errors.contrasena?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cconfirmar">Confirmar contraseña</Label>
              <Input
                id="cconfirmar"
                type="password"
                placeholder="Repita la contraseña"
                {...register('confirmar')}
              />
              <ErrorCampo mensaje={errors.confirmar?.message} />
            </div>
          </div>
        </section>

        {/* Datos personales */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-emiblue" />
            <h2 className="text-base font-semibold text-navy">Datos personales</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cnombres">Nombres</Label>
              <Input id="cnombres" placeholder="Nombres" {...register('nombres')} />
              <ErrorCampo mensaje={errors.nombres?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capellidos">Apellidos</Label>
              <Input id="capellidos" placeholder="Apellidos" {...register('apellidos')} />
              <ErrorCampo mensaje={errors.apellidos?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ccargo">Cargo</Label>
              <Input
                id="ccargo"
                placeholder="p. ej. Analista de comunicación"
                {...register('cargo')}
              />
              <ErrorCampo mensaje={errors.cargo?.message} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Rol</Label>
                <Select value={rol ?? ''} onValueChange={(v) => setValue('rol', v as FormValues['rol'], { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROL_LABEL) as (keyof typeof ROL_LABEL)[]).map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROL_LABEL[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ErrorCampo mensaje={errors.rol?.message} />
              </div>
              <div className="space-y-1.5">
                <Label>Estado inicial</Label>
                <Select value={estado ?? ''} onValueChange={(v) => setValue('estado', v as FormValues['estado'], { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                <ErrorCampo mensaje={errors.estado?.message} />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 flex justify-end border-t border-border pt-5">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="emi-btn-primary h-10 rounded-xl px-6 font-semibold"
        >
          Guardar usuario
        </Button>
      </div>
    </form>
  );
}
