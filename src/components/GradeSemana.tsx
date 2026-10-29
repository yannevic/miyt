import { Check, Copy, Plus, Repeat } from 'lucide-react'
import { categorias } from '../data/catalogo'
import { useCatalogo } from '../data/catalogoContexto'
import { icones } from '../data/icones'
import { iconesRefeicao } from '../data/iconesRefeicao'
import type {
  ItemEscolhido,
  Pessoa,
  Planejamento,
  Refeicao,
  Registro,
} from '../data/planejamento'
import { refeicoes, type TipoRefeicao } from '../data/refeicoes'
import { chaveDia, nomesDias } from '../utils/datas'
import { ordenarEscolhidos } from '../utils/ordenar'
import { formatarDiaMes } from '../utils/semana'

type GradeSemanaProps = {
  dias: Date[]
  planejamento: Planejamento
  onAbrir: (data: Date, refeicao: TipoRefeicao) => void
  onCopiarDia: (data: Date) => void
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
  registro?: Registro
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

function textoRegistro(registro: Registro): string {
  if (registro.status === 'planejado') return 'Comemos como planejado'
  return registro.real ? `Foi diferente: ${registro.real}` : 'Foi diferente'
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
function Popover({ quem, titulo, itens, obs, registro, alinhar, cima }: PopoverProps) {
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

      {registro && (
        <p className='mt-2 whitespace-normal break-words border-t border-leaf-600/20 pt-2 text-xs font-semibold'>
          {textoRegistro(registro)}
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

  const registro = refeicao?.registro

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
            registro={registro}
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
              registro={registro}
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
              registro={registro}
              alinhar={alinhar}
              cima={cima}
            />
          </div>
        </div>
      )}

      {registro && (
        <span
          title={textoRegistro(registro)}
          className={`absolute right-1 top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full text-white ${
            registro.status === 'planejado' ? 'bg-leaf-600' : 'bg-bark-700'
          }`}
        >
          {registro.status === 'planejado' ? <Check size={10} /> : <Repeat size={10} />}
        </span>
      )}
    </div>
  )
}

export function GradeSemana({ dias, planejamento, onAbrir, onCopiarDia }: GradeSemanaProps) {
  const hoje = new Date().toDateString()

  // Resumo da semana: quantas refeições foram como planejado, diferentes ou ainda sem registro
  const agora = new Date()
  let comoPlanejado = 0
  let diferentes = 0
  let semRegistro = 0
  for (const data of dias) {
    const doDia = planejamento[chaveDia(data)]
    if (!doDia) continue
    for (const r of refeicoes) {
      const refeicao = doDia[r.id]
      if (!refeicao) continue
      if (refeicao.registro?.status === 'planejado') comoPlanejado++
      else if (refeicao.registro?.status === 'diferente') diferentes++
      else if (data <= agora) semRegistro++
    }
  }
  const mostrarResumo = comoPlanejado + diferentes + semRegistro > 0

  return (
    <div className='flex flex-col gap-2 p-4'>
      {mostrarResumo && (
        <p className='px-1 text-sm text-leaf-600'>
          Registro da semana: {comoPlanejado} como planejado · {diferentes} diferentes ·{' '}
          {semRegistro} sem registro
        </p>
      )}

      <div className={colunas}>
        <div></div>
        {dias.map((data) => (
          <div
            key={data.toISOString()}
            className={
              data.toDateString() === hoje
                ? 'relative rounded-xl bg-petal-200 p-2 text-center text-leaf-800 ring-2 ring-petal-600'
                : 'relative rounded-xl bg-white/60 p-2 text-center text-leaf-800'
            }
          >
            <button
              type='button'
              onClick={() => onCopiarDia(data)}
              title='Copiar este dia'
              aria-label={`Copiar o dia ${formatarDiaMes(data)}`}
              className='absolute right-1 top-1 rounded-md p-1 text-leaf-600 opacity-60 transition hover:bg-white/70 hover:opacity-100'
            >
              <Copy size={14} />
            </button>
            <p className='font-bold'>{nomesDias[data.getDay()]}</p>
            <p className='text-sm'>{formatarDiaMes(data)}</p>
          </div>
        ))}
      </div>

      {refeicoes.map((refeicao, linha) => {
        const IconeRefeicao = iconesRefeicao[refeicao.id]
        return (
          <div key={refeicao.id} className={colunas}>
            <div className='flex items-center gap-2 font-semibold text-leaf-800'>
              <IconeRefeicao size={18} />
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
        )
      })}
    </div>
  )
}