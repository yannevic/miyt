import { useEffect, useState } from 'react'
import { Copy, LogOut } from 'lucide-react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { onValue, ref, remove, set, update } from 'firebase/database'
import { auth, db } from './firebase'
import { diaDaSemana, formatarDiaMes } from './utils/semana'
import { chaveDia } from './utils/datas'
import { nomesMeses } from './utils/mes'
import { GradeSemana } from './components/GradeSemana'
import { Mes } from './components/Mes'
import { Catalogo } from './components/Catalogo'
import { CardapioRefeicao } from './components/CardapioRefeicao'
import { ModalRefeicao } from './components/ModalRefeicao'
import { CopiarDialogo } from './components/CopiarDialogo'
import { Login } from './components/Login'
import { catalogoInicial, type CategoriaId, type ItemCatalogo } from './data/catalogo'
import { CatalogoContexto } from './data/catalogoContexto'
import { icones } from './data/icones'
import type { Planejamento, Refeicao, Registro } from './data/planejamento'
import type { RefeicaoId, TipoRefeicao } from './data/refeicoes'

type Edicao = {
  data: Date
  refeicao: TipoRefeicao
  editar: boolean
}

type Copia = {
  tipo: 'dia' | 'semana'
  origem: Date
}

type Tela = 'semana' | 'mes' | 'catalogo'

type DadosBrutos = Record<string, Record<string, Partial<Refeicao>>>

type PrincipalProps = {
  email: string | null
  onSair: () => void
}

