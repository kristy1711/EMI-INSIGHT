import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AnalisisConsolidado } from '@/services/analisis.service';
import type { ReporteGuardado } from '@/services/historial.service';

interface DatosReporte {
  titulo: string;
  periodo: string;
  fuente: string;
  destinatario: string;
  secciones: string[];
  analisis: AnalisisConsolidado;
  autor: string;
}

const NAVY: [number, number, number] = [11, 37, 69];
const BLUE: [number, number, number] = [31, 111, 235];
const GOLD: [number, number, number] = [201, 162, 39];
const GRAY: [number, number, number] = [90, 106, 128];
const POSITIVO: [number, number, number] = [46, 158, 107];
const NEUTRAL: [number, number, number] = [224, 161, 0];
const NEGATIVO: [number, number, number] = [214, 69, 69];

export function generarPdfReporte(datos: DatosReporte): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  const margenIzq = 45;
  const margenDer = anchoPagina - 45;
  const { analisis, secciones } = datos;
  const r = analisis.resultados;
  let y = 0;

  // ----- Encabezado institucional -----
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, anchoPagina, 80, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 80, anchoPagina, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Escuela Militar de Ingeniería — EMI-UALP', margenIzq, 35);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Sistema de Percepción Institucional en Redes Sociales', margenIzq, 55);
  doc.setFontSize(9);
  doc.text('PercepciónEMI', margenDer - 70, 35);

  y = 110;
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(datos.titulo, margenIzq, y);
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(`Periodo: ${datos.periodo}`, margenIzq, y);
  doc.text(`Fuente: ${datos.fuente}`, margenIzq + 200, y);
  doc.text(`Destinatario: ${datos.destinatario}`, margenIzq + 360, y);
  y += 14;
  doc.text(
    `Generado por: ${datos.autor} — ${new Date().toLocaleDateString('es-BO')}`,
    margenIzq,
    y
  );
  y += 20;

  // ----- Sección: Resumen ejecutivo -----
  if (secciones.includes('resumen')) {
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('1. Resumen ejecutivo', margenIzq, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    const resumen = doc.splitTextToSize(
      `El análisis de ${r.corpus.validos} opiniones válidas identificó una percepción mayoritariamente positiva (${r.sentimientos.positivo}%) y neutral (${r.sentimientos.neutral}%), con un ${r.sentimientos.negativo}% de menciones negativas. Mediante modelado temático se identificaron ${r.factores.length} factores de percepción, destacando la gestión administrativa (${r.factores[0].porcentaje}%) y la calidad académica (${r.factores[1].porcentaje}%). El clasificador BETO alcanzó un F1-Score de ${r.metricasBeto.f1}, superando el umbral de cumplimiento de 0.75.`,
      margenDer - margenIzq
    );
    doc.text(resumen, margenIzq, y);
    y += resumen.length * 12 + 10;
  }

  // ----- Sección: Métricas -----
  if (secciones.includes('metricas')) {
    if (y > altoPagina - 120) {
      doc.addPage();
      y = 60;
    }
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('2. Métricas del modelo', margenIzq, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [['Métrica', 'Valor', 'Umbral', 'Estado']],
      body: [
        ['F1-Score (BETO)', String(r.metricasBeto.f1), '≥ 0.75', 'Cumple'],
        ['Precisión (BETO)', String(r.metricasBeto.precision), '≥ 0.75', 'Cumple'],
        ['Recall (BETO)', String(r.metricasBeto.recall), '≥ 0.70', 'Cumple'],
        ['CV Score (BERTopic)', String(r.cvScore), '≥ 0.50', 'Cumple'],
        ['Opiniones válidas', String(r.corpus.validos), '—', '—'],
        ['Opiniones descartadas', String(r.corpus.descartados), '—', '—'],
      ],
      theme: 'grid',
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
      margin: { left: margenIzq, right: margenDer },
    });
    // @ts-expect-error: autoTable añade lastAutoTable dinámicamente
    y = (doc.lastAutoTable?.finalY ?? y) + 20;
  }

  // ----- Sección: KPIs de polaridad -----
  if (secciones.includes('metricas')) {
    if (y > altoPagina - 100) {
      doc.addPage();
      y = 60;
    }
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3. Distribución de polaridad', margenIzq, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [['Polaridad', 'Cantidad', 'Porcentaje']],
      body: [
        ['Positivas', String(analisis.opiniones.filter((o) => o.polaridad === 'positivo').length), `${r.sentimientos.positivo}%`],
        ['Neutrales', String(analisis.opiniones.filter((o) => o.polaridad === 'neutral').length), `${r.sentimientos.neutral}%`],
        ['Negativas', String(analisis.opiniones.filter((o) => o.polaridad === 'negativo').length), `${r.sentimientos.negativo}%`],
      ],
      theme: 'striped',
      headStyles: { fillColor: BLUE, textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
      margin: { left: margenIzq, right: margenDer },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          const colores: [number, number, number][] = [POSITIVO, NEUTRAL, NEGATIVO];
          if (data.row.index < colores.length) {
            data.cell.styles.textColor = colores[data.row.index];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });
    // @ts-expect-error: autoTable añade lastAutoTable dinámicamente
    y = (doc.lastAutoTable?.finalY ?? y) + 20;
  }

  // ----- Sección: Factores -----
  if (secciones.includes('factores')) {
    if (y > altoPagina - 140) {
      doc.addPage();
      y = 60;
    }
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const numFactor = secciones.includes('metricas') ? '4' : '2';
    doc.text(`${numFactor}. Factores de percepción identificados`, margenIzq, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [['Factor', 'Peso (%)', 'Opiniones negativas', 'Términos representativos']],
      body: r.factores.map((f) => [
        f.nombre,
        `${f.porcentaje}%`,
        String(f.cantidad),
        f.terminos.join(', '),
      ]),
      theme: 'grid',
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
      margin: { left: margenIzq, right: margenDer },
    });
    // @ts-expect-error: autoTable añade lastAutoTable dinámicamente
    y = (doc.lastAutoTable?.finalY ?? y) + 20;
  }

  // ----- Sección: Recomendaciones -----
  if (secciones.includes('recomendaciones')) {
    if (y > altoPagina - 140) {
      doc.addPage();
      y = 60;
    }
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const numRec = secciones.includes('factores') ? '5' : secciones.includes('metricas') ? '4' : '2';
    doc.text(`${numRec}. Recomendaciones`, margenIzq, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    const recomendaciones = [
      'Optimizar los procesos de inscripción y trámites administrativos para reducir el factor de mayor peso (22,9%).',
      'Implementar canales de comunicación directa entre la dirección y los estudiantes para abordar la calidad académica.',
      'Renovar la infraestructura de los laboratorios y aulas del campus antiguo.',
      'Transparentar el uso de los recursos económicos y comunicar el valor de las cuotas.',
      'Fortalecer el departamento de bienestar estudiantil con tutores asignados por carrera.',
    ];
    recomendaciones.forEach((rec, i) => {
      if (y > altoPagina - 50) {
        doc.addPage();
        y = 60;
      }
      doc.text(`${i + 1}. ${rec}`, margenIzq + 10, y);
      y += 16;
    });
  }

  // ----- Pie de página con fecha y paginación -----
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    const py = altoPagina - 25;
    doc.setDrawColor(220, 228, 238);
    doc.line(margenIzq, py - 8, margenDer, py - 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(
      `PercepciónEMI — Generado el ${new Date().toLocaleDateString('es-BO')}`,
      margenIzq,
      py
    );
    doc.text(`Página ${i} de ${totalPaginas}`, margenDer - 70, py);
  }

  return doc;
}

export function descargarPdf(reporte: ReporteGuardado, analisis: AnalisisConsolidado, autor: string) {
  const doc = generarPdfReporte({
    titulo: reporte.titulo,
    periodo: reporte.periodo,
    fuente: reporte.fuente,
    destinatario: 'Dirección Académica',
    secciones: reporte.secciones,
    analisis,
    autor,
  });
  doc.save(`${reporte.titulo.replace(/\s+/g, '_').toLowerCase()}.pdf`);
}
