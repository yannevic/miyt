import { catalogoInicial } from '../data/catalogo'
import type { ItemEscolhido } from '../data/planejamento'

export function ordenarEscolhidos(lista: ItemEscolhido[]): ItemEscolhido[] {
  const posicao = (id: string) => catalogoInicial.findIndex((item) => item.id === id)
  return [...lista].sort((a, b) => posicao(a.item) - posicao(b.item))
}