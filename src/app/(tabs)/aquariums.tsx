import { router } from 'expo-router';
import { Fish, Plus } from 'lucide-react-native';

import { Button, EmptyState, ErrorState, LoadingState, Screen } from '@/components/ui';
import { AquariumCard } from '@/features/aquariums/components/AquariumCard';
import { useAquariums } from '@/features/aquariums/hooks/useAquariums';
import { colors, sizes } from '@/theme';

function openCreate() {
  router.push('/aquarium/create');
}

export default function AquariumsScreen() {
  const { data: aquariums, loading, error, reload } = useAquariums();
  const hasAquariums = Boolean(aquariums?.length);

  return (
    <Screen
      title="Aquários"
      subtitle="Seus aquários de água doce, salgada e salobra"
      headerAction={
        hasAquariums ? (
          <Button
            label="Novo"
            size="small"
            icon={<Plus size={sizes.iconSm} color={colors.onPrimary} />}
            onPress={openCreate}
          />
        ) : null
      }>
      {loading && !aquariums ? <LoadingState /> : null}
      {error ? <ErrorState onRetry={reload} /> : null}
      {aquariums && !hasAquariums ? (
        <EmptyState
          icon={Fish}
          title="Nenhum aquário cadastrado"
          description="Adicione um aquário com volume, dimensões e tipo de água para começar."
          action={<Button label="Cadastrar aquário" onPress={openCreate} />}
        />
      ) : null}
      {aquariums?.map((aquarium) => <AquariumCard key={aquarium.id} aquarium={aquarium} />)}
    </Screen>
  );
}
