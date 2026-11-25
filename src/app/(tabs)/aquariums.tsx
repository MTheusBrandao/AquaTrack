import { Fish } from 'lucide-react-native';

import { EmptyState, Screen } from '@/components/ui';

export default function AquariumsScreen() {
  return (
    <Screen title="Aquários" subtitle="Seus aquários de água doce, salgada e salobra">
      <EmptyState
        icon={Fish}
        title="Nenhum aquário cadastrado"
        description="Adicione um aquário com volume, dimensões e tipo de água para começar."
      />
    </Screen>
  );
}
