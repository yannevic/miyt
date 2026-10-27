import { diaDaSemana, formatarDiaMes } from './utils/semana'
import { GradeSemana } from './components/GradeSemana'

function App() {
  const dias = diaDaSemana(new Date())

  return (
    <div className='bg-bark-100 min-h-screen'>
      <h1 className='text-leaf-800 text-4xl font-bold'>Miyt</h1>
      {dias.map((data) => (
        <p key={data.toISOString()}>{formatarDiaMes(data)}</p>
      ))}
      <GradeSemana />
    </div>
  )
}

export default App