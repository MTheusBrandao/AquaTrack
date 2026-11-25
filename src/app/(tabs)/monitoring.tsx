import { Activity } from 'lucide-react-native';

import { EmptyState, Screen } from '@/components/ui';

export default function MonitoringScreen() {
  return (
    <Screen title="Monitoramento" subtitle="Parâmetros da água ao longo do tempo">
      <EmptyState
        icon={Activity}
        title="Nenhuma medição registrada"
        description="Registre temperatura, pH, amônia, nitrito, nitrato, GH e KH para acompanhar a evolução do aquário."
      />
    </Screen>
  );
}
