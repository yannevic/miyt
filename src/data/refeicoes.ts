export type RefeicaoId = 'cafe' | 'almoco' | 'lanche' | 'jantar'

export type Modo = 'juntos' | 'separado'

export type TipoRefeicao = {
  id: RefeicaoId
  nome: string
  modoPadrao: Modo
}

export const refeicoes: TipoRefeicao[] = [
  { id: 'cafe', nome: 'Café', modoPadrao: 'juntos' },
  { id: 'almoco', nome: 'Almoço', modoPadrao: 'separado' },
  { id: 'lanche', nome: 'Lanche', modoPadrao: 'juntos' },
  { id: 'jantar', nome: 'Jantar', modoPadrao: 'juntos' },
]