// O Firebase não guarda listas vazias, então os campos podem faltar.
// Aqui a gente completa o que falta pra ficar no formato do app.
function normalizar(bruto: DadosBrutos | null): Planejamento {
  const resultado: Planejamento = {}
  if (!bruto) return resultado

  for (const dia of Object.keys(bruto)) {
    const refeicoesDoDia: Partial<Record<RefeicaoId, Refeicao>> = {}

    for (const id of Object.keys(bruto[dia]) as RefeicaoId[]) {
      const r = bruto[dia][id]

      // Sem 'modo' não é uma refeição de verdade (pode sobrar só o registro de uma refeição apagada)
      if (!r.modo) continue

      const status = r.registro?.status
      const registro: Registro | undefined =
        status === 'planejado' || status === 'diferente'
          ? { status, real: r.registro?.real || undefined }
          : undefined

      refeicoesDoDia[id] = {
        modo: r.modo,
        juntos: r.juntos ?? [],
        nana: r.nana ?? [],
        miguel: r.miguel ?? [],
        obs: r.obs ?? '',
        registro,
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

// Grava (ou limpa) só o registro de 'como foi' de uma refeição
function registrar(data: Date, id: RefeicaoId, registro: Registro | undefined) {
  const endereco = ref(db, `dias/${chaveDia(data)}/${id}/registro`)

  if (registro) {
    set(endereco, JSON.parse(JSON.stringify(registro))).catch((erro) =>
      console.error('Erro ao salvar o registro no Firebase:', erro),
    )
  } else {
    remove(endereco).catch((erro) =>
      console.error('Erro ao limpar o registro no Firebase:', erro),
    )
  }
}

// O app de verdade: só aparece depois que alguém entrou
function Principal({ email, onSair }: PrincipalProps) {
  const [tela, setTela] = useState<Tela>('semana')
  const [dataBase, setDataBase] = useState(new Date())
  const [planejamento, setPlanejamento] = useState<Planejamento>({})
  const [catalogo, setCatalogo] = useState<ItemCatalogo[]>(catalogoInicial)
  const [editando, setEditando] = useState<Edicao | null>(null)
  const [copiando, setCopiando] = useState<Copia | null>(null)
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

  // Monta a cópia de um dia (ou de uma semana inteira) sem gravar nada ainda.
  // Devolve quantas refeições existem na origem, quantas já têm algo no destino
  // e os caminhos do Firebase que seriam gravados.
  function montarCopia(
    tipo: 'dia' | 'semana',
    origem: Date,
    destino: Date,
    substituir: boolean,
  ) {
    const origens = tipo === 'semana' ? diaDaSemana(origem) : [origem]
    const inicioDestino = tipo === 'semana' ? diaDaSemana(destino)[0] : destino

    let total = 0
    let ocupadas = 0
    const atualizacoes: Record<string, unknown> = {}

    origens.forEach((dataOrigem, i) => {
      const doDia = planejamento[chaveDia(dataOrigem)]
      if (!doDia) return

      const dataDestino = new Date(inicioDestino)
      dataDestino.setDate(inicioDestino.getDate() + i)
      const chaveDestino = chaveDia(dataDestino)

      for (const id of Object.keys(doDia) as RefeicaoId[]) {
        const refeicao = doDia[id]
        if (!refeicao) continue

        total++
        const ocupado = Boolean(planejamento[chaveDestino]?.[id])
        if (ocupado) ocupadas++
        if (ocupado && !substituir) continue

        // Copia só o planejado: o registro de 'como foi' não vai junto
        atualizacoes[`dias/${chaveDestino}/${id}`] = JSON.parse(
          JSON.stringify({
            modo: refeicao.modo,
            juntos: refeicao.juntos,
            nana: refeicao.nana,
            miguel: refeicao.miguel,
            obs: refeicao.obs,
          }),
        )
      }
    })

    return { total, ocupadas, atualizacoes }
  }

  function confirmarCopia(destino: Date, substituir: boolean) {
    if (!copiando) return
    const { atualizacoes } = montarCopia(copiando.tipo, copiando.origem, destino, substituir)

    if (Object.keys(atualizacoes).length > 0) {
      // update com vários caminhos grava tudo de uma vez
      update(ref(db), atualizacoes).catch((erro) =>
        console.error('Erro ao copiar no Firebase:', erro),
      )
    }

    setDataBase(destino)
    setCopiando(null)
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
        <div className='flex flex-wrap items-center justify-between gap-3 p-4'>
          <div className='flex flex-wrap items-center gap-4'>
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

          <div className='flex flex-wrap items-center gap-4'>
            {tela !== 'catalogo' && (
              <div className='flex flex-wrap items-center gap-2 text-leaf-800'>
                <button
                  onClick={() => mudarPeriodo(-1)}
                  aria-label={tela === 'mes' ? 'Mês anterior' : 'Semana anterior'}
                  className='rounded-xl bg-white/60 px-3 py-1 font-bold'
                >
                  ‹
                </button>
                <span className='min-w-48 text-center font-semibold'>{titulo}</span>
                <button
                  onClick={() => mudarPeriodo(1)}
                  aria-label={tela === 'mes' ? 'Próximo mês' : 'Próxima semana'}
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
                {tela === 'semana' && (
                  <button
                    type='button'
                    onClick={() => setCopiando({ tipo: 'semana', origem: dataBase })}
                    className='flex items-center gap-2 rounded-xl bg-white/60 px-3 py-1 font-semibold'
                  >
                    <Copy size={16} />
                    Copiar semana
                  </button>
                )}
              </div>
            )}

            <button
              type='button'
              onClick={onSair}
              title={email ? `Sair (${email})` : 'Sair'}
              className='flex items-center gap-2 rounded-xl bg-white/60 px-3 py-1 font-semibold text-leaf-800'
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>

        {tela === 'semana' && (
          <GradeSemana
            dias={dias}
            planejamento={planejamento}
            onAbrir={(data, refeicao) => {
              const existe = Boolean(planejamento[chaveDia(data)]?.[refeicao.id])
              setEditando({ data, refeicao, editar: !existe })
            }}
            onCopiarDia={(data) => setCopiando({ tipo: 'dia', origem: data })}
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
            onRegistrar={(registro) =>
              registrar(editando.data, editando.refeicao.id, registro)
            }
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

        {copiando && (
          <CopiarDialogo
            tipo={copiando.tipo}
            origem={copiando.origem}
            simular={(destino) => {
              const { total, ocupadas } = montarCopia(
                copiando.tipo,
                copiando.origem,
                destino,
                false,
              )
              return { total, ocupadas }
            }}
            onConfirmar={confirmarCopia}
            onFechar={() => setCopiando(null)}
          />
        )}
      </div>
    </CatalogoContexto.Provider>
  )
}

// A "portaria": decide se mostra o login ou o app
function App() {
  // undefined = ainda descobrindo se tem alguém logado; null = ninguém logado
  const [usuario, setUsuario] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    const parar = onAuthStateChanged(auth, (u) => setUsuario(u))
    return parar
  }, [])

  if (usuario === undefined) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-bark-100 text-leaf-800'>
        Carregando...
      </div>
    )
  }

  if (usuario === null) {
    return <Login />
  }

  return <Principal email={usuario.email} onSair={() => signOut(auth)} />
}

export default App