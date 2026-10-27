import { useState } from 'react'
import { X } from 'lucide-react'
import { categorias, catalogoInicial, type CategoriaId } from '../data/catalogo'
import { icones } from '../data/icones'
import type { ItemEscolhido, Pessoa, Refeicao } from '../data/planejamento'
import type { Modo, TipoRefeicao } from '../data/refeicoes'
import { formatarDataCompleta, nomesDias } from '../utils/datas'
import { ordenarEscolhidos } from '../utils/ordenar'

type ModalRefeicaoProps = {
  data: Date
  refeicao: TipoRefeicao
  inicial?: Refeicao
  onSalvar: (refeicao: Refeicao) => void
  onApagar: () => void
  onFechar: () => void
}

type Listas = Record<Pessoa, ItemEscolhido[]>

const pessoas: Pessoa[] = ['juntos', 'nana', 'miguel']

const nomesPessoas: Record<Pessoa, string> = {
  juntos: 'Juntos',
  nana: 'Nana',
  miguel: 'Miguel',
}

function procurarItem(id: string) {
  return catalogoInicial.find((item) => item.id === id)
}

function precisaNome(escolhido: ItemEscolhido): boolean {
  const item = procurarItem(escolhido.item)
  return Boolean(item?.pedeNome) && !(escolhido.detalhe ?? '').trim()
}

function limparDetalhes(lista: ItemEscolhido[]): ItemEscolhido[] {
  return lista.map((escolhido) => {
    const detalhe = (escolhido.detalhe ?? '').trim()
    return detalhe ? { item: escolhido.item, detalhe } : { item: escolhido.item }
  })
}

export function ModalRefeicao({
  data,
  refeicao,
  inicial,
  onSalvar,
  onApagar,
  onFechar,
}: ModalRefeicaoProps) {
  const [modo, setModo] = useState<Modo>(inicial?.modo ?? refeicao.modoPadrao)
  const [listas, setListas] = useState<Listas>({
    juntos: inicial?.juntos ?? [],
    nana: inicial?.nana ?? [],
    miguel: inicial?.miguel ?? [],
  })
  const [obs, setObs] = useState(inicial?.obs ?? '')
  const [pessoa, setPessoa] = useState<'nana' | 'miguel'>('nana')
  const [categoriaId, setCategoriaId] = useState<CategoriaId>('base')

  const listaAtual: Pessoa = modo === 'juntos' ? 'juntos' : pessoa
  const escolhidos = listas[listaAtual]
  const pendente = pessoas.find((p) => listas[p].some(precisaNome))

  function trocarLista(novaLista: ItemEscolhido[]) {
    setListas({ ...listas, [listaAtual]: novaLista })
  }

  function adicionar(itemId: string) {
    trocarLista(ordenarEscolhidos([...escolhidos, { item: itemId }]))
  }

  function mudarDetalhe(posicao: number, texto: string) {
    trocarLista(
      escolhidos.map((escolhido, i) =>
        i === posicao ? { ...escolhido, detalhe: texto } : escolhido,
      ),
    )
  }

  function remover(posicao: number) {
    trocarLista(escolhidos.filter((_, i) => i !== posicao))
  }

  function salvar() {
    if (pendente) return
    onSalvar({
      modo,
      juntos: limparDetalhes(listas.juntos),
      nana: limparDetalhes(listas.nana),
      miguel: limparDetalhes(listas.miguel),
      obs: obs.trim(),
    })
  }

  const botaoModo = (valor: Modo) =>
    modo === valor
      ? 'rounded-xl bg-leaf-600 px-4 py-1 font-semibold text-white'
      : 'rounded-xl bg-white/70 px-4 py-1 font-semibold text-leaf-800'

  const botaoPessoa = (valor: 'nana' | 'miguel') => {
    if (pessoa !== valor) {
      return 'rounded-xl bg-white/70 px-4 py-1 font-semibold text-leaf-800'
    }
    return valor === 'nana'
      ? 'rounded-xl bg-petal-200 px-4 py-1 font-semibold text-leaf-800 ring-2 ring-petal-600'
      : 'rounded-xl bg-lilac-200 px-4 py-1 font-semibold text-leaf-800 ring-2 ring-lilac-600'
  }

  const itensDaCategoria = catalogoInicial.filter(
    (item) => item.categoria === categoriaId,
  )

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-soil-900/40 p-4'>
      <div className='flex w-full max-w-2xl flex-col gap-4 rounded-2xl bg-bark-100 p-5 text-leaf-800 shadow-xl'>
        <div className='flex items-start justify-between'>
          <div>
            <h2 className='text-2xl font-bold'>{refeicao.nome}</h2>
            <p className='text-sm'>
              {nomesDias[data.getDay()]}, {formatarDataCompleta(data)}
            </p>
          </div>
          <button
            type='button'
            onClick={onFechar}
            className='rounded-xl bg-white/70 p-2'
            aria-label='Fechar'
          >
            <X size={18} />
          </button>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <button type='button' onClick={() => setModo('juntos')} className={botaoModo('juntos')}>
            Juntos
          </button>
          <button type='button' onClick={() => setModo('separado')} className={botaoModo('separado')}>
            Separado
          </button>
          {modo === 'separado' && (
            <>
              <span className='mx-1 text-leaf-600'>|</span>
              <button type='button' onClick={() => setPessoa('nana')} className={botaoPessoa('nana')}>
                Nana
              </button>
              <button type='button' onClick={() => setPessoa('miguel')} className={botaoPessoa('miguel')}>
                Miguel
              </button>
            </>
          )}
        </div>

        <section className='flex flex-col gap-2 rounded-xl bg-white/60 p-3'>
          <h3 className='font-bold'>Escolhidos ({nomesPessoas[listaAtual]})</h3>
          {escolhidos.length === 0 && (
            <p className='text-sm text-leaf-600'>Nenhum item ainda. Escolha nas categorias abaixo.</p>
          )}
          {escolhidos.map((escolhido, i) => {
            const item = procurarItem(escolhido.item)
            if (!item) return null
            const categoria = categorias.find((c) => c.id === item.categoria)
            const Icone = icones[item.icone]
            return (
              <div key={i} className='flex items-center gap-2'>
                <span
                  className='flex w-28 shrink-0 items-center gap-2 rounded-lg px-2 py-1 text-leaf-950'
                  style={{ backgroundColor: categoria?.cor }}
                >
                  <Icone size={18} />
                  <span className='text-sm font-semibold'>{item.nome}</span>
                </span>
                <input
                  type='text'
                  value={escolhido.detalhe ?? ''}
                  onChange={(e) => mudarDetalhe(i, e.target.value)}
                  placeholder={
                    item.pedeNome
                      ? 'Qual é? (obrigatório)'
                      : 'Detalhe (opcional), ex.: assado'
                  }
                  className='min-w-0 flex-1 rounded-lg bg-white px-3 py-1 text-sm outline-none ring-1 ring-leaf-400 focus:ring-2'
                />
                <button
                  type='button'
                  onClick={() => remover(i)}
                  className='rounded-lg bg-white/70 p-1'
                  aria-label={`Remover ${item.nome}`}
                >
                  <X size={16} />
                </button>
              </div>
            )
          })}
        </section>

        <section className='flex flex-col gap-2'>
          <div className='flex flex-wrap gap-2'>
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                type='button'
                onClick={() => setCategoriaId(categoria.id)}
                className={
                  categoria.id === categoriaId
                    ? 'rounded-xl px-3 py-1 text-sm font-semibold text-leaf-950 ring-2 ring-leaf-800'
                    : 'rounded-xl px-3 py-1 text-sm font-semibold text-leaf-950 opacity-70'
                }
                style={{ backgroundColor: categoria.cor }}
              >
                {categoria.nome}
              </button>
            ))}
          </div>
          <div className='flex flex-wrap gap-2'>
            {itensDaCategoria.map((item) => {
              const categoria = categorias.find((c) => c.id === item.categoria)
              const Icone = icones[item.icone]
              return (
                <button
                  key={item.id}
                  type='button'
                  onClick={() => adicionar(item.id)}
                  className='flex w-24 flex-col items-center gap-1 rounded-xl p-3 text-leaf-950 transition hover:scale-105'
                  style={{ backgroundColor: categoria?.cor }}
                >
                  <Icone size={26} />
                  <span className='text-sm font-semibold'>{item.nome}</span>
                </button>
              )
            })}
          </div>
        </section>

        <label className='flex flex-col gap-1 text-sm font-semibold'>
          Observação (opcional)
          <input
            type='text'
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            className='rounded-lg bg-white px-3 py-1 font-normal outline-none ring-1 ring-leaf-400 focus:ring-2'
          />
        </label>

        {pendente && (
          <p className='text-sm font-semibold text-petal-600'>
            Falta escrever o nome do item "Outro" (em {nomesPessoas[pendente]}).
          </p>
        )}

        <div className='flex items-center justify-between gap-2'>
          <div>
            {inicial && (
              <button
                type='button'
                onClick={onApagar}
                className='rounded-xl bg-white/70 px-4 py-1 font-semibold text-petal-600'
              >
                Apagar refeição
              </button>
            )}
          </div>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={onFechar}
              className='rounded-xl bg-white/70 px-4 py-1 font-semibold'
            >
              Cancelar
            </button>
            <button
              type='button'
              onClick={salvar}
              disabled={Boolean(pendente)}
              className='rounded-xl bg-leaf-600 px-4 py-1 font-semibold text-white disabled:opacity-50'
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}