import { useEffect, useState } from 'react'
import { onValue, ref, remove, set } from 'firebase/database'
import { db } from './firebase'
import { diaDaSemana, formatarDiaMes } from './utils/semana'
import { chaveDia } from './utils/datas'
import { nomesMeses } from './utils/mes'
import { GradeSemana } from './components/GradeSemana'
import { Mes } from './components/Mes'
import { Catalogo } from './components/Catalogo'
import { CardapioRefeicao } from './components/CardapioRefeicao'
import { ModalRefeicao } from './components/ModalRefeicao'
import { catalogoInicial, type CategoriaId, type ItemCatalogo } from './data/catalogo'
import { CatalogoContexto } from './data/catalogoContexto'
import { icones } from './data/icones'
import type { Planejamento, Refeicao } from './data/planejamento'
import type { Modo, RefeicaoId, TipoRefeicao } from './data/refeicoes'

type Edicao = {
  data: Date
  refeicao: TipoRefeicao
  editar: boolean
}

type Tela = 'semana' | 'mes' | 'catalogo'

type DadosBrutos = Record<string, Record<string, Partial<Refeicao>>>

// O Firebase não guarda listas vazias, então os campos podem faltar.
// Aqui a gente completa o que falta pra ficar no formato do app.
function normalizar(bruto: DadosBrutos | null): Planejamento {
  const resultado: Planejamento = {}
  if (!bruto) return resultado

  for (const dia of Object.keys(bruto)) {
    const refeicoesDoDia: Partial<Record<RefeicaoId, Refeicao>> = {}

    for (const id of Object.keys(bruto[dia]) as RefeicaoId[]) {
      const r = bruto[dia][id]
      const modo: Modo = r.modo ?? 'juntos'
      refeicoesDoDia[id] = {
        modo,
        juntos: r.juntos ?? [],
        nana: r.nana ?? [],
        miguel: r.miguel ?? [],
        obs: r.obs ?? '',
      }
    }

    resultado[dia] = refeicoesDoDia
  }

  return resultado
}

// O Firebase devolve uma lista como array (ou como objeto com chaves 0, 1, 2...).
// Aqui a gente aceita os dois jeitos e descarta item quebrado ou com ícone que não existe.
function normalizarCatalogo(bruto: unknown): ItemCatalogo[] {
  if (!bruto) return []
  const lista: unknown[] = Array.isArray(bruto)
    ? bruto
    : Object.values(bruto as Record<string, unknown>)

  return lista.filter((x): x is ItemCatalogo => {
    if (typeof x !== 'object' || x === null) return false
    const o = x as Record<string, unknown>
    return (
      typeof o.id === 'string' &&
      typeof o.nome === 'string' &&
      typeof o.categoria === 'string' &&
      typeof o.icone === 'string' &&
      o.icone in icones
    )
  })
}

// Cria o id do item novo a partir do nome (ex.: 'Strogonoff' vira 'strogonoff')
function criarId(nome: string, existentes: ItemCatalogo[]): string {
  const base =
    nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item'

  let id = base
  let n = 2
  while (existentes.some((item) => item.id === id)) {
    id = `${base}-${n}`
    n++
  }
  return id
}

// Grava (ou apaga, se refeicao for null) uma refeição no Firebase
function gravar(data: Date, id: RefeicaoId, refeicao: Refeicao | null) {
  const endereco = ref(db, `dias/${chaveDia(data)}/${id}`)

  if (refeicao) {
    // JSON.parse(JSON.stringify(...)) tira os campos undefined, que o Firebase não aceita
    set(endereco, JSON.parse(JSON.stringify(refeicao))).catch((erro) =>
      console.error('Erro ao salvar no Firebase:', erro),
    )
  } else {
    remove(endereco).catch((erro) =>
      console.error('Erro ao apagar no Firebase:', erro),
    )
  }
}

