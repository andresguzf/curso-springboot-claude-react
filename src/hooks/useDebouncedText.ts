import { useState } from 'react'
import { useDebouncedCallback } from './useDebouncedCallback.ts'

// Campo de texto que aplica su valor con debounce (buscador, ciudad). `value` es el valor aplicado
// (el de la URL); `text` es lo que el usuario está escribiendo.
export function useDebouncedText(value: string, onCommit: (text: string) => void, delay = 400) {
  const [text, setText] = useState(value)
  const [prevValue, setPrevValue] = useState(value)

  // Si el valor aplicado cambia desde fuera ("Limpiar filtros", botón atrás), el campo lo refleja.
  // Se ajusta durante el render (no en un effect). Si solo difiere en espacios de los extremos, se
  // respeta lo escrito: así no se borra el espacio mientras se escribe "la serena".
  if (value !== prevValue) {
    setPrevValue(value)
    if (value !== text.trim()) setText(value)
  }

  // Al vencer el timer se usa el texto más reciente (no el de cuando empezó). Si mientras tanto
  // se limpiaron los filtros, texto y valor ya coinciden y no se aplica nada.
  const commit = useDebouncedCallback(() => {
    if (text.trim() !== value) onCommit(text.trim())
  }, delay)

  function handleChange(next: string) {
    setText(next)
    commit.run()
  }

  return { text, onChange: handleChange }
}
