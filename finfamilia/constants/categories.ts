export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'moradia', name: 'Moradia', icon: '🏠', color: '#FF6B6B', type: 'expense' },
  { id: 'alimentacao', name: 'Alimentação', icon: '🍔', color: '#FF9F43', type: 'expense' },
  { id: 'transporte', name: 'Transporte', icon: '🚗', color: '#4DA6FF', type: 'expense' },
  { id: 'saude', name: 'Saúde', icon: '🏥', color: '#FF4D6A', type: 'expense' },
  { id: 'educacao', name: 'Educação', icon: '📚', color: '#A855F7', type: 'expense' },
  { id: 'filhos', name: 'Filhos', icon: '👶', color: '#FF6B9D', type: 'expense' },
  { id: 'contas_fixas', name: 'Contas fixas', icon: '💡', color: '#FFD93D', type: 'expense' },
  { id: 'lazer', name: 'Lazer', icon: '🎮', color: '#9B59B6', type: 'expense' },
  { id: 'empresa', name: 'Empresa', icon: '👔', color: '#2ECC71', type: 'expense' },
  { id: 'financeiro', name: 'Financeiro', icon: '💳', color: '#E74C3C', type: 'expense' },
  { id: 'outros_despesa', name: 'Outros', icon: '🔧', color: '#8899AA', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salario', name: 'Salário', icon: '💰', color: '#00D4AA', type: 'income' },
  { id: 'receita_pj', name: 'Receita PJ', icon: '💼', color: '#00D4AA', type: 'income' },
  { id: 'rendimentos', name: 'Rendimentos', icon: '📈', color: '#4DA6FF', type: 'income' },
  { id: 'outros_receita', name: 'Outros', icon: '🎁', color: '#8899AA', type: 'income' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
