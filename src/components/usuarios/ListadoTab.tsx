'use client';

import { useMemo, useState } from 'react';
import { Search, Users, UserCheck, UserX, ShieldCheck } from 'lucide-react';
import { useUsuarios } from '@/contexts/UsuariosContext';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ROL_LABEL, type Rol, type Usuario } from '@/types';

const ROL_BADGE_CLASS: Record<Rol, string> = {
  superadministrador: 'bg-navy text-white border-navy',
  administrador: 'bg-emiblue text-white border-emiblue',
  usuario: 'bg-muted text-muted-foreground border-border',
};

function MetricCard({
  icono: Icono,
  etiqueta,
  valor,
  color,
}: {
  icono: typeof Users;
  etiqueta: string;
  valor: number;
  color: string;
}) {
  return (
    <div className="emi-card flex items-center gap-4 p-5">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: color }}
      >
        <Icono className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {etiqueta}
        </p>
        <p className="text-2xl font-bold text-navy">{valor}</p>
      </div>
    </div>
  );
}

function EstadoCuenta({ estado }: { estado: Usuario['estado'] }) {
  const activo = estado === 'activo';
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: activo ? 'var(--sentiment-positive)' : '#9aa5b5' }}
      />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}

export default function ListadoTab() {
  const { usuarios } = useUsuarios();
  const [busqueda, setBusqueda] = useState('');
  const [rolFiltro, setRolFiltro] = useState<string>('todos');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos');

  const metricas = useMemo(
    () => ({
      total: usuarios.length,
      activos: usuarios.filter((u) => u.estado === 'activo').length,
      inactivos: usuarios.filter((u) => u.estado === 'inactivo').length,
      superadmins: usuarios.filter((u) => u.rol === 'superadministrador').length,
    }),
    [usuarios]
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return usuarios.filter((u) => {
      const coincideBusqueda = !q || u.nombre.toLowerCase().includes(q);
      const coincideRol = rolFiltro === 'todos' || u.rol === rolFiltro;
      const coincideEstado =
        estadoFiltro === 'todos' || u.estado === estadoFiltro;
      return coincideBusqueda && coincideRol && coincideEstado;
    });
  }, [usuarios, busqueda, rolFiltro, estadoFiltro]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icono={Users} etiqueta="Total usuarios" valor={metricas.total} color="#0b2545" />
        <MetricCard icono={UserCheck} etiqueta="Activos" valor={metricas.activos} color="#2e9e6b" />
        <MetricCard icono={UserX} etiqueta="Inactivos" valor={metricas.inactivos} color="#9aa5b5" />
        <MetricCard icono={ShieldCheck} etiqueta="Superadministradores" valor={metricas.superadmins} color="#1f6feb" />
      </div>

      <div className="emi-card p-6">
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={rolFiltro} onValueChange={setRolFiltro}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los roles</SelectItem>
              <SelectItem value="superadministrador">Superadministrador</SelectItem>
              <SelectItem value="administrador">Administrador</SelectItem>
              <SelectItem value="usuario">Usuario</SelectItem>
            </SelectContent>
          </Select>
          <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <Table className="emi-table">
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="text-navy">Nombre completo</TableHead>
                <TableHead className="text-navy">Usuario</TableHead>
                <TableHead className="text-navy">Cargo</TableHead>
                <TableHead className="text-navy">Rol</TableHead>
                <TableHead className="text-navy">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="emi-empty">
                      <Users className="mb-2 h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">Sin resultados</p>
                      <p className="mt-1 text-xs">
                        No hay usuarios que coincidan con los filtros aplicados.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-navy">{u.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">@{u.usuario}</TableCell>
                    <TableCell className="text-muted-foreground">{u.cargo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border ${ROL_BADGE_CLASS[u.rol]}`}>
                        {ROL_LABEL[u.rol]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <EstadoCuenta estado={u.estado} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {filtrados.length} de {usuarios.length} usuarios mostrados
        </p>
      </div>
    </div>
  );
}
