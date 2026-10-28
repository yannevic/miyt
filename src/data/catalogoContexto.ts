import { createContext, useContext } from 'react'
import type { CategoriaId, ItemCatalogo } from './catalogo'

export type CatalogoValor = {
  itens: ItemCatalogo[]
  achar: (id: string) => ItemCatalogo | undefined
  cadastrar: (nome: string, categoria: CategoriaId, icone: string) => void
}

export const CatalogoContexto = createContext<CatalogoValor | null>(null)

export function useCatalogo(): CatalogoValor {
  const valor = useContext(CatalogoContexto)
  if (!valor) {
    throw new Error('useCatalogo precisa estar dentro do CatalogoContexto.Provider')
  }
  return valor
}