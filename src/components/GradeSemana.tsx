import { formatarDiaMes } from '../utils/semana'

type GradeSemanaProps = {
  dias: Date[]
}

const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const refeicoes = [
  { id: 'cafe', nome: 'Café' },
  { id: 'almoco', nome: 'Almoço' },
  { id: 'lanche', nome: 'Lanche' },
  { id: 'jantar', nome: 'Jantar' },
]

const colunas = 'grid grid-cols-[6rem_repeat(7,1fr)] gap-2'

export function GradeSemana({ dias }: GradeSemanaProps) {
  return (
    <div className='flex flex-col gap-2 p-4'>
      <div className={colunas}>
        <div></div>
        {dias.map((data, i) => (
          <div
            key={data.toISOString()}
            className='rounded-xl bg-white/60 p-2 text-center text-leaf-800'
          >
            <p className='font-bold'>{nomesDias[i]}</p>
            <p className='text-sm'>{formatarDiaMes(data)}</p>
          </div>
        ))}
      </div>

      {refeicoes.map((refeicao) => (
        <div key={refeicao.id} className={colunas}>
          <div className='flex items-center font-semibold text-leaf-800'>
            {refeicao.nome}
          </div>
          {dias.map((data) => (
            <div
              key={data.toISOString()}
              className='min-h-20 rounded-xl bg-white/60'
            ></div>
          ))}
        </div>
      ))}
    </div>
  )
}