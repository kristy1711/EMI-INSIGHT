function escaparCampo(valor: string): string {
  return `"${valor.replace(/"/g, '""')}"`;
}

export function descargarCSV(
  nombreArchivo: string,
  encabezados: string[],
  filas: string[][]
): void {
  const lineas = [
    encabezados.map(escaparCampo).join(';'),
    ...filas.map((f) => f.map((c) => escaparCampo(String(c))).join(';')),
  ];
  const contenido = '\uFEFF' + lineas.join('\r\n');
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}
