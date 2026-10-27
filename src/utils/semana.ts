export function diaDaSemana(data: Date): Date[]{

const n = data.getDay()
const domingo = new Date(data.getFullYear(), data.getMonth(), data.getDate() - n)

const semana: Date[] = []
for (let i = 0; i < 7; i++){
    semana.push( new Date (domingo.getFullYear(), domingo.getMonth(), domingo.getDate() + i))
}

return semana

}