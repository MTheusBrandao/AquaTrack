import { useState } from 'react';

import { AppText, Screen } from '@/components/ui';
import { AquariumSelector } from '@/features/aquariums/components/AquariumSelector';
import { useAquariums } from '@/features/aquariums/hooks/useAquariums';
import { useNumberInput } from '@/features/calculators/components/CalculatorParts';
import {
  ConversionCalculator,
  DoseCalculator,
  VolumeCalculator,
  WaterChangeCalculator,
} from '@/features/calculators/components/Calculators';

export default function ToolsScreen() {
  const aquariums = useAquariums();
  const volume = useNumberInput();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const list = aquariums.data ?? [];

  function selectAquarium(id: string) {
    setSelectedId(id);
    const aquarium = list.find((item) => item.id === id);
    if (aquarium) volume.setText(String(aquarium.volume).replace('.', ','));
  }

  return (
    <Screen>
      {list.length ? (
        <>
          <AppText color="textSecondary">Usar o volume de um aquário:</AppText>
          <AquariumSelector
            aquariums={list}
            selectedId={selectedId}
            onSelect={selectAquarium}
            showSingle
          />
        </>
      ) : null}
      <WaterChangeCalculator volume={volume} />
      <ConversionCalculator />
      <DoseCalculator volume={volume} />
      <VolumeCalculator volume={volume} />
    </Screen>
  );
}
