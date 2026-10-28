import { Moon, Sun, Sunrise, Sunset } from 'lucide-react'
import type { IconeComponente } from './icones'
import type { RefeicaoId } from './refeicoes'

export const iconesRefeicao: Record<RefeicaoId, IconeComponente> = {
  cafe: Sunrise,
  almoco: Sun,
  lanche: Sunset,
  jantar: Moon,
}