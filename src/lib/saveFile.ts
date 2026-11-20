// Entrega al usuario un archivo generado en memoria (Blob) como descarga.
// Se llama desde el onSuccess de una mutación (respuesta a un clic), nunca durante el render.
// Se descarga también el PDF: abrirlo en otra pestaña tras un `await` lo bloquea el navegador.
export function saveFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  // El navegador ya tomó el archivo; se libera la memoria en el siguiente ciclo.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
