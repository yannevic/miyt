import type { Modo, RefeicaoId } from './refeicoes'

export type Pessoa = 'juntos' | 'nana' | 'miguel'

export type ItemEscolhido = {
  item: string
  detalhe?: string
}

export type StatusRegistro = 'planejado' | 'diferente'

// Como a refeição realmente foi: 'planejado' = comemos como planejado;
// 'diferente' = foi outra coisa (e 'real' pode dizer o que foi)
export type Registro = {
  status: StatusRegistro
  real?: string
}

export type Refeicao = {
  modo: Modo
  juntos: ItemEscolhido[]
  nana: ItemEscolhido[]
  miguel: ItemEscolhido[]
  obs: string
  registro?: Registro
}

export type Planejamento = Record<string, Partial<Record<RefeicaoId, Refeicao>>>

// Modelo de refeição (favorita): o que é gravado no Firebase em modelos/{id}
export type ModeloDados = {
  nome: string
  modo: Modo
  juntos: ItemEscolhido[]
  nana: ItemEscolhido[]
  miguel: ItemEscolhido[]
  obs: string
}

// O modelo como o app usa: os mesmos dados + o id que o Firebase criou
export type Modelo = ModeloDados & { id: string }