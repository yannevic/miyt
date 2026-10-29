import { useEffect } from 'react'

type ConfirmarProps = {
  titulo: string
  mensagem: string
  textoConfirmar: string
  textoCancelar?: string
  perigo?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function Confirmar({
  titulo,
  mensagem,
  textoConfirmar,
  textoCancelar = 'Cancelar',
  perigo = false,
  onConfirmar,
  onCancelar,
}: ConfirmarProps) {
  // Esc cancela
  useEffect(() => {
    function aoApertar(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancelar()
    }
    window.addEventListener('keydown', aoApertar)
    return () => window.removeEventListener('keydown', aoApertar)
  }, [onCancelar])

  return (
    <div
      role='dialog'
      aria-modal='true'
      className='fixed inset-0 z-[60] flex items-center justify-center bg-soil-900/50 p-4'
    >
      <div className='flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-bark-100 p-5 text-leaf-800 shadow-xl'>
        <h2 className='text-xl font-bold'>{titulo}</h2>
        <p className='whitespace-normal break-words text-sm'>{mensagem}</p>
        <div className='flex justify-end gap-2'>
          <button
            type='button'
            onClick={onCancelar}
            className='rounded-xl bg-white/70 px-4 py-1 font-semibold'
          >
            {textoCancelar}
          </button>
          <button
            type='button'
            onClick={onConfirmar}
            className={
              perigo
                ? 'rounded-xl bg-petal-600 px-4 py-1 font-semibold text-white'
                : 'rounded-xl bg-leaf-600 px-4 py-1 font-semibold text-white'
            }
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}