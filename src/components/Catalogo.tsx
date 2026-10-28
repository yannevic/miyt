import { useState } from 'react'
import { Plus } from 'lucide-react'
import { categorias, type CategoriaId } from '../data/catalogo'
import { useCatalogo } from '../data/catalogoContexto'
import { icones } from '../data/icones'

// Tira acento e deixa minúsculo, pra comparar nomes ('Maçã' = 'maca')
function simplificar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// O ChefHat fica reservado pro item 'Outro'
const nomesDosIcones = Object.keys(icones).filter((nome) => nome !== 'ChefHat')

export function Catalogo() {
  const { itens, cadastrar } = useCatalogo()
  const [formAberto, setFormAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [categoriaId, setCategoriaId] = useState<CategoriaId>('base')
  const [iconeEscolhido, setIconeEscolhido] = useState('Utensils')
  const [erro, setErro] = useState('')

  const categoriaEscolhida = categorias.find((c) => c.id === categoriaId)
  const IconePrevia = icones[iconeEscolhido]

  function fechar() {
    setFormAberto(false)
    setNome('')
    setCategoriaId('base')
    setIconeEscolhido('Utensils')
    setErro('')
  }

  function salvar() {
    const limpo = nome.trim()
    if (!limpo) {
      setErro('Escreva o nome do item.')
      return
    }
    const repetido = itens.some(
      (item) =>
        item.categoria === categoriaId && simplificar(item.nome) === simplificar(limpo),
    )
    if (repetido) {
      setErro('Já existe um item com esse nome nessa categoria.')
      return
    }
    cadastrar(limpo, categoriaId, iconeEscolhido)
    fechar()
  }

  return (
    <div className='flex flex-col gap-6 p-4'>
      <div>
        {!formAberto && (
          <button
            type='button'
            onClick={() => setFormAberto(true)}
            className='flex items-center gap-2 rounded-xl bg-leaf-600 px-4 py-1 font-semibold text-white'
          >
            <Plus size={16} />
            Novo item
          </button>
        )}

        {formAberto && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              salvar()
            }}
            className='flex max-w-2xl flex-col gap-4 rounded-2xl bg-white/60 p-4 text-leaf-800'
          >
            <h2 className='text-xl font-bold'>Novo item</h2>

            <label className='flex flex-col gap-1 text-sm font-semibold'>
              Nome
              <input
                type='text'
                value={nome}
                maxLength={20}
                onChange={(e) => {
                  setNome(e.target.value)
                  setErro('')
                }}
                placeholder='Ex.: Strogonoff'
                className='rounded-lg bg-white px-3 py-1 font-normal outline-none ring-1 ring-leaf-400 focus:ring-2'
              />
            </label>

            <div className='flex flex-col gap-1'>
              <p className='text-sm font-semibold'>Categoria</p>
              <div className='flex flex-wrap gap-2'>
                {categorias.map((categoria) => (
                  <button
                    key={categoria.id}
                    type='button'
                    onClick={() => {
                      setCategoriaId(categoria.id)
                      setErro('')
                    }}
                    className={
                      categoria.id === categoriaId
                        ? 'rounded-xl px-3 py-1 text-sm font-semibold text-leaf-950 ring-2 ring-leaf-800'
                        : 'rounded-xl px-3 py-1 text-sm font-semibold text-leaf-950 opacity-70'
                    }
                    style={{ backgroundColor: categoria.cor }}
                  >
                    {categoria.nome}
                  </button>
                ))}
              </div>
            </div>

            <div className='flex flex-col gap-1'>
              <p className='text-sm font-semibold'>Ícone</p>
              <div className='flex flex-wrap gap-2'>
                {nomesDosIcones.map((nomeIcone) => {
                  const Icone = icones[nomeIcone]
                  return (
                    <button
                      key={nomeIcone}
                      type='button'
                      onClick={() => setIconeEscolhido(nomeIcone)}
                      aria-label={nomeIcone}
                      className={
                        nomeIcone === iconeEscolhido
                          ? 'flex h-10 w-10 items-center justify-center rounded-xl text-leaf-950 ring-2 ring-leaf-800'
                          : 'flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-leaf-800'
                      }
                      style={
                        nomeIcone === iconeEscolhido
                          ? { backgroundColor: categoriaEscolhida?.cor }
                          : undefined
                      }
                    >
                      <Icone size={22} />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <p className='text-sm font-semibold'>Prévia:</p>
              <div
                className='flex w-24 flex-col items-center gap-1 rounded-xl p-3 text-leaf-950'
                style={{ backgroundColor: categoriaEscolhida?.cor }}
              >
                <IconePrevia size={28} />
                <span className='break-words text-center text-sm font-semibold'>
                  {nome.trim() || 'Nome'}
                </span>
              </div>
            </div>

            {erro && <p className='text-sm font-semibold text-petal-600'>{erro}</p>}

            <div className='flex gap-2'>
              <button
                type='button'
                onClick={fechar}
                className='rounded-xl bg-white/70 px-4 py-1 font-semibold'
              >
                Cancelar
              </button>
              <button
                type='submit'
                className='rounded-xl bg-leaf-600 px-4 py-1 font-semibold text-white'
              >
                Salvar item
              </button>
            </div>
          </form>
        )}
      </div>

      {categorias.map((categoria) => (
        <section key={categoria.id}>
          <h2 className='mb-2 text-xl font-bold text-leaf-800'>
            {categoria.nome}
          </h2>
          <div className='flex flex-wrap gap-3'>
            {itens
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
                    <span className='break-words text-center text-sm font-semibold'>
                      {item.nome}
                    </span>
                  </div>
                )
              })}
          </div>
        </section>
      ))}
    </div>
  )
}