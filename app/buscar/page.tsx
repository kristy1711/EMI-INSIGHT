'use client';

import { useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, FilterX } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { getAnalisisConsolidado, fuentesDisponibles, type OpinionAnalizada } from '@/services/analisis.service';

const POR_PAGINA = 10;

const POLARIDAD_CLASE = {
  positivo: 'bg-[#2e9e6b]/15 text-[#2e9e6b] border-transparent',
  neutral: 'bg-[#e0a100]/15 text-[#e0a100] border-transparent',
  negativo: 'bg-[#d64545]/15 text-[#d64545] border-transparent',
} as const;

const POLARIDAD_TEXTO = {
  positivo: 'Positivo',
  neutral: 'Neutral',
  negativo: 'Negativo',
} as const;

function extracto(texto: string, max = 90): string {
  return texto.length > max ? texto.slice(0, max) + '…' : texto;
}

export default function BuscarPage() {
  const analisis = getAnalisisConsolidado();
  const fuentes = fuentesDisponibles();
  const factores = analisis.resultados.factores.map((f) => f.nombre);

  const [texto, setTexto] = useState('');
  const [fuente, setFuente] = useState<string>('todas');
  const [sentimiento, setSentimiento] = useState<string>('todos');
  const [factor, setFactor] = useState<string>('todos');
  const [pagina, setPagina] = useState(0);

  const filtradas = useMemo(() => {
    const q = texto.trim().toLowerCase();
    return analisis.opiniones.filter((o) => {
      const coincideTexto = !q || o.texto.toLowerCase().includes(q);
      const coincideFuente = fuente === 'todas' || o.fuente.includes(fuente);
      const coincideSentimiento = sentimiento === 'todos' || o.polaridad === sentimiento;
      const coincideFactor = factor === 'todos' || o.factor === factor;
      return coincideTexto && coincideFuente && coincideSentimiento && coincideFactor;
    });
  }, [analisis.opiniones, texto, fuente, sentimiento, factor]);

  const totalPaginas = Math.ceil(filtradas.length / POR_PAGINA);
  const paginaActual = Math.min(pagina, Math.max(0, totalPaginas - 1));
  const inicio = paginaActual * POR_PAGINA;
  const visibles = filtradas.slice(inicio, inicio + POR_PAGINA);

  function limpiarFiltros() {
    setTexto('');
    setFuente('todas');
    setSentimiento('todos');
    setFactor('todos');
    setPagina(0);
  }

  function cambiarPagina(delta: number) {
    setPagina((p) => Math.max(0, Math.min(totalPaginas - 1, p + delta)));
  }

  return (
    <AppLayout>
      <PageHeader
        titulo="Buscar y Filtrar"
        subtitulo="Explore el corpus de opiniones sin identificar a los autores."
      />

      {/* Panel de filtros */}
      <div className="emi-card mb-6 p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Búsqueda de texto</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Palabra o frase..."
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value);
                  setPagina(0);
                }}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Fuente</Label>
            <Select
              value={fuente}
              onValueChange={(v) => {
                setFuente(v);
                setPagina(0);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {fuentes.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Sentimiento</Label>
            <Select
              value={sentimiento}
              onValueChange={(v) => {
                setSentimiento(v);
                setPagina(0);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="positivo">Positivo</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negativo">Negativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Factor</Label>
            <Select
              value={factor}
              onValueChange={(v) => {
                setFactor(v);
                setPagina(0);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {factores.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {(texto || fuente !== 'todas' || sentimiento !== 'todos' || factor !== 'todos') && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filtradas.length} resultado(s)
            </p>
            <Button variant="ghost" size="sm" onClick={limpiarFiltros}>
              <FilterX className="mr-1.5 h-4 w-4" />
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="emi-card p-6">
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table className="emi-table">
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="text-navy">Extracto de la opinión</TableHead>
                <TableHead className="text-navy">Sentimiento</TableHead>
                <TableHead className="text-navy">Fuente</TableHead>
                <TableHead className="text-navy">Factor</TableHead>
                <TableHead className="text-navy">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="emi-empty">
                      <Search className="mb-2 h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">Sin resultados</p>
                      <p className="mt-1 text-xs">
                        No hay opiniones que coincidan con los filtros aplicados.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                visibles.map((o: OpinionAnalizada) => (
                  <TableRow key={o.id}>
                    <TableCell className="max-w-md text-sm text-foreground">
                      {extracto(o.texto)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={POLARIDAD_CLASE[o.polaridad]}>
                        {POLARIDAD_TEXTO[o.polaridad]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
                        {o.fuente}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{o.factor}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(o.fecha).toLocaleDateString('es-BO', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {filtradas.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Mostrando {inicio + 1}–{Math.min(inicio + POR_PAGINA, filtradas.length)} de{' '}
              {filtradas.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={paginaActual === 0}
                onClick={() => cambiarPagina(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {paginaActual + 1} de {totalPaginas || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={paginaActual >= totalPaginas - 1}
                onClick={() => cambiarPagina(1)}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
