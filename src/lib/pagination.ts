export type PageWindow = {
  /** Páginas a mostrar como números, en orden. */
  pages: number[]
  /** Hay páginas ocultas entre la primera y la ventana (se muestra «…»). */
  gapBefore: boolean
  /** Hay páginas ocultas entre la ventana y la última. */
  gapAfter: boolean
}

// Ventana de paginación por rango: la página actual con hasta `radius` páginas a cada lado.
// Cerca de los extremos la ventana se recorta y desaparece el «…» de ese lado.
//   pageWindow(7, 20, 3)  → … 4 5 6 [7] 8 9 10 …
//   pageWindow(2, 20, 3)  → 1 [2] 3 4 5 …
//   pageWindow(19, 20, 3) → … 16 17 18 [19] 20
// Función pura (sin React): se prueba sola y la usa Pagination.
export function pageWindow(current: number, total: number, radius: number): PageWindow {
  if (total < 1) return { pages: [], gapBefore: false, gapAfter: false }
  const page = Math.min(Math.max(current, 1), total)
  const start = Math.max(1, page - radius)
  const end = Math.min(total, page + radius)
  return {
    pages: Array.from({ length: end - start + 1 }, (_, index) => start + index),
    gapBefore: start > 1,
    gapAfter: end < total,
  }
}
