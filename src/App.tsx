import { useState } from 'react'
import { diaDaSemana, formatarDiaMes } from './utils/semana'
import { GradeSemana } from './components/GradeSemana'
import { Catalogo } from './components/Catalogo'

function App() {
  const [tela, setTela] = useState<'semana' | 'catalogo'>('semana')
  const [dataBase, setDataBase] = useState(new Date())
  const dias = diaDaSemana(dataBase)

  function mudarSemana(quantidade: number) {
    const nova = new Date(dataBase)
    nova.setDate(nova.getDate() + quantidade * 7)
    setDataBase(nova)
  }

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

      {tela === 'semana' ? <GradeSemana dias={dias} /> : <Catalogo />}
    </div>
  )
}

export default App