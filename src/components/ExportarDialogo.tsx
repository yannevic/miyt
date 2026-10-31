import { useEffect, useMemo, useState } from 'react'
import { gerarTexto } from '../utils/exportar'
import type { PeriodoExportar, QuemExportar } from '../utils/exportar'
import type { Planejamento } from '../data/planejamento'
import type { ItemCatalogo } from '../data/catalogo'

type ExportarDialogoProps = {
  base: Date
  planejamento: Planejamento
  catalogo: ItemCatalogo[]
  onFechar: () => void
}

const periodos: { id: PeriodoExportar; nome: string }[] = [
  { id: 'semana', nome: 'Semana' },
  { id: 'mes', nome: 'Mês' },
]

const pessoas: { id: QuemExportar; nome: string }[] = [
  { id: 'ambos', nome: 'Nós dois' },
  { id: 'nana', nome: 'Nana' },
  { id: 'miguel', nome: 'Miguel' },
]

export function ExportarDialogo({ base, planejamento, catalogo, onFechar }: ExportarDialogoProps) {
  const [periodo, setPeriodo] = useState<PeriodoExportar>('semana')
  const [quem, setQuem] = useState<QuemExportar>('ambos')
  const [incluirRegistro, setIncluirRegistro] = useState(true)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    function aoApertar(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', aoApertar)
    return () => window.removeEventListener('keydown', aoApertar)
  }, [onFechar])

  const texto = useMemo(
    () => gerarTexto({ periodo, quem, base, planejamento, catalogo, incluirRegistro }),
    [periodo, quem, base, planejamento, catalogo, incluirRegistro],
  )

  function copiar() {
    navigator.clipboard
      .writeText(texto)
      .then(() => {
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
      })
      .catch((erro) => console.error('Erro ao copiar:', erro))
  }

  function baixar() {
    const blob = new Blob([texto], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cardapio-' + periodo + '-' + quem + '.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-soil-900/30 p-4 backdrop-blur-sm"
      onClick={onFechar}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col gap-3 rounded-2xl bg-white/70 p-5 shadow-xl backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-leaf-800">Exportar cardápio</h2>

        <div className="flex flex-wrap items-center gap-2">
          {periodos.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={
                periodo === p.id
                  ? 'rounded-full bg-leaf-600 px-3 py-1 text-white'
                  : 'rounded-full bg-white/60 px-3 py-1 text-leaf-800'
              }
            >
              {p.nome}
            </button>
          ))}
          <span className="mx-1 text-leaf-400">|</span>
          {pessoas.map((p) => (
            <button
              key={p.id}
              onClick={() => setQuem(p.id)}
              className={
                quem === p.id
                  ? 'rounded-full bg-leaf-600 px-3 py-1 text-white'
                  : 'rounded-full bg-white/60 px-3 py-1 text-leaf-800'
              }
            >
              {p.nome}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-leaf-800">
          <input
            type="checkbox"
            checked={incluirRegistro}
            onChange={(e) => setIncluirRegistro(e.target.checked)}
          />
          Incluir o registro de como foi
        </label>

        <textarea
          readOnly
          value={texto}
          className="min-h-64 flex-1 rounded-xl bg-white/60 p-3 font-mono text-xs text-leaf-950"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onFechar} className="rounded-full bg-white/60 px-4 py-1 text-leaf-800">
            Fechar
          </button>
          <button onClick={baixar} className="rounded-full bg-white/60 px-4 py-1 text-leaf-800">
            Baixar .md
          </button>
          <button onClick={copiar} className="rounded-full bg-leaf-600 px-4 py-1 text-white">
            {copiado ? 'Copiado!' : 'Copiar texto'}
          </button>
        </div>
      </div>
    </div>
  )
}