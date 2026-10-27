export type CategoriaId =
  | 'base'
  | 'proteina'
  | 'salada-legumes'
  | 'fruta'
  | 'bebida'
  | 'outros'

export type Categoria = {
  id: CategoriaId
  nome: string
  cor: string
}

export type ItemCatalogo = {
  id: string
  nome: string
  categoria: CategoriaId
  icone: string
  pedeNome?: boolean
}

export const categorias: Categoria[] = [
  { id: 'base', nome: 'Base', cor: '#E9D8A6' },
  { id: 'proteina', nome: 'Proteína', cor: '#D9936B' },
  { id: 'salada-legumes', nome: 'Salada e legumes', cor: '#7FB87F' },
  { id: 'fruta', nome: 'Fruta', cor: '#F2C94C' },
  { id: 'bebida', nome: 'Bebida', cor: '#8EC5E8' },
  { id: 'outros', nome: 'Outros', cor: '#CFC6B8' },
]

export const catalogoInicial: ItemCatalogo[] = [
  { id: 'arroz', nome: 'Arroz', categoria: 'base', icone: 'Wheat' },
  { id: 'feijao', nome: 'Feijão', categoria: 'base', icone: 'Bean' },
  { id: 'macarrao', nome: 'Macarrão', categoria: 'base', icone: 'Utensils' },
  { id: 'pao', nome: 'Pão', categoria: 'base', icone: 'Croissant' },
  { id: 'tapioca', nome: 'Tapioca', categoria: 'base', icone: 'Circle' },
  { id: 'batata', nome: 'Batata', categoria: 'base', icone: 'GiPotato' },
  { id: 'farofa', nome: 'Farofa', categoria: 'base', icone: 'GiBowlOfRice' },
  { id: 'outro-base', nome: 'Outro', categoria: 'base', icone: 'ChefHat', pedeNome: true },

  { id: 'ovo', nome: 'Ovo', categoria: 'proteina', icone: 'Egg' },
  { id: 'frango', nome: 'Frango', categoria: 'proteina', icone: 'Drumstick' },
  { id: 'carne', nome: 'Carne', categoria: 'proteina', icone: 'Beef' },
  { id: 'porco', nome: 'Porco', categoria: 'proteina', icone: 'TbPig' },
  { id: 'bacon', nome: 'Bacon', categoria: 'proteina', icone: 'Bacon' },
  { id: 'peixe', nome: 'Peixe', categoria: 'proteina', icone: 'Fish' },
  { id: 'outro-proteina', nome: 'Outro', categoria: 'proteina', icone: 'ChefHat', pedeNome: true },

  { id: 'alface', nome: 'Alface', categoria: 'salada-legumes', icone: 'Salad' },
  { id: 'tomate', nome: 'Tomate', categoria: 'salada-legumes', icone: 'GiTomato' },
  { id: 'cenoura', nome: 'Cenoura', categoria: 'salada-legumes', icone: 'Carrot' },
  { id: 'brocolis', nome: 'Brócolis', categoria: 'salada-legumes', icone: 'Leaf' },
  { id: 'outro-salada', nome: 'Outro', categoria: 'salada-legumes', icone: 'ChefHat', pedeNome: true },

  { id: 'banana', nome: 'Banana', categoria: 'fruta', icone: 'Banana' },
  { id: 'maca', nome: 'Maçã', categoria: 'fruta', icone: 'Apple' },
  { id: 'laranja', nome: 'Laranja', categoria: 'fruta', icone: 'Citrus' },
  { id: 'uva', nome: 'Uva', categoria: 'fruta', icone: 'Grape' },
  { id: 'outro-fruta', nome: 'Outro', categoria: 'fruta', icone: 'ChefHat', pedeNome: true },

  { id: 'cafe', nome: 'Café', categoria: 'bebida', icone: 'Coffee' },
  { id: 'leite', nome: 'Leite', categoria: 'bebida', icone: 'Milk' },
  { id: 'suco', nome: 'Suco', categoria: 'bebida', icone: 'CupSoda' },
  { id: 'achocolatado', nome: 'Achocolatado', categoria: 'bebida', icone: 'GlassWater' },
  { id: 'outro-bebida', nome: 'Outro', categoria: 'bebida', icone: 'ChefHat', pedeNome: true },

  { id: 'bolacha', nome: 'Bolacha', categoria: 'outros', icone: 'Cookie' },
  { id: 'bolo-torta', nome: 'Bolo/Torta', categoria: 'outros', icone: 'CakeSlice' },
  { id: 'chocolate', nome: 'Chocolate', categoria: 'outros', icone: 'TbChocolate' },
  { id: 'sanduiche', nome: 'Sanduíche', categoria: 'outros', icone: 'Sandwich' },
  { id: 'pizza', nome: 'Pizza', categoria: 'outros', icone: 'Pizza' },
  { id: 'rappi10', nome: 'Rappi10', categoria: 'outros', icone: 'GiTacos' },
  { id: 'outro', nome: 'Outro', categoria: 'outros', icone: 'ChefHat', pedeNome: true },
]