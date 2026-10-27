export function diaDaSemana(data: Date): Date[]{

const n = data.getDay()
const domingo = new Date(data.getFullYear(), data.getMonth(), data.getDate() - n)

const semana: Date[] = []
for (let i = 0; i < 7; i++){
    semana.push( new Date (domingo.getFullYear(), domingo.getMonth(), domingo.getDate() + i))
}

return semana
}

export function formatarDiaMes(data: Date): string{

    const dia = data.getDate()
    const mes = data.getMonth() + 1

const diaTexto = String(dia).padStart(2, '0')
const mesTexto = String(mes).padStart(2, '0')

return diaTexto + '/' + mesTexto
}
