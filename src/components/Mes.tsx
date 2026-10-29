import { useCatalogo } from '../data/catalogoContexto'
import { iconesRefeicao } from '../data/iconesRefeicao'
import type { ItemCatalogo } from '../data/catalogo'
import type { ItemEscolhido, Planejamento, Refeicao } from '../data/planejamento'
import { refeicoes } from '../data/refeicoes'
import { chaveDia, nomesDias } from '../utils/datas'
import { diasDoMes } from '../utils/mes'
import { ordenarEscolhidos } from '../utils/ordenar'
import { formatarDiaMes } from '../utils/semana'

type MesProps = {
  base: Date
  planejamento: Planejamento
  onAbrirDia: (data: Date) => void
}

type CelulaDiaProps = {
  data: Date
  doMes: boolean
  hoje: boolean
  coluna: number
  linha: number
  doDia?: Partial<Record<string, Refeicao>>
  onClick: () => void
}

type Achar = (id: string) => ItemCatalogo | undefined

// Transforma uma lista de itens em texto: 'Arroz, Feijão, Frango (assado)'
function textoItens(itens: ItemEscolhido[], catalogo: ItemCatalogo[], achar: Achar): string {
  const nomes: string[] = []
  for (const escolhido of ordenarEscolhidos(itens, catalogo)) {
    const item = achar(escolhido.item)
    if (!item) continue
    if (item.pedeNome) {
      nomes.push(escolhido.detalhe ?? item.nome)
    } else if (escolhido.detalhe) {
      nomes.push(`${item.nome} (${escolhido.detalhe})`)
    } else {
      nomes.push(item.nome)
    }
  }
  return nomes.join(', ') || 'Nada planejado'
}

function Barra({ refeicao }: { refeicao?: Refeicao }) {
  if (!refeicao) {
    return <span className='h-4 flex-1 rounded-md bg-white/60' />
  }

  if (refeicao.modo === 'juntos') {
    return (
      <span className='flex h-4 flex-1 items-center justify-center rounded-md bg-linear-to-r from-petal-200 to-lilac-200 text-[10px] font-bold text-leaf-800'>
        {refeicao.juntos.length}
      </span>
    )
  }

  return (
    <span className='grid h-4 flex-1 grid-cols-2 overflow-hidden rounded-md text-[10px] font-bold text-leaf-800'>
      <span className='flex items-center justify-center bg-petal-200'>
        {refeicao.nana.length}
      </span>
      <span className='flex items-center justify-center bg-lilac-200'>
        {refeicao.miguel.length}
      </span>
    </span>
  )
}

function CelulaDia({ data, doMes, hoje, coluna, linha, doDia, onClick }: CelulaDiaProps) {
  const { itens: catalogo, achar } = useCatalogo()
  const temAlgo = refeicoes.some((r) => doDia?.[r.id])

  let fundo = doMes ? 'bg-white/60 hover:bg-white/90' : 'bg-white/30 hover:bg-white/60'
  if (hoje) fundo = 'bg-petal-200/50 hover:bg-petal-200/80 ring-2 ring-petal-600'

  const alinhar = coluna >= 4 ? 'right-0' : 'left-0'
  const posicao = linha >= 3 ? 'bottom-full mb-2' : 'top-full mt-2'

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={`group/dia relative flex min-h-24 cursor-pointer flex-col gap-1 rounded-xl p-2 text-left transition hover:z-40 ${fundo}`}
    >
      <div className={`flex flex-col gap-1 ${doMes ? '' : 'opacity-50'}`}>
        <p className='text-sm font-bold text-leaf-800'>{data.getDate()}</p>
        {refeicoes.map((r) => {
          const Icone = iconesRefeicao[r.id]
          return (
            <div key={r.id} className='flex items-center gap-1 text-leaf-600'>
              <Icone size={12} />
              <Barra refeicao={doDia?.[r.id]} />
            </div>
          )
        })}
      </div>

      {temAlgo && (
        <div
          className={`pointer-events-none invisible absolute z-50 w-64 max-w-[80vw] rounded-2xl bg-white/50 p-3 text-leaf-800 opacity-0 shadow-xl ring-1 ring-white/70 backdrop-blur-md transition group-hover/dia:visible group-hover/dia:opacity-100 ${alinhar} ${posicao}`}
        >
          <p className='mb-2 text-xs font-bold uppercase tracking-widest text-leaf-600'>
            {nomesDias[data.getDay()]} · {formatarDiaMes(data)}
          </p>

          <div className='flex flex-col gap-2'>
            {refeicoes.map((r) => {
              const refeicao = doDia?.[r.id]
              if (!refeicao) return null
              const Icone = iconesRefeicao[r.id]

              return (
                <div key={r.id}>
                  <p className='flex items-center gap-1 text-sm font-bold'>
                    <Icone size={14} />
                    {r.nome}
                  </p>

                  {refeicao.modo === 'juntos' ? (
                    <p className='whitespace-normal break-words text-sm'>
                      {textoItens(refeicao.juntos, catalogo, achar)}
                    </p>
                  ) : (
                    <>
                      <p className='whitespace-normal break-words text-sm'>
                        <span className='font-semibold text-petal-600'>Nana: </span>
                        {textoItens(refeicao.nana, catalogo, achar)}
                      </p>
                      <p className='whitespace-normal break-words text-sm'>
                        <span className='font-semibold text-lilac-600'>Miguel: </span>
                        {textoItens(refeicao.miguel, catalogo, achar)}
                      </p>
                    </>
                  )}

                  {refeicao.obs && (
                    <p className='whitespace-normal break-words text-xs italic'>
                      {refeicao.obs}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function Mes({ base, planejamento, onAbrirDia }: MesProps) {
  const dias = diasDoMes(base)
  const hoje = new Date().toDateString()

  return (
    <div className='flex flex-col gap-2 p-4'>
      <div className='grid grid-cols-7 gap-2'>
        {nomesDias.map((nome) => (
          <div
            key={nome}
            className='rounded-xl bg-white/60 p-2 text-center font-bold text-leaf-800'
          >
            {nome}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-2'>
        {dias.map((data, i) => (
          <CelulaDia
            key={chaveDia(data)}
            data={data}
            doMes={data.getMonth() === base.getMonth()}
            hoje={data.toDateString() === hoje}
            coluna={i % 7}
            linha={Math.floor(i / 7)}
            doDia={planejamento[chaveDia(data)]}
            onClick={() => onAbrirDia(data)}
          />
        ))}
      </div>
    </div>
  )
}