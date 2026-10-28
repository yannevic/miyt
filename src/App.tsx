import { useState } from 'react'
import { ref, remove, set } from 'firebase/database'
import { db } from './firebase'
import { diaDaSemana, formatarDiaMes } from './utils/semana'
import { chaveDia } from './utils/datas'
import { GradeSemana } from './components/GradeSemana'
import { Catalogo } from './components/Catalogo'
import { CardapioRefeicao } from './components/CardapioRefeicao'
import { ModalRefeicao } from './components/ModalRefeicao'
import type { Planejamento, Refeicao } from './data/planejamento'
import type { RefeicaoId, TipoRefeicao } from './data/refeicoes'

type Edicao = {
  data: Date
  refeicao: TipoRefeicao
  editar: boolean
}

function App() {
  const [tela, setTela] = useState<'semana' | 'catalogo'>('semana')
  const [dataBase, setDataBase] = useState(new Date())
  const [planejamento, setPlanejamento] = useState<Planejamento>({})
  const [editando, setEditando] = useState<Edicao | null>(null)
  const dias = diaDaSemana(dataBase)

  function mudarSemana(quantidade: number) {
    const nova = new Date(dataBase)
    nova.setDate(nova.getDate() + quantidade * 7)
    setDataBase(nova)
  }

  function guardarRefeicao(data: Date, id: RefeicaoId, refeicao: Refeicao | null) {
    const dia = chaveDia(data)

    const endereco = ref(db, `dias/${dia}/${id}`)
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

    setPlanejamento((atual) => {
      const doDia = { ...atual[dia] }
      if (refeicao) {
        doDia[id] = refeicao
      } else {
        delete doDia[id]
      }
      return { ...atual, [dia]: doDia }
    })
    setEditando(null)
  }

  const refeicaoAberta = editando
    ? planejamento[chaveDia(editando.data)]?.[editando.refeicao.id]
    : undefined

  const inicio = formatarDiaMes(dias[0])
  const fim = formatarDiaMes(dias[6])
  const ano = dias[6].getFullYear()

  const abaAtiva = 'rounded-xl bg-leaf-600 px-3 py-1 font-semibold text-white'
  const abaInativa = 'rounded-xl bg-white/60 px-3 py-1 font-semibold text-leaf-800'

  return (
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
            onClick={() => setTela('catalogo')}
            className={tela === 'catalogo' ? abaAtiva : abaInativa}
          >
            Catálogo
          </button>
        </div>

        {tela === 'semana' && (
          <div className='flex items-center gap-2 text-leaf-800'>
            <button
              onClick={() => mudarSemana(-1)}
              className='rounded-xl bg-white/60 px-3 py-1 font-bold'
            >
              ‹
            </button>
            <span className='min-w-48 text-center font-semibold'>
              {inicio} a {fim}/{ano}
            </span>
            <button
              onClick={() => mudarSemana(1)}
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

      {tela === 'semana' ? (
        <GradeSemana
          dias={dias}
          planejamento={planejamento}
          onAbrir={(data, refeicao) => {
            const existe = Boolean(planejamento[chaveDia(data)]?.[refeicao.id])
            setEditando({ data, refeicao, editar: !existe })
          }}
        />
      ) : (
        <Catalogo />
      )}

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
          refeicao={editando.refeicao}
          inicial={refeicaoAberta}
          onSalvar={(refeicao) =>
            guardarRefeicao(editando.data, editando.refeicao.id, refeicao)
          }
          onApagar={() => guardarRefeicao(editando.data, editando.refeicao.id, null)}
          onFechar={() => setEditando(null)}
        />
      )}
    </div>
  )
}

export default App