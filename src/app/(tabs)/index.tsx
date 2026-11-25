import { Fish } from 'lucide-react-native';

import { EmptyState, Screen } from '@/components/ui';

export default function DashboardScreen() {
  return (
    <Screen title="AquaTrack" subtitle="Visão geral dos seus aquários">
      <EmptyState
        icon={Fish}
        title="Nenhum aquário ainda"
        description="Cadastre seu primeiro aquário para acompanhar a qualidade da água, os organismos e as manutenções."
      />
    </Screen>
  );
}
