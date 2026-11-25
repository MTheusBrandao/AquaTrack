import { CalendarCheck } from 'lucide-react-native';

import { EmptyState, Screen } from '@/components/ui';

export default function MaintenanceScreen() {
  return (
    <Screen title="Manutenção" subtitle="Tarefas e lembretes dos seus aquários">
      <EmptyState
        icon={CalendarCheck}
        title="Nenhuma tarefa agendada"
        description="Programe trocas de água, limpeza de filtros e testes de parâmetros com lembretes recorrentes."
      />
    </Screen>
  );
}
