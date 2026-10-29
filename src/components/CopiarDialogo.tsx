import { useEffect, useState } from 'react'
import { chaveDia } from '../utils/datas'
import { diaDaSemana, formatarDiaMes } from '../utils/semana'

type Resultado = { total: number; ocupadas: number }

type CopiarDialogoProps = {
  tipo: 'dia' | 'semana'
  origem: Date
  simular: (destino: Date) => Resultado
  onConfirmar: (destino: Date, substituir: boolean) => void
  onFechar: () => void
}

// Transforma '2026-10-29' (do campo de data) em Date. Devolve null se estiver vazio.
function lerData(texto: string): Date | null {
  const [ano, mes, dia] = texto.split('-').map(Number)
  if (!ano || !mes || !dia) return null
  return new Date(ano, mes - 1, dia)
}

function plural(n: number): string {
  return n === 1 ? '1 refeição' : `${n} refeições`
}

export function CopiarDialogo({
  tipo,
  origem,
  simular,
  onConfirmar,
  onFechar,
}: CopiarDialogoProps) {
  const [texto, setTexto] = useState(() => {
    const inicial = new Date(origem)
    inicial.setDate(origem.getDate() + (tipo === 'dia' ? 1 : 7))
    return chaveDia(inicial)
  })
  const [substituir, setSubstituir] = useState(false)

  // Esc fecha
  useEffect(() => {
    function aoApertar(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', aoApertar)
    return () => window.removeEventListener('keydown', aoApertar)
  }, [onFechar])

  const destino = lerData(texto)
  const inicioOrigem = tipo === 'semana' ? diaDaSemana(origem)[0] : origem
  const inicioDestino = destino
    ? tipo === 'semana'
      ? diaDaSemana(destino)[0]
      : destino
    : null
  const fimDestino = destino && tipo === 'semana' ? diaDaSemana(destino)[6] : null

  const mesmoLugar = inicioDestino
    ? chaveDia(inicioDestino) === chaveDia(inicioOrigem)
    : false

  const resultado = destino && !mesmoLugar ? simular(destino) : null
  const copiadas = resultado
    ? substituir
      ? resultado.total
      : resultado.total - resultado.ocupadas
    : 0

  let aviso = ''
  if (!destino) {
    aviso = 'Escolha uma data.'
  } else if (mesmoLugar) {
    aviso = tipo === 'dia' ? 'Escolha outro dia.' : 'Escolha outra semana.'
  } else if (resultado && resultado.total === 0) {
    aviso = 'Não há refeições planejadas pra copiar.'
  } else if (resultado && copiadas === 0) {
    aviso = 'Todos os horários do destino já estão preenchidos. Escolha "Substituir tudo" pra copiar mesmo assim.'
  } else if (resultado) {
    aviso = `Vai copiar ${plural(copiadas)}.`
    if (resultado.ocupadas > 0) {
      aviso += substituir
        ? ` ${plural(resultado.ocupadas)} que já existem serão substituídas.`
        : ` ${plural(resultado.ocupadas)} já têm algo e serão mantidas.`
    }
  }

  const botaoModo = (ativo: boolean) =>
    ativo
      ? 'rounded-xl bg-leaf-600 px-3 py-1 text-sm font-semibold text-white'
      : 'rounded-xl bg-white/70 px-3 py-1 text-sm font-semibold text-leaf-800'

  return (
    <div
      role='dialog'
      aria-modal='true'
      className='fixed inset-0 z-[60] flex items-center justify-center bg-soil-900/50 p-4 backdrop-blur-sm'
    >
      <div className='flex w-full max-w-md flex-col gap-4 rounded-2xl bg-bark-100 p-5 text-leaf-800 shadow-xl'>
        <h2 className='text-xl font-bold'>
          {tipo === 'dia'
            ? `Copiar o dia ${formatarDiaMes(origem)} para...`
            : 'Copiar esta semana para...'}
        </h2>

        <label className='flex flex-col gap-1 text-sm font-semibold'>
          {tipo === 'dia' ? 'Dia de destino' : 'Qualquer dia da semana de destino'}
          <input
            type='date'
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className='rounded-lg bg-white px-3 py-1 font-normal outline-none ring-1 ring-leaf-400 focus:ring-2'
          />
        </label>

        {inicioDestino && fimDestino && !mesmoLugar && (
          <p className='text-sm'>
            Semana de destino:{' '}
            <span className='font-semibold'>
              {formatarDiaMes(inicioDestino)} a {formatarDiaMes(fimDestino)}
            </span>
          </p>
        )}

        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => setSubstituir(false)}
            className={botaoModo(!substituir)}
          >
            Só onde está vazio
          </button>
          <button
            type='button'
            onClick={() => setSubstituir(true)}
            className={botaoModo(substituir)}
          >
            Substituir tudo
          </button>
        </div>

        <p className='whitespace-normal break-words text-sm'>{aviso}</p>
        <p className='text-xs text-leaf-600'>
          O registro de "como foi" (comemos como planejado) não é copiado.
        </p>

        <div className='flex justify-end gap-2'>
          <button
            type='button'
            onClick={onFechar}
            className='rounded-xl bg-white/70 px-4 py-1 font-semibold'
          >
            Cancelar
          </button>
          <button
            type='button'
            onClick={() => destino && onConfirmar(destino, substituir)}
            disabled={!destino || mesmoLugar || copiadas === 0}
            className='rounded-xl bg-leaf-600 px-4 py-1 font-semibold text-white disabled:opacity-50'
          >
            Copiar
          </button>
        </div>
      </div>
    </div>
  )
}