'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Stepper } from '@/components/shared/Stepper';
import { useAuth } from '@/contexts/AuthContext';
import PasoPreprocesamiento from '@/components/pln/PasoPreprocesamiento';
import PasoBeto from '@/components/pln/PasoBeto';
import PasoBertopic from '@/components/pln/PasoBertopic';
import PasoResultados from '@/components/pln/PasoResultados';
import type { Rol } from '@/types';

const ROLES_PERMITIDOS: Rol[] = ['superadministrador', 'administrador'];

const PASOS = [
  { titulo: 'Preprocesamiento' },
  { titulo: 'Clasificación BETO' },
  { titulo: 'Modelado BERTopic' },
  { titulo: 'Resultados' },
];

export default function PlnPage() {
  return (
    <AppLayout>
      <AuthGuard permitidos={ROLES_PERMITIDOS}>
        <PlnPageInner />
      </AuthGuard>
    </AppLayout>
  );
}

function PlnPageInner() {
  const { rol, cargando: cargandoAuth } = useAuth();
  const [paso, setPaso] = useState(0);
  const [completado, setCompletado] = useState(0);

  if (cargandoAuth) return null;

  if (!rol || !ROLES_PERMITIDOS.includes(rol)) {
    return (
      <div className="emi-empty emi-card">
        <p className="text-sm font-medium text-navy">Acceso restringido</p>
        <p className="mt-1 text-xs">
          Este módulo está disponible para Superadministrador y Administrador.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Procesamiento PLN"
        subtitulo="Pipeline de análisis: desde la limpieza del corpus hasta los factores de percepción."
      />
      <Stepper
        pasos={PASOS}
        pasoActual={paso}
        pasoCompletado={completado}
        onSeleccionar={setPaso}
      />
      <div className="mt-8">
        {paso === 0 && (
          <PasoPreprocesamiento
            onCompletado={() => setCompletado((c) => Math.max(c, 1))}
          />
        )}
        {paso === 1 && (
          <PasoBeto
            habilitado={completado >= 1}
            onCompletado={() => setCompletado((c) => Math.max(c, 2))}
          />
        )}
        {paso === 2 && (
          <PasoBertopic
            habilitado={completado >= 2}
            onCompletado={() => setCompletado((c) => Math.max(c, 3))}
          />
        )}
        {paso === 3 && (
          <PasoResultados
            habilitado={completado >= 3}
            onGuardar={() => setPaso(0)}
            onReiniciar={() => {
              setCompletado(0);
              setPaso(0);
            }}
          />
        )}
      </div>
    </>
  );
}
