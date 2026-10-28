import { Plus } from 'lucide-react'
import { categorias } from '../data/catalogo'
import { useCatalogo } from '../data/catalogoContexto'
import { icones } from '../data/icones'
import type {
  ItemEscolhido,
  Pessoa,
  Planejamento,
  Refeicao,
} from '../data/planejamento'
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
  nomeRefeicao: string
  hoje: boolean
  coluna: number
  linha: number
  onClick: () => void
}

type PopoverProps = {
  quem: Pessoa
  titulo: string
  itens: ItemEscolhido[]
  obs: string
  alinhar: 'esquerda' | 'direita'
  cima: boolean
}

const colunas = 'grid grid-cols-[6rem_repeat(7,1fr)] gap-2'

// As classes ficam escritas por inteiro (e não montadas com texto) pro Tailwind enxergar todas
const aparecer: Record<Pessoa, string> = {
  juntos: 'invisible opacity-0 group-hover/juntos:visible group-hover/juntos:opacity-100',
  nana: 'invisible opacity-0 group-hover/nana:visible group-hover/nana:opacity-100',
  miguel: 'invisible opacity-0 group-hover/miguel:visible group-hover/miguel:opacity-100',
}

const nomesQuem: Record<Pessoa, string> = {
  juntos: 'Juntos',
  nana: 'Nana',
  miguel: 'Miguel',
}

function IconesDosItens({ itens }: { itens: ItemEscolhido[] }) {
  const { itens: catalogo, achar } = useCatalogo()

  return (
    <div className='flex w-full flex-wrap content-center items-center justify-center gap-1 p-1'>
      {ordenarEscolhidos(itens, catalogo).map((escolhido, i) => {
        const item = achar(escolhido.item)
        if (!item) return null
        const categoria = categorias.find((c) => c.id === item.categoria)
        const Icone = icones[item.icone]
        return (
          <span
            key={i}
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

// Cartão de vidro com a refeição completa, que aparece ao passar o mouse
function Popover({ quem, titulo, itens, obs, alinhar, cima }: PopoverProps) {
  const { itens: catalogo, achar } = useCatalogo()
  const ordenados = ordenarEscolhidos(itens, catalogo)

  return (
    <div
      className={`pointer-events-none absolute z-50 w-64 max-w-[80vw] rounded-2xl bg-white/50 p-3 text-leaf-800 shadow-xl ring-1 ring-white/70 backdrop-blur-md transition ${aparecer[quem]} ${
        alinhar === 'direita' ? 'right-0' : 'left-0'
      } ${cima ? 'bottom-full mb-2' : 'top-full mt-2'}`}
    >
      <p className='mb-2 text-xs font-bold uppercase tracking-widest text-leaf-600'>
        {titulo} · {nomesQuem[quem]}
      </p>

      {ordenados.length === 0 && (
        <p className='text-sm italic text-leaf-600'>Nada planejado</p>
      )}

      <div className='flex flex-col gap-1'>
        {ordenados.map((escolhido, i) => {
          const item = achar(escolhido.item)
          if (!item) return null
          const categoria = categorias.find((c) => c.id === item.categoria)
          const Icone = icones[item.icone]
          const principal = item.pedeNome ? (escolhido.detalhe ?? item.nome) : item.nome
          const secundario = item.pedeNome ? undefined : escolhido.detalhe

          return (
            <div key={i} className='flex items-start gap-2'>
              <span
                className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-leaf-950'
                style={{ backgroundColor: categoria?.cor }}
              >
                <Icone size={14} />
              </span>
              <p className='min-w-0 whitespace-normal break-words text-sm font-semibold'>
                {principal}
                {secundario && (
                  <span className='ml-1 font-normal italic text-leaf-600'>
                    {secundario}
                  </span>
                )}
              </p>
            </div>
          )
        })}
      </div>

      {obs && (
        <p className='mt-2 whitespace-normal break-words border-t border-leaf-600/20 pt-2 text-xs italic'>
          {obs}
        </p>
      )}
    </div>
  )
}

function Celula({ refeicao, nomeRefeicao, hoje, coluna, linha, onClick }: CelulaProps) {
  let fundo = 'bg-white/60 hover:bg-white/90'
  if (hoje) fundo = 'bg-petal-200/50 hover:bg-petal-200/80'
  if (refeicao?.modo === 'juntos') {
    fundo = 'bg-linear-to-br from-petal-200 to-lilac-200 hover:brightness-95'
  }
  const anel = hoje ? 'ring-2 ring-petal-600' : ''

  // Colunas do fim da semana abrem o cartão pra esquerda; as duas últimas linhas abrem pra cima
  const alinhar = coluna >= 4 ? 'direita' : 'esquerda'
  const cima = linha >= 2

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
      className={`group/juntos group relative flex min-h-20 w-full cursor-pointer rounded-xl text-left transition hover:z-40 ${fundo} ${anel}`}
    >
      {!refeicao && (
        <span className='flex w-full items-center justify-center text-leaf-600 opacity-0 transition group-hover:opacity-60'>
          <Plus size={20} />
        </span>
      )}

      {refeicao?.modo === 'juntos' && (
        <>
          <div className='flex w-full'>
            <IconesDosItens itens={refeicao.juntos} />
          </div>
          <Popover
            quem='juntos'
            titulo={nomeRefeicao}
            itens={refeicao.juntos}
            obs={refeicao.obs}
            alinhar={alinhar}
            cima={cima}
          />
        </>
      )}

      {refeicao?.modo === 'separado' && (
        <div className='grid w-full grid-cols-2'>
          <div className='group/nana relative flex rounded-l-xl bg-petal-200/80'>
            <IconesDosItens itens={refeicao.nana} />
            <Popover
              quem='nana'
              titulo={nomeRefeicao}
              itens={refeicao.nana}
              obs={refeicao.obs}
              alinhar={alinhar}
              cima={cima}
            />
          </div>
          <div className='group/miguel relative flex rounded-r-xl bg-lilac-200/80'>
            <IconesDosItens itens={refeicao.miguel} />
            <Popover
              quem='miguel'
              titulo={nomeRefeicao}
              itens={refeicao.miguel}
              obs={refeicao.obs}
              alinhar={alinhar}
              cima={cima}
            />
          </div>
        </div>
      )}
    </div>
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

      {refeicoes.map((refeicao, linha) => (
        <div key={refeicao.id} className={colunas}>
          <div className='flex items-center font-semibold text-leaf-800'>
            {refeicao.nome}
          </div>
          {dias.map((data, coluna) => (
            <Celula
              key={data.toISOString()}
              refeicao={planejamento[chaveDia(data)]?.[refeicao.id]}
              nomeRefeicao={refeicao.nome}
              hoje={data.toDateString() === hoje}
              coluna={coluna}
              linha={linha}
              onClick={() => onAbrir(data, refeicao)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}