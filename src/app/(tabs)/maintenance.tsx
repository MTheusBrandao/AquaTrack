import { router } from 'expo-router';
import { CalendarCheck, Fish, Plus } from 'lucide-react-native';

import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/ui';
import { useAquariums } from '@/features/aquariums/hooks/useAquariums';
import { MaintenanceLogRow } from '@/features/maintenance/components/MaintenanceLogRow';
import { MaintenanceTaskRow } from '@/features/maintenance/components/MaintenanceTaskRow';
import { useMaintenanceOverview } from '@/features/maintenance/hooks/useMaintenance';
import { getMaintenanceStatus } from '@/features/maintenance/utils/recurrence';
import { colors, sizes } from '@/theme';

export default function MaintenanceScreen() {
  const aquariums = useAquariums();
  const overview = useMaintenanceOverview();
  const firstAquariumId = aquariums.data?.[0]?.id;

  function openCreate() {
    if (firstAquariumId) {
      router.push({ pathname: '/maintenance/create/[id]', params: { id: firstAquariumId } });
    }
  }

  function renderContent() {
    if ((aquariums.loading && !aquariums.data) || (overview.loading && !overview.data)) {
      return <LoadingState />;
    }
    if (aquariums.error || overview.error) {
      return (
        <ErrorState
          onRetry={() => {
            aquariums.reload();
            overview.reload();
          }}
        />
      );
    }
    if (!aquariums.data?.length) {
      return (
        <EmptyState
          icon={Fish}
          title="Cadastre um aquário primeiro"
          description="Cada tarefa de manutenção pertence a um aquário."
          action={<Button label="Cadastrar aquário" onPress={() => router.push('/aquarium/create')} />}
        />
      );
    }

    const open = overview.data?.open ?? [];
    const logs = overview.data?.recentLogs ?? [];
    const now = new Date();
    const overdue = open.filter((task) => getMaintenanceStatus(task, now) === 'overdue');
    const upcoming = open.filter((task) => getMaintenanceStatus(task, now) === 'pending');

    return (
      <>
        {open.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="Nenhuma tarefa agendada"
            description="Programe trocas de água, limpeza de filtros e testes de parâmetros com lembretes recorrentes."
            action={<Button label="Nova tarefa" onPress={openCreate} />}
          />
        ) : null}

        {overdue.length ? (
          <>
            <AppText variant="subtitle" color="critical">
              Atrasadas ({overdue.length})
            </AppText>
            <Card>
              {overdue.map((task) => (
                <MaintenanceTaskRow key={task.id} task={task} onCompleted={overview.reload} />
              ))}
            </Card>
          </>
        ) : null}

        {upcoming.length ? (
          <>
            <AppText variant="subtitle">Próximas</AppText>
            <Card>
              {upcoming.map((task) => (
                <MaintenanceTaskRow key={task.id} task={task} onCompleted={overview.reload} />
              ))}
            </Card>
          </>
        ) : null}

        {logs.length ? (
          <>
            <AppText variant="subtitle">Concluídas recentemente</AppText>
            <Card>
              {logs.map((log) => (
                <MaintenanceLogRow key={log.id} log={log} />
              ))}
            </Card>
          </>
        ) : null}
      </>
    );
  }

  return (
    <Screen
      title="Manutenção"
      subtitle="Tarefas e lembretes dos seus aquários"
      headerAction={
        firstAquariumId && overview.data?.open.length ? (
          <Button
            label="Nova"
            size="small"
            icon={<Plus size={sizes.iconSm} color={colors.onPrimary} />}
            onPress={openCreate}
          />
        ) : null
      }>
      {renderContent()}
    </Screen>
  );
}
