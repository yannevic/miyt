import { formatarDiaMes } from '../utils/semana'

type GradeSemanaProps = {
  dias: Date[]
}

export function GradeSemana({ dias }: GradeSemanaProps) {
  return (
    <div className='grid grid-cols-7 gap-2'>
      {dias.map((data) => (
        <div
          key={data.toISOString()}
          className='rounded-xl bg-white/60 p-3 text-center text-leaf-800'
        >
          {formatarDiaMes(data)}
        </div>
      ))}
    </div>
  )
}