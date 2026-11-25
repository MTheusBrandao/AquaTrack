import { router } from 'expo-router';
import { Fish } from 'lucide-react-native';

import { AppText, Button, EmptyState, ErrorState, LoadingState, Screen } from '@/components/ui';
import { AquariumCard } from '@/features/aquariums/components/AquariumCard';
import { useAquariums } from '@/features/aquariums/hooks/useAquariums';

/** Resumo provisório: o dashboard completo (medições, manutenções, atalhos) é a Fase 4. */
export default function DashboardScreen() {
  const { data: aquariums, loading, error, reload } = useAquariums();

  return (
    <Screen title="AquaTrack" subtitle="Visão geral dos seus aquários">
      {loading && !aquariums ? <LoadingState /> : null}
      {error ? <ErrorState onRetry={reload} /> : null}
      {aquariums?.length === 0 ? (
        <EmptyState
          icon={Fish}
          title="Nenhum aquário ainda"
          description="Cadastre seu primeiro aquário para acompanhar a qualidade da água, os organismos e as manutenções."
          action={<Button label="Cadastrar aquário" onPress={() => router.push('/aquarium/create')} />}
        />
      ) : null}
      {aquariums?.length ? (
        <>
          <AppText variant="subtitle">
            {aquariums.length === 1 ? '1 aquário' : `${aquariums.length} aquários`}
          </AppText>
          {aquariums.map((aquarium) => (
            <AquariumCard key={aquarium.id} aquarium={aquarium} />
          ))}
        </>
      ) : null}
    </Screen>
  );
}
