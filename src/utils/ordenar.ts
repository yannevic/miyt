import type { ItemCatalogo } from '../data/catalogo'
import type { ItemEscolhido } from '../data/planejamento'

export function ordenarEscolhidos(
  lista: ItemEscolhido[],
  catalogo: ItemCatalogo[],
): ItemEscolhido[] {
  // Item que não está no catálogo vai pro fim da lista
  const posicao = (id: string) => {
    const i = catalogo.findIndex((item) => item.id === id)
    return i === -1 ? catalogo.length : i
  }
  return [...lista].sort((a, b) => posicao(a.item) - posicao(b.item))
}