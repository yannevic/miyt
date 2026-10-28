import { Pencil, Utensils, X } from 'lucide-react'
import { categorias } from '../data/catalogo'
import { useCatalogo } from '../data/catalogoContexto'
import { icones } from '../data/icones'
import type { ItemEscolhido, Refeicao } from '../data/planejamento'
import type { TipoRefeicao } from '../data/refeicoes'
import { formatarDataCompleta, nomesDias } from '../utils/datas'
import { ordenarEscolhidos } from '../utils/ordenar'

type CardapioRefeicaoProps = {
  data: Date
  refeicao: TipoRefeicao
  dados: Refeicao
  onEditar: () => void
  onFechar: () => void
}

function ListaPorCategoria({ itens }: { itens: ItemEscolhido[] }) {
  const { itens: catalogo, achar } = useCatalogo()
  const ordenados = ordenarEscolhidos(itens, catalogo)

  if (ordenados.length === 0) {
    return <p className='text-center text-sm italic text-leaf-600'>Nada planejado</p>
  }

  return (
    <div className='flex flex-col gap-3'>
      {categorias.map((categoria) => {
        const daCategoria = ordenados.filter((escolhido) => {
          const item = achar(escolhido.item)
          return item?.categoria === categoria.id
        })
        if (daCategoria.length === 0) return null

        return (
          <div key={categoria.id}>
            <p className='mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-leaf-600'>
              <span
                className='inline-block h-2 w-2 rounded-full'
                style={{ backgroundColor: categoria.cor }}
              />
              {categoria.nome}
            </p>
            <div className='flex flex-col gap-1'>
              {daCategoria.map((escolhido, i) => {
                const item = achar(escolhido.item)
                if (!item) return null
                const Icone = icones[item.icone]
                const principal = item.pedeNome ? escolhido.detalhe ?? item.nome : item.nome
                const secundario = item.pedeNome ? undefined : escolhido.detalhe

                return (
                  <div key={i} className='flex items-center gap-3'>
                    <span
                      className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-leaf-950'
                      style={{ backgroundColor: categoria.cor }}
                    >
                      <Icone size={18} />
                    </span>
                    <p className='font-semibold'>
                      {principal}
                      {secundario && (
                        <span className='ml-2 font-normal italic text-leaf-600'>
                          {secundario}
                        </span>
                      )}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function CardapioRefeicao({
  data,
  refeicao,
  dados,
  onEditar,
  onFechar,
}: CardapioRefeicaoProps) {
  const fundo =
    dados.modo === 'juntos'
      ? 'bg-linear-to-br from-petal-200 to-lilac-200'
      : 'bg-bark-100'

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-soil-900/40 p-4'>
      <div className={`flex w-full max-w-xl flex-col gap-5 rounded-3xl p-6 text-leaf-800 shadow-xl ${fundo}`}>
        <div className='flex items-center justify-between'>
          <button
            type='button'
            onClick={onEditar}
            className='flex items-center gap-2 rounded-xl bg-white/70 px-4 py-1 font-semibold'
          >
            <Pencil size={16} />
            Editar
          </button>
          <button
            type='button'
            onClick={onFechar}
            className='rounded-xl bg-white/70 p-2'
            aria-label='Fechar'
          >
            <X size={18} />
          </button>
        </div>

        <div className='flex flex-col items-center gap-1 text-center'>
          <p className='text-xs font-bold uppercase tracking-[0.3em] text-leaf-600'>
            Cardápio
          </p>
          <h2 className='text-4xl font-bold'>{refeicao.nome}</h2>
          <p className='text-sm'>
            {nomesDias[data.getDay()]}, {formatarDataCompleta(data)}
          </p>
          <div className='mt-2 flex w-full items-center gap-3 text-leaf-600'>
            <span className='h-px flex-1 bg-leaf-600/40' />
            <Utensils size={16} />
            <span className='h-px flex-1 bg-leaf-600/40' />
          </div>
        </div>

        {dados.modo === 'juntos' ? (
          <div className='rounded-2xl bg-white/50 p-4'>
            <p className='mb-3 text-center text-sm font-bold text-leaf-600'>Juntos</p>
            <ListaPorCategoria itens={dados.juntos} />
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='rounded-2xl bg-petal-200/80 p-4'>
              <p className='mb-3 text-center text-sm font-bold text-petal-600'>Nana</p>
              <ListaPorCategoria itens={dados.nana} />
            </div>
            <div className='rounded-2xl bg-lilac-200/80 p-4'>
              <p className='mb-3 text-center text-sm font-bold text-lilac-600'>Miguel</p>
              <ListaPorCategoria itens={dados.miguel} />
            </div>
          </div>
        )}

        {dados.obs && (
          <p className='rounded-2xl bg-white/50 p-3 text-center text-sm italic'>
            {dados.obs}
          </p>
        )}
      </div>
    </div>
  )
}