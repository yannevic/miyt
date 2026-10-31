import { chaveDia } from './datas'
import { refeicoes } from '../data/refeicoes'
import type { Planejamento, Refeicao, ItemEscolhido } from '../data/planejamento'
import type { ItemCatalogo } from '../data/catalogo'

export type QuemExportar = 'ambos' | 'nana' | 'miguel'
export type PeriodoExportar = 'semana' | 'mes'

type Opcoes = {
  periodo: PeriodoExportar
  quem: QuemExportar
  base: Date
  planejamento: Planejamento
  catalogo: ItemCatalogo[]
  incluirRegistro: boolean
}

const abrev = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function dd(n: number): string {
  return String(n).padStart(2, '0')
}

function dataCurta(d: Date): string {
  return dd(d.getDate()) + '/' + dd(d.getMonth() + 1)
}

function dataCompleta(d: Date): string {
  return dataCurta(d) + '/' + d.getFullYear()
}

function textoItens(lista: ItemEscolhido[], catalogo: ItemCatalogo[]): string {
  const partes: string[] = []
  for (const escolhido of lista) {
    const achado = catalogo.find((c) => c.id === escolhido.item)
    if (!achado) continue
    if (achado.pedeNome) {
      partes.push(escolhido.detalhe ?? achado.nome)
    } else if (escolhido.detalhe) {
      partes.push(achado.nome + ' (' + escolhido.detalhe + ')')
    } else {
      partes.push(achado.nome)
    }
  }
  return partes.join(', ')
}

function celula(
  ref: Refeicao | undefined,
  quem: QuemExportar,
  catalogo: ItemCatalogo[],
  incluirRegistro: boolean,
): string {
  if (!ref) return '—'

  let texto = ''
  if (ref.modo === 'juntos') {
    texto = textoItens(ref.juntos, catalogo)
  } else if (quem === 'ambos') {
    const n = textoItens(ref.nana, catalogo)
    const m = textoItens(ref.miguel, catalogo)
    const lados: string[] = []
    if (n) lados.push('Nana: ' + n)
    if (m) lados.push('Miguel: ' + m)
    texto = lados.join(' / ')
  } else {
    texto = textoItens(quem === 'nana' ? ref.nana : ref.miguel, catalogo)
  }

  if (!texto) return '—'
  if (ref.obs) texto += ' [obs: ' + ref.obs + ']'

  if (incluirRegistro && ref.registro) {
    if (ref.registro.status === 'planejado') {
      texto += ' {comemos como planejado}'
    } else {
      texto += ' {foi diferente: ' + (ref.registro.real ?? 'sem detalhe') + '}'
    }
  }

  // barra vertical e quebra de linha quebram a tabela
  return texto.replace(/\|/g, '/').replace(/\n/g, ' ')
}

function tabelaDaSemana(
  domingo: Date,
  mesFiltro: number | null,
  op: Opcoes,
): string {
  const dias: Date[] = []
  for (let i = 0; i < 7; i++) {
    dias.push(new Date(domingo.getFullYear(), domingo.getMonth(), domingo.getDate() + i))
  }

  const cabecalho = dias.map((d) => abrev[d.getDay()] + ' ' + dataCurta(d))
  const linhas: string[] = []
  linhas.push('| Refeição | ' + cabecalho.join(' | ') + ' |')
  linhas.push('|' + ' --- |'.repeat(8))

  for (const r of refeicoes) {
    const colunas = dias.map((d) => {
      if (mesFiltro !== null && d.getMonth() !== mesFiltro) return '·'
      const dia = op.planejamento[chaveDia(d)]
      return celula(dia?.[r.id], op.quem, op.catalogo, op.incluirRegistro)
    })
    linhas.push('| ' + r.nome + ' | ' + colunas.join(' | ') + ' |')
  }
  return linhas.join('\n')
}

export function gerarTexto(op: Opcoes): string {
  const quemTexto =
    op.quem === 'ambos' ? 'Nana e Miguel' : op.quem === 'nana' ? 'Nana' : 'Miguel'
  const b = op.base
  const saida: string[] = []

  if (op.periodo === 'semana') {
    const domingo = new Date(b.getFullYear(), b.getMonth(), b.getDate() - b.getDay())
    const sabado = new Date(domingo.getFullYear(), domingo.getMonth(), domingo.getDate() + 6)
    saida.push('# Cardápio da semana: ' + dataCompleta(domingo) + ' a ' + dataCompleta(sabado))
    saida.push('Pessoa(s): ' + quemTexto)
    saida.push('')
    saida.push(tabelaDaSemana(domingo, null, op))
  } else {
    const nomesMeses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
    ]
    const primeiro = new Date(b.getFullYear(), b.getMonth(), 1)
    const ultimo = new Date(b.getFullYear(), b.getMonth() + 1, 0)
    saida.push('# Cardápio de ' + nomesMeses[b.getMonth()] + ' de ' + b.getFullYear())
    saida.push('Pessoa(s): ' + quemTexto)

    let domingo = new Date(primeiro.getFullYear(), primeiro.getMonth(), 1 - primeiro.getDay())
    while (domingo <= ultimo) {
      const sabado = new Date(domingo.getFullYear(), domingo.getMonth(), domingo.getDate() + 6)
      saida.push('')
      saida.push('## Semana de ' + dataCurta(domingo) + ' a ' + dataCurta(sabado))
      saida.push('')
      saida.push(tabelaDaSemana(domingo, b.getMonth(), op))
      domingo = new Date(domingo.getFullYear(), domingo.getMonth(), domingo.getDate() + 7)
    }
  }

  saida.push('')
  saida.push('Legenda: — = nada planejado · [obs: ...] = observação')
  if (op.incluirRegistro) {
    saida.push('{comemos como planejado} / {foi diferente: ...} = registro do que aconteceu de verdade')
  }
  return saida.join('\n')
}