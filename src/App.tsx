import { useState } from 'react'
import { diaDaSemana, formatarDiaMes } from './utils/semana'
import { GradeSemana } from './components/GradeSemana'

function App() {
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

  return (
    <div className='bg-bark-100 min-h-screen'>
      <div className='flex items-center justify-between p-4'>
        <h1 className='text-leaf-800 text-4xl font-bold'>Miyt</h1>

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
      </div>

      <GradeSemana dias={dias} />
    </div>
  )
}

export default App