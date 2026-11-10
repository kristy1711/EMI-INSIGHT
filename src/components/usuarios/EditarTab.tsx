'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Save, ToggleLeft } from 'lucide-react';
import { useUsuarios } from '@/contexts/UsuariosContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ROL_LABEL, type Rol, type Usuario } from '@/types';

const esquema = z.object({
  usuario: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  nombres: z.string().min(2, 'Ingrese los nombres'),
  apellidos: z.string().min(2, 'Ingrese los apellidos'),
  cargo: z.string().min(3, 'Ingrese el cargo'),
  rol: z.enum(['superadministrador', 'administrador', 'usuario']),
  nuevaContrasena: z
    .string()
    .refine(
      (v) => v === '' || v.length >= 8,
      'La nueva contraseña debe tener al menos 8 caracteres'
    ),
});

type FormValues = z.infer<typeof esquema>;

function ErrorCampo({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null;
  return <p className="mt-1 text-xs text-destructive">{mensaje}</p>;
}

export default function EditarTab() {
  const { usuarios, actualizar } = useUsuarios();
  const [seleccionId, setSeleccionId] = useState<string>('');
  const [nuevoEstado, setNuevoEstado] = useState<boolean>(true);
  const [dialogEstado, setDialogEstado] = useState<null | { activar: boolean }>(null);

  const seleccionado: Usuario | undefined = useMemo(
    () => usuarios.find((u) => u.id === seleccionId),
    [usuarios, seleccionId]
  );

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
      usuario: '',
      nombres: '',
      apellidos: '',
      cargo: '',
      rol: 'usuario',
      nuevaContrasena: '',
    },
  });

  const rol = watch('rol');

  useEffect(() => {
    if (seleccionado) {
      reset({
        usuario: seleccionado.usuario,
        nombres: seleccionado.nombres ?? seleccionado.nombre.split(' ')[0] ?? '',
        apellidos:
          seleccionado.apellidos ??
          seleccionado.nombre.split(' ').slice(1).join(' '),
        cargo: seleccionado.cargo,
        rol: seleccionado.rol,
        nuevaContrasena: '',
      });
      setNuevoEstado(seleccionado.estado === 'activo');
    }
  }, [seleccionado, reset]);

  function onSeleccion(id: string) {
    setSeleccionId(id);
  }

  async function onSubmit(values: FormValues) {
    if (!seleccionado) return;
    const cambios: Partial<Omit<Usuario, 'id'>> = {
      usuario: values.usuario.trim(),
      nombres: values.nombres.trim(),
      apellidos: values.apellidos.trim(),
      nombre: `${values.nombres.trim()} ${values.apellidos.trim()}`,
      cargo: values.cargo.trim(),
      rol: values.rol,
    };
    if (values.nuevaContrasena) {
      cambios.contrasena = values.nuevaContrasena;
    }
    const resultado = actualizar(seleccionado.id, cambios);
    if (resultado.ok) {
      toast.success('Datos del usuario actualizados correctamente.');
      reset({ ...values, nuevaContrasena: '' });
    } else {
      toast.error(resultado.error ?? 'No se pudo actualizar el usuario.');
    }
  }

  function confirmarCambioEstado() {
    if (!seleccionado) return;
    const resultado = actualizar(seleccionado.id, {
      estado: dialogEstado?.activar ? 'activo' : 'inactivo',
    });
    setDialogEstado(null);
    if (resultado.ok) {
      setNuevoEstado(dialogEstado?.activar ?? false);
      toast.success(
        `Cuenta ${dialogEstado?.activar ? 'habilitada' : 'deshabilitada'} correctamente.`
      );
    } else {
      toast.error(resultado.error ?? 'No se pudo cambiar el estado.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Selector de usuario */}
      <div className="emi-card p-6">
        <Label htmlFor="selusuario">Seleccionar usuario a modificar</Label>
        <Select value={seleccionId} onValueChange={onSeleccion}>
          <SelectTrigger id="selusuario" className="mt-2 max-w-md">
            <SelectValue placeholder="Seleccione un usuario existente" />
          </SelectTrigger>
          <SelectContent>
            {usuarios.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.nombre} (@{u.usuario})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {seleccionado ? (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="emi-card p-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Datos personales y acceso */}
              <section className="space-y-4">
                <h2 className="text-base font-semibold text-navy">
                  Datos personales y de acceso
                </h2>
                <div className="space-y-1.5">
                  <Label htmlFor="eusuario">Usuario</Label>
                  <Input id="eusuario" {...register('usuario')} />
                  <ErrorCampo mensaje={errors.usuario?.message} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="enombres">Nombres</Label>
                    <Input id="enombres" {...register('nombres')} />
                    <ErrorCampo mensaje={errors.nombres?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="eapellidos">Apellidos</Label>
                    <Input id="eapellidos" {...register('apellidos')} />
                    <ErrorCampo mensaje={errors.apellidos?.message} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ecargo">Cargo</Label>
                  <Input id="ecargo" {...register('cargo')} />
                  <ErrorCampo mensaje={errors.cargo?.message} />
                </div>
                <div className="space-y-1.5">
                  <Label>Reasignar rol</Label>
                  <Select
                    value={rol}
                    onValueChange={(v) =>
                      setValue('rol', v as FormValues['rol'], { shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ROL_LABEL) as Rol[]).map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROL_LABEL[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>

              {/* Contraseña */}
              <section className="space-y-4">
                <h2 className="text-base font-semibold text-navy">
                  Cambiar contraseña (opcional)
                </h2>
                <div className="space-y-1.5">
                  <Label htmlFor="econtra">Nueva contraseña</Label>
                  <Input
                    id="econtra"
                    type="password"
                    placeholder="Dejar vacío para mantener la actual"
                    {...register('nuevaContrasena')}
                  />
                  <ErrorCampo mensaje={errors.nuevaContrasena?.message} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Si completa este campo, la próxima sesión del usuario deberá
                  usar esta nueva contraseña.
                </p>
              </section>
            </div>

            <div className="mt-8 flex justify-end border-t border-border pt-5">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="emi-btn-primary h-10 rounded-xl px-6 font-semibold"
              >
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </Button>
            </div>
          </form>

          {/* Modificar estado */}
          <div className="emi-card p-6">
            <div className="flex items-center gap-2">
              <ToggleLeft className="h-4 w-4 text-emiblue" />
              <h2 className="text-base font-semibold text-navy">Modificar estado</h2>
            </div>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={nuevoEstado}
                  onCheckedChange={(v) => setDialogEstado({ activar: v })}
                />
                <span className="text-sm">
                  {nuevoEstado
                    ? 'Cuenta habilitada: el usuario puede iniciar sesión.'
                    : 'Cuenta deshabilitada: el usuario no podrá iniciar sesión.'}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 rounded-xl font-semibold"
                onClick={() => setDialogEstado({ activar: !nuevoEstado })}
              >
                {nuevoEstado ? 'Deshabilitar cuenta' : 'Habilitar cuenta'}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="emi-empty emi-card">
          <p className="text-sm font-medium">Ningún usuario seleccionado</p>
          <p className="mt-1 text-xs">
            Seleccione un usuario arriba para editar sus datos, rol y estado.
          </p>
        </div>
      )}

      {/* Diálogo de confirmación para cambiar estado */}
      <Dialog
        open={dialogEstado !== null}
        onOpenChange={(abierto) => !abierto && setDialogEstado(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogEstado?.activar ? 'Habilitar cuenta' : 'Deshabilitar cuenta'}
            </DialogTitle>
            <DialogDescription>
              {dialogEstado?.activar
                ? `¿Confirma habilitar la cuenta de "${seleccionado?.nombre}"? El usuario volverá a poder iniciar sesión.`
                : `¿Confirma deshabilitar la cuenta de "${seleccionado?.nombre}"? El usuario no podrá iniciar sesión hasta que la habilite nuevamente. Los datos no se eliminan.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEstado(null)}>
              Cancelar
            </Button>
            <Button
              className="emi-btn-primary rounded-lg font-semibold"
              onClick={confirmarCambioEstado}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
