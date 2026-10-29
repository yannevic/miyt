export const nomesMeses = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

// Devolve todos os dias da grade do mês, de domingo a sábado.
// Inclui os últimos dias do mês anterior e os primeiros do próximo,
// pra completar as semanas.
export function diasDoMes(base: Date): Date[] {
  const primeiro = new Date(base.getFullYear(), base.getMonth(), 1)
  const ultimo = new Date(base.getFullYear(), base.getMonth() + 1, 0)

  const inicio = new Date(primeiro)
  inicio.setDate(1 - primeiro.getDay())

  const fim = new Date(ultimo)
  fim.setDate(ultimo.getDate() + (6 - ultimo.getDay()))

  const dias: Date[] = []
  const atual = new Date(inicio)
  while (atual <= fim) {
    dias.push(new Date(atual))
    atual.setDate(atual.getDate() + 1)
  }
  return dias
}