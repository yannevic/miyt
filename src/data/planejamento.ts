import type { Modo, RefeicaoId } from './refeicoes'

export type Pessoa = 'juntos' | 'nana' | 'miguel'

export type ItemEscolhido = {
  item: string
  detalhe?: string
}

export type Refeicao = {
  modo: Modo
  juntos: ItemEscolhido[]
  nana: ItemEscolhido[]
  miguel: ItemEscolhido[]
  obs: string
}

export type Planejamento = Record<string, Partial<Record<RefeicaoId, Refeicao>>>