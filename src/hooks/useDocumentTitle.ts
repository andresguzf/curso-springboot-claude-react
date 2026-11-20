import { useEffect } from 'react'

const APP_NAME = 'Cartera'

// Título de la pestaña del navegador: "Clientes · Cartera". El título del documento es un sistema
// externo a React, por eso se sincroniza con un effect. Cada página lo llama con su nombre.
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`
  }, [title])
}
