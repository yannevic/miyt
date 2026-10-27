import { Plus } from 'lucide-react'
import { categorias, catalogoInicial } from '../data/catalogo'
import { icones } from '../data/icones'
import type { ItemEscolhido, Planejamento, Refeicao } from '../data/planejamento'
import { refeicoes, type TipoRefeicao } from '../data/refeicoes'
import { chaveDia, nomesDias } from '../utils/datas'
import { ordenarEscolhidos } from '../utils/ordenar'
import { formatarDiaMes } from '../utils/semana'

type GradeSemanaProps = {
  dias: Date[]
  planejamento: Planejamento
  onAbrir: (data: Date, refeicao: TipoRefeicao) => void
}

type CelulaProps = {
  refeicao?: Refeicao
  hoje: boolean
  onClick: () => void
}

const colunas = 'grid grid-cols-[6rem_repeat(7,1fr)] gap-2'

function IconesDosItens({ itens }: { itens: ItemEscolhido[] }) {
  return (
    <div className='flex w-full flex-wrap content-center items-center justify-center gap-1 p-1'>
      {ordenarEscolhidos(itens).map((escolhido, i) => {
        const item = catalogoInicial.find((c) => c.id === escolhido.item)
        if (!item) return null
        const categoria = categorias.find((c) => c.id === item.categoria)
        const Icone = icones[item.icone]
        const rotulo = item.pedeNome
          ? (escolhido.detalhe ?? item.nome)
          : escolhido.detalhe
            ? `${item.nome}: ${escolhido.detalhe}`
            : item.nome
        return (
          <span
            key={i}
            title={rotulo}
            className='flex h-7 w-7 items-center justify-center rounded-lg text-leaf-950'
            style={{ backgroundColor: categoria?.cor }}
          >
            <Icone size={18} />
          </span>
        )
      })}
    </div>
  )
}

function Celula({ refeicao, hoje, onClick }: CelulaProps) {
  let fundo = 'bg-white/60 hover:bg-white/90'
  if (hoje) fundo = 'bg-petal-200/50 hover:bg-petal-200/80'
  if (refeicao?.modo === 'juntos') {
    fundo = 'bg-linear-to-br from-petal-200 to-lilac-200 hover:brightness-95'
  }
  const anel = hoje ? 'ring-2 ring-petal-600' : ''

  return (
    <button
      type='button'
      onClick={onClick}
      title={refeicao?.obs || undefined}
      className={`group flex min-h-20 w-full cursor-pointer overflow-hidden rounded-xl text-left transition ${fundo} ${anel}`}
    >
      {!refeicao && (
        <span className='flex w-full items-center justify-center text-leaf-600 opacity-0 transition group-hover:opacity-60'>
          <Plus size={20} />
        </span>
      )}

      {refeicao?.modo === 'juntos' && (
        <div className='flex w-full'>
          <IconesDosItens itens={refeicao.juntos} />
        </div>
      )}

      {refeicao?.modo === 'separado' && (
        <div className='grid w-full grid-cols-2'>
          <div className='flex bg-petal-200/80'>
            <IconesDosItens itens={refeicao.nana} />
          </div>
          <div className='flex bg-lilac-200/80'>
            <IconesDosItens itens={refeicao.miguel} />
          </div>
        </div>
      )}
    </button>
  )
}

export function GradeSemana({ dias, planejamento, onAbrir }: GradeSemanaProps) {
  const hoje = new Date().toDateString()

  return (
    <div className='flex flex-col gap-2 p-4'>
      <div className={colunas}>
        <div></div>
        {dias.map((data) => (
          <div
            key={data.toISOString()}
            className={
              data.toDateString() === hoje
                ? 'rounded-xl bg-petal-200 p-2 text-center text-leaf-800 ring-2 ring-petal-600'
                : 'rounded-xl bg-white/60 p-2 text-center text-leaf-800'
            }
          >
            <p className='font-bold'>{nomesDias[data.getDay()]}</p>
            <p className='text-sm'>{formatarDiaMes(data)}</p>
          </div>
        ))}
      </div>

      {refeicoes.map((refeicao) => (
        <div key={refeicao.id} className={colunas}>
          <div className='flex items-center font-semibold text-leaf-800'>
            {refeicao.nome}
          </div>
          {dias.map((data) => (
            <Celula
              key={data.toISOString()}
              refeicao={planejamento[chaveDia(data)]?.[refeicao.id]}
              hoje={data.toDateString() === hoje}
              onClick={() => onAbrir(data, refeicao)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}