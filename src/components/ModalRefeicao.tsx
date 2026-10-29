import { useState } from 'react'
import { X } from 'lucide-react'
import { categorias, type CategoriaId, type ItemCatalogo } from '../data/catalogo'
import { useCatalogo } from '../data/catalogoContexto'
import { icones } from '../data/icones'
import { iconesRefeicao } from '../data/iconesRefeicao'
import type { ItemEscolhido, Pessoa, Planejamento, Refeicao } from '../data/planejamento'
import { refeicoes, type Modo, type RefeicaoId, type TipoRefeicao } from '../data/refeicoes'
import { chaveDia, formatarDataCompleta, nomesDias } from '../utils/datas'
import { ordenarEscolhidos } from '../utils/ordenar'
import { formatarDiaMes } from '../utils/semana'
import { Confirmar } from './Confirmar'

type ModalRefeicaoProps = {
  data: Date
  dias: Date[]
  planejamento: Planejamento
  refeicao: TipoRefeicao
  inicial?: Refeicao
  onSalvar: (refeicao: Refeicao) => void
  onLevar: (
    destino: Date,
    idDestino: RefeicaoId,
    refeicao: Refeicao,
    mover: boolean,
  ) => void
  onApagar: () => void
  onFechar: () => void
}

type Listas = Record<Pessoa, ItemEscolhido[]>

// O que a janelinha de confirmação está perguntando no momento
type Pedido =
  | { tipo: 'apagar' }
  | { tipo: 'descartar' }
  | { tipo: 'substituir'; mover: boolean }

const nomesPessoas: Record<Pessoa, string> = {
  juntos: 'Juntos',
  nana: 'Nana',
  miguel: 'Miguel',
}

function precisaNome(
  escolhido: ItemEscolhido,
  achar: (id: string) => ItemCatalogo | undefined,
): boolean {
  const item = achar(escolhido.item)
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
  dias,
  planejamento,
  refeicao,
  inicial,
  onSalvar,
  onLevar,
  onApagar,
  onFechar,
}: ModalRefeicaoProps) {
  const { itens: catalogo, achar } = useCatalogo()
  const [modo, setModo] = useState<Modo>(inicial?.modo ?? refeicao.modoPadrao)
  const [listas, setListas] = useState<Listas>({
    juntos: inicial?.juntos ?? [],
    nana: inicial?.nana ?? [],
    miguel: inicial?.miguel ?? [],
  })
  const [obs, setObs] = useState(inicial?.obs ?? '')
  const [pessoa, setPessoa] = useState<'nana' | 'miguel'>('nana')
  const [categoriaId, setCategoriaId] = useState<CategoriaId>('base')
  const [destinoDia, setDestinoDia] = useState(chaveDia(data))
  const [destinoRefeicao, setDestinoRefeicao] = useState<RefeicaoId>(refeicao.id)
  const [pedido, setPedido] = useState<Pedido | null>(null)

  // Guarda como o modal estava ao abrir, pra saber se você mudou alguma coisa
  const [chaveInicial] = useState(() => JSON.stringify({ modo, listas, obs }))
  const mudou = JSON.stringify({ modo, listas, obs }) !== chaveInicial

  const listaAtual: Pessoa = modo === 'juntos' ? 'juntos' : pessoa
  const escolhidos = listas[listaAtual]

  // Só as listas do modo ativo contam (a aba que você está quando salva)
  const pessoasAtivas: Pessoa[] = modo === 'juntos' ? ['juntos'] : ['nana', 'miguel']
  const pendente = pessoasAtivas.find((p) =>
    listas[p].some((escolhido) => precisaNome(escolhido, achar)),
  )

  const mesmoLugar = destinoDia === chaveDia(data) && destinoRefeicao === refeicao.id

  function trocarLista(novaLista: ItemEscolhido[]) {
    setListas({ ...listas, [listaAtual]: novaLista })
  }

  function adicionar(itemId: string) {
    trocarLista(ordenarEscolhidos([...escolhidos, { item: itemId }], catalogo))
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

  // Monta a refeição só com o modo ativo; as listas do outro modo vão vazias
  function montarRefeicao(): Refeicao {
    return {
      modo,
      juntos: modo === 'juntos' ? limparDetalhes(listas.juntos) : [],
      nana: modo === 'separado' ? limparDetalhes(listas.nana) : [],
      miguel: modo === 'separado' ? limparDetalhes(listas.miguel) : [],
      obs: obs.trim(),
    }
  }

  function salvar() {
    if (pendente) return
    onSalvar(montarRefeicao())
  }

  // X e Cancelar: se mudou algo, pergunta antes de sair
  function tentarFechar() {
    if (mudou) {
      setPedido({ tipo: 'descartar' })
    } else {
      onFechar()
    }
  }

  function executarLevar(mover: boolean) {
    const dataDestino = dias.find((d) => chaveDia(d) === destinoDia)
    if (!dataDestino) return
    onLevar(dataDestino, destinoRefeicao, montarRefeicao(), mover)
  }

  function levar(mover: boolean) {
    if (pendente || mesmoLugar) return
    const jaExiste = Boolean(planejamento[destinoDia]?.[destinoRefeicao])
    if (jaExiste) {
      setPedido({ tipo: 'substituir', mover })
    } else {
      executarLevar(mover)
    }
  }

  function confirmar() {
    const atual = pedido
    setPedido(null)
    if (!atual) return
    if (atual.tipo === 'apagar') onApagar()
    if (atual.tipo === 'descartar') onFechar()
    if (atual.tipo === 'substituir') executarLevar(atual.mover)
  }

  function descreverPedido(p: Pedido) {
    if (p.tipo === 'apagar') {
      return {
        titulo: 'Apagar refeição?',
        mensagem: `Isso apaga o ${refeicao.nome.toLowerCase()} de ${nomesDias[data.getDay()]} ${formatarDiaMes(data)}. Não dá pra desfazer.`,
        confirmar: 'Apagar',
        cancelar: 'Cancelar',
        perigo: true,
      }
    }

    if (p.tipo === 'descartar') {
      return {
        titulo: 'Descartar alterações?',
        mensagem: 'Você mudou coisas e ainda não salvou. Se sair agora, elas serão perdidas.',
        confirmar: 'Descartar',
        cancelar: 'Continuar editando',
        perigo: true,
      }
    }

    const nomeDestino = refeicoes.find((r) => r.id === destinoRefeicao)?.nome ?? ''
    const diaDestino = dias.find((d) => chaveDia(d) === destinoDia)
    const quando = diaDestino
      ? `${nomesDias[diaDestino.getDay()]} ${formatarDiaMes(diaDestino)}`
      : ''

    return {
      titulo: 'Substituir refeição?',
      mensagem: `Já existe uma refeição em ${nomeDestino} (${quando}). Ela será substituída e não dá pra desfazer.`,
      confirmar: 'Substituir',
      cancelar: 'Cancelar',
      perigo: true,
    }
  }

  const textoPedido = pedido ? descreverPedido(pedido) : null

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

  const itensDaCategoria = catalogo.filter((item) => item.categoria === categoriaId)

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
            onClick={tentarFechar}
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
            const item = achar(escolhido.item)
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
                  <span className='break-words text-center text-sm font-semibold'>
                    {item.nome}
                  </span>
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

        <section className='flex flex-col gap-2 rounded-xl bg-white/60 p-3'>
          <h3 className='font-bold'>Copiar ou mover pra outro horário</h3>

          <div className='flex flex-wrap gap-2'>
            {dias.map((d) => {
              const chave = chaveDia(d)
              return (
                <button
                  key={chave}
                  type='button'
                  onClick={() => setDestinoDia(chave)}
                  className={
                    chave === destinoDia
                      ? 'rounded-xl bg-leaf-600 px-3 py-1 text-sm font-semibold text-white'
                      : 'rounded-xl bg-white/70 px-3 py-1 text-sm font-semibold text-leaf-800'
                  }
                >
                  {nomesDias[d.getDay()]} {formatarDiaMes(d)}
                </button>
              )
            })}
          </div>

          <div className='flex flex-wrap gap-2'>
            {refeicoes.map((r) => {
              const IconeRefeicao = iconesRefeicao[r.id]
              return (
                <button
                  key={r.id}
                  type='button'
                  onClick={() => setDestinoRefeicao(r.id)}
                  className={
                    r.id === destinoRefeicao
                      ? 'flex items-center gap-2 rounded-xl bg-leaf-600 px-3 py-1 text-sm font-semibold text-white'
                      : 'flex items-center gap-2 rounded-xl bg-white/70 px-3 py-1 text-sm font-semibold text-leaf-800'
                  }
                >
                  <IconeRefeicao size={16} />
                  {r.nome}
                </button>
              )
            })}
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <button
              type='button'
              onClick={() => levar(false)}
              disabled={mesmoLugar || Boolean(pendente)}
              className='rounded-xl bg-white/70 px-4 py-1 font-semibold disabled:opacity-50'
            >
              Copiar
            </button>
            <button
              type='button'
              onClick={() => levar(true)}
              disabled={mesmoLugar || Boolean(pendente)}
              className='rounded-xl bg-petal-200 px-4 py-1 font-semibold disabled:opacity-50'
            >
              Mover
            </button>
            {mesmoLugar && (
              <span className='text-sm text-leaf-600'>
                Escolha outro dia ou outra refeição.
              </span>
            )}
          </div>
        </section>

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
                onClick={() => setPedido({ tipo: 'apagar' })}
                className='rounded-xl bg-white/70 px-4 py-1 font-semibold text-petal-600'
              >
                Apagar refeição
              </button>
            )}
          </div>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={tentarFechar}
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

      {textoPedido && (
        <Confirmar
          titulo={textoPedido.titulo}
          mensagem={textoPedido.mensagem}
          textoConfirmar={textoPedido.confirmar}
          textoCancelar={textoPedido.cancelar}
          perigo={textoPedido.perigo}
          onConfirmar={confirmar}
          onCancelar={() => setPedido(null)}
        />
      )}
    </div>
  )
}