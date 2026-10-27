import { diaDaSemana } from './utils/semana'
import { GradeSemana } from './components/GradeSemana'

function App() {
  const dias = diaDaSemana(new Date())

  return (
    <div className='bg-bark-100 min-h-screen'>
      <h1 className='text-leaf-800 text-4xl font-bold'>Miyt</h1>
      <GradeSemana dias={dias} />
    </div>
  )
}

export default App