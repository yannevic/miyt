import { categorias, catalogoInicial } from '../data/catalogo'
import { icones } from '../data/icones'

export function Catalogo() {
  return (
    <div className='flex flex-col gap-6 p-4'>
      {categorias.map((categoria) => (
        <section key={categoria.id}>
          <h2 className='mb-2 text-xl font-bold text-leaf-800'>
            {categoria.nome}
          </h2>
          <div className='flex flex-wrap gap-3'>
            {catalogoInicial
              .filter((item) => item.categoria === categoria.id)
              .map((item) => {
                const Icone = icones[item.icone]
                return (
                  <div
                    key={item.id}
                    className='flex w-24 flex-col items-center gap-1 rounded-xl p-3 text-leaf-950'
                    style={{ backgroundColor: categoria.cor }}
                  >
                    <Icone size={28} />
                    <span className='text-sm font-semibold'>{item.nome}</span>
                  </div>
                )
              })}
          </div>
        </section>
      ))}
    </div>
  )
}