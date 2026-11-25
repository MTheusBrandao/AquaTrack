export const MAINTENANCE_CATEGORIES = [
  'water_change',
  'filter_cleaning',
  'parameter_test',
  'plant_trimming',
  'tank_cleaning',
  'nutrient_dosing',
  'feeding',
  'other',
] as const;

export type MaintenanceCategory = (typeof MAINTENANCE_CATEGORIES)[number];

export const MAINTENANCE_CATEGORY_LABELS: Record<MaintenanceCategory, string> = {
  water_change: 'Troca parcial de água',
  filter_cleaning: 'Limpeza de filtros',
  parameter_test: 'Teste de parâmetros',
  plant_trimming: 'Poda de plantas',
  tank_cleaning: 'Limpeza do aquário',
  nutrient_dosing: 'Reposição de nutrientes',
  feeding: 'Alimentação',
  other: 'Outra',
};

export const FREQUENCIES = ['once', 'daily', 'weekly', 'biweekly', 'monthly'] as const;

export type Frequency = (typeof FREQUENCIES)[number];

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  once: 'Uma vez',
  daily: 'Diária',
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  monthly: 'Mensal',
};

/** Derivado de scheduledAt/completedAt no momento da leitura; nunca gravado no banco. */
export type MaintenanceStatus = 'pending' | 'overdue' | 'completed';

export type MaintenanceTask = {
  id: string;
  aquariumId: string;
  aquariumName: string;
  title: string;
  category: MaintenanceCategory;
  description: string | null;
  frequency: Frequency;
  /** Primeira ocorrência; base para calcular as seguintes. Redefinida ao editar a data. */
  startsAt: string;
  /** Próxima execução prevista (instante ISO 8601). Avança a cada conclusão de tarefa recorrente. */
  scheduledAt: string;
  /** Preenchido apenas quando uma tarefa única é concluída. */
  completedAt: string | null;
  reminderEnabled: boolean;
  notificationId: string | null;
};

export type MaintenanceInput = {
  aquariumId: string;
  title: string;
  category: MaintenanceCategory;
  description: string | null;
  frequency: Frequency;
  scheduledAt: string;
  reminderEnabled: boolean;
};

export type MaintenanceLog = {
  id: string;
  taskId: string | null;
  aquariumId: string;
  aquariumName: string;
  /** Título copiado no momento da conclusão, para o histórico sobreviver à exclusão da tarefa. */
  title: string;
  category: MaintenanceCategory;
  scheduledFor: string;
  completedAt: string;
};