function App() {
  const [tela, setTela] = useState<Tela>('semana')
  const [dataBase, setDataBase] = useState(new Date())
  const [planejamento, setPlanejamento] = useState<Planejamento>({})
  const [catalogo, setCatalogo] = useState<ItemCatalogo[]>(catalogoInicial)
  const [editando, setEditando] = useState<Edicao | null>(null)
  const dias = diaDaSemana(dataBase)

  useEffect(() => {
    const parar = onValue(
      ref(db, 'dias'),
      (snapshot) => {
        setPlanejamento(normalizar(snapshot.val()))
      },
      (erro) => console.error('Erro ao ler do Firebase:', erro),
    )
    return parar
  }, [])

  useEffect(() => {
    const parar = onValue(
      ref(db, 'catalogo'),
      (snapshot) => {
        const valor = snapshot.val()

        // Banco ainda sem catálogo: grava o catálogo inicial lá (só acontece na primeira vez)
        if (valor === null) {
          set(ref(db, 'catalogo'), JSON.parse(JSON.stringify(catalogoInicial))).catch(
            (erro) => console.error('Erro ao criar o catálogo no Firebase:', erro),
          )
          return
        }

        const lista = normalizarCatalogo(valor)
        if (lista.length > 0) setCatalogo(lista)
      },
      (erro) => console.error('Erro ao ler o catálogo do Firebase:', erro),
    )
    return parar
  }, [])

  function mudarSemana(quantidade: number) {
    const nova = new Date(dataBase)
    nova.setDate(nova.getDate() + quantidade * 7)
    setDataBase(nova)
  }

  // Sempre cai no dia 1, pra evitar o JavaScript pular de mês (ex.: 31/01 + 1 mês)
  function mudarMes(quantidade: number) {
    setDataBase(new Date(dataBase.getFullYear(), dataBase.getMonth() + quantidade, 1))
  }

  function mudarPeriodo(quantidade: number) {
    if (tela === 'mes') {
      mudarMes(quantidade)
    } else {
      mudarSemana(quantidade)
    }
  }

  function abrirDiaNaSemana(data: Date) {
    setDataBase(data)
    setTela('semana')
  }

  function guardarRefeicao(data: Date, id: RefeicaoId, refeicao: Refeicao | null) {
    gravar(data, id, refeicao)
    // Não atualiza o planejamento aqui: o onValue acima recebe a mudança sozinho.
    setEditando(null)
  }

  // Copia (mover = false) ou move (mover = true) a refeição que está no modal
  function levarRefeicao(
    destino: Date,
    idDestino: RefeicaoId,
    refeicao: Refeicao,
    mover: boolean,
  ) {
    gravar(destino, idDestino, refeicao)
    if (mover && editando) {
      gravar(editando.data, editando.refeicao.id, null)
    }
    setEditando(null)
  }

  // Cadastra um item novo, sempre ANTES do 'Outro' da categoria
  function cadastrarItem(nome: string, categoria: CategoriaId, icone: string) {
    const novo: ItemCatalogo = { id: criarId(nome, catalogo), nome, categoria, icone }
    const lista = [...catalogo]
    const posicaoDoOutro = lista.findIndex(
      (item) => item.categoria === categoria && item.pedeNome,
    )

    if (posicaoDoOutro === -1) {
      lista.push(novo)
    } else {
      lista.splice(posicaoDoOutro, 0, novo)
    }

    set(ref(db, 'catalogo'), JSON.parse(JSON.stringify(lista))).catch((erro) =>
      console.error('Erro ao salvar o catálogo no Firebase:', erro),
    )
  }

  const refeicaoAberta = editando
    ? planejamento[chaveDia(editando.data)]?.[editando.refeicao.id]
    : undefined

  const inicio = formatarDiaMes(dias[0])
  const fim = formatarDiaMes(dias[6])
  const ano = dias[6].getFullYear()

  const titulo =
    tela === 'mes'
      ? `${nomesMeses[dataBase.getMonth()]} ${dataBase.getFullYear()}`
      : `${inicio} a ${fim}/${ano}`

  const abaAtiva = 'rounded-xl bg-leaf-600 px-3 py-1 font-semibold text-white'
  const abaInativa = 'rounded-xl bg-white/60 px-3 py-1 font-semibold text-leaf-800'

  return (
    <CatalogoContexto.Provider
      value={{
        itens: catalogo,
        achar: (id) => catalogo.find((item) => item.id === id),
        cadastrar: cadastrarItem,
      }}
    >
      <div className='bg-bark-100 min-h-screen'>
        <div className='flex items-center justify-between p-4'>
          <div className='flex items-center gap-4'>
            <h1 className='text-leaf-800 text-4xl font-bold'>Miyt</h1>
            <button
              onClick={() => setTela('semana')}
              className={tela === 'semana' ? abaAtiva : abaInativa}
            >
              Semana
            </button>
            <button
              onClick={() => setTela('mes')}
              className={tela === 'mes' ? abaAtiva : abaInativa}
            >
              Mês
            </button>
            <button
              onClick={() => setTela('catalogo')}
              className={tela === 'catalogo' ? abaAtiva : abaInativa}
            >
              Catálogo
            </button>
          </div>

          {tela !== 'catalogo' && (
            <div className='flex items-center gap-2 text-leaf-800'>
              <button
                onClick={() => mudarPeriodo(-1)}
                className='rounded-xl bg-white/60 px-3 py-1 font-bold'
              >
                ‹
              </button>
              <span className='min-w-48 text-center font-semibold'>{titulo}</span>
              <button
                onClick={() => mudarPeriodo(1)}
                className='rounded-xl bg-white/60 px-3 py-1 font-bold'
              >
                ›
              </button>
              <button
                onClick={() => setDataBase(new Date())}
                className='rounded-xl bg-petal-200 px-3 py-1 font-semibold'
              >
                Hoje
              </button>
            </div>
          )}
        </div>

        {tela === 'semana' && (
          <GradeSemana
            dias={dias}
            planejamento={planejamento}
            onAbrir={(data, refeicao) => {
              const existe = Boolean(planejamento[chaveDia(data)]?.[refeicao.id])
              setEditando({ data, refeicao, editar: !existe })
            }}
          />
        )}

        {tela === 'mes' && (
          <Mes
            base={dataBase}
            planejamento={planejamento}
            onAbrirDia={abrirDiaNaSemana}
          />
        )}

        {tela === 'catalogo' && <Catalogo />}

        {editando && refeicaoAberta && !editando.editar && (
          <CardapioRefeicao
            data={editando.data}
            refeicao={editando.refeicao}
            dados={refeicaoAberta}
            onEditar={() => setEditando({ ...editando, editar: true })}
            onFechar={() => setEditando(null)}
          />
        )}

        {editando && (editando.editar || !refeicaoAberta) && (
          <ModalRefeicao
            key={chaveDia(editando.data) + editando.refeicao.id}
            data={editando.data}
            dias={dias}
            planejamento={planejamento}
            refeicao={editando.refeicao}
            inicial={refeicaoAberta}
            onSalvar={(refeicao) =>
              guardarRefeicao(editando.data, editando.refeicao.id, refeicao)
            }
            onLevar={levarRefeicao}
            onApagar={() => guardarRefeicao(editando.data, editando.refeicao.id, null)}
            onFechar={() => setEditando(null)}
          />
        )}
      </div>
    </CatalogoContexto.Provider>
  )
}

export default App