import { AppText, Button } from '@/components/ui';

import {
  celsiusToFahrenheit,
  degreesToPpm,
  dkhToMeq,
  doseMilliliters,
  ppmToDegrees,
  salinityToSpecificGravity,
  specificGravityToSalinity,
  tankVolumeLiters,
  waterChangeLiters,
  waterChangePercentForTarget,
} from '../utils/calculators';
import {
  CalculatorCard,
  Cell,
  fmt,
  NumberField,
  Result,
  Row,
  useNumberInput,
} from './CalculatorParts';

type VolumeProps = { volume: ReturnType<typeof useNumberInput> };

export function VolumeCalculator({ volume }: VolumeProps) {
  const length = useNumberInput();
  const width = useNumberInput();
  const height = useNumberInput();
  const result =
    length.value && width.value && height.value
      ? tankVolumeLiters(length.value, width.value, height.value)
      : null;

  return (
    <CalculatorCard
      title="Volume do aquário"
      description="Volume bruto pelas medidas internas. Substrato e decoração reduzem o volume real.">
      <Row>
        <Cell>
          <NumberField label="Compr." suffix="cm" input={length} />
        </Cell>
        <Cell>
          <NumberField label="Largura" suffix="cm" input={width} />
        </Cell>
        <Cell>
          <NumberField label="Altura" suffix="cm" input={height} />
        </Cell>
      </Row>
      <Result label="Volume bruto" value={fmt(result, 1, 'L')} />
      {result ? (
        <Button
          label="Usar nos cálculos abaixo"
          variant="secondary"
          size="small"
          onPress={() => volume.setText(String(Math.round(result * 10) / 10).replace('.', ','))}
        />
      ) : null}
    </CalculatorCard>
  );
}

export function WaterChangeCalculator({ volume }: VolumeProps) {
  const percent = useNumberInput('30');
  const current = useNumberInput();
  const target = useNumberInput();
  const replacement = useNumberInput('0');

  const liters = volume.value && percent.value !== null ? waterChangeLiters(volume.value, percent.value) : null;
  const neededPercent =
    current.value !== null && target.value !== null && replacement.value !== null
      ? waterChangePercentForTarget(current.value, target.value, replacement.value)
      : null;
  const unreachable =
    current.value !== null && target.value !== null && replacement.value !== null && neededPercent === null;

  return (
    <CalculatorCard title="Troca parcial de água (TPA)">
      <NumberField label="Volume do aquário" suffix="L" input={volume} />
      <NumberField label="Porcentagem da troca" suffix="%" input={percent} />
      <Result label="Água a trocar" value={fmt(liters, 1, 'L')} />

      <AppText variant="label">Quanto trocar para baixar um parâmetro</AppText>
      <AppText variant="caption" color="textSecondary">
        Ex.: nitrato. Considera uma única troca e mistura completa.
      </AppText>
      <Row>
        <Cell>
          <NumberField label="Atual" suffix="mg/L" input={current} />
        </Cell>
        <Cell>
          <NumberField label="Alvo" suffix="mg/L" input={target} />
        </Cell>
      </Row>
      <NumberField label="Na água nova" suffix="mg/L" input={replacement} />
      <Result
        label="Troca necessária"
        value={
          unreachable
            ? 'Inalcançável numa troca'
            : neededPercent !== null && volume.value
              ? `${fmt(neededPercent, 0, '%')} (${fmt(waterChangeLiters(volume.value, neededPercent), 1, 'L')})`
              : fmt(neededPercent, 0, '%')
        }
      />
    </CalculatorCard>
  );
}

export function ConversionCalculator() {
  const hardness = useNumberInput();
  const ppm = useNumberInput();
  const kh = useNumberInput();
  const celsius = useNumberInput();
  const salinity = useNumberInput();
  const gravity = useNumberInput();

  return (
    <CalculatorCard title="Conversões">
      <Row>
        <Cell>
          <NumberField label="GH/KH" suffix="°dH" input={hardness} />
          <Result label="em ppm (CaCO₃)" value={fmt(hardness.value === null ? null : degreesToPpm(hardness.value), 0)} />
        </Cell>
        <Cell>
          <NumberField label="ppm (CaCO₃)" input={ppm} />
          <Result label="em °dH" value={fmt(ppm.value === null ? null : ppmToDegrees(ppm.value), 1)} />
        </Cell>
      </Row>
      <Row>
        <Cell>
          <NumberField label="KH" suffix="dKH" input={kh} />
          <Result label="em meq/L" value={fmt(kh.value === null ? null : dkhToMeq(kh.value), 2)} />
        </Cell>
        <Cell>
          <NumberField label="Temperatura" suffix="°C" input={celsius} />
          <Result label="em °F" value={fmt(celsius.value === null ? null : celsiusToFahrenheit(celsius.value), 1)} />
        </Cell>
      </Row>
      <Row>
        <Cell>
          <NumberField label="Salinidade" suffix="ppt" input={salinity} />
          <Result
            label="densidade"
            value={fmt(salinity.value === null ? null : salinityToSpecificGravity(salinity.value), 4)}
          />
        </Cell>
        <Cell>
          <NumberField label="Densidade" placeholder="1,025" input={gravity} />
          <Result
            label="salinidade (ppt)"
            value={fmt(gravity.value === null ? null : specificGravityToSalinity(gravity.value), 1)}
          />
        </Cell>
      </Row>
      <AppText variant="caption" color="textSecondary">
        Densidade aproximada para água a 25 °C.
      </AppText>
    </CalculatorCard>
  );
}

export function DoseCalculator({ volume }: VolumeProps) {
  const increase = useNumberInput();
  const stock = useNumberInput();
  const result =
    volume.value && increase.value !== null && stock.value !== null
      ? doseMilliliters(volume.value, increase.value, stock.value)
      : null;

  return (
    <CalculatorCard
      title="Dosagem por concentração"
      description="Cálculo genérico de diluição (C₁·V₁ = C₂·V₂). Siga sempre as instruções do fabricante e aumente aos poucos.">
      <NumberField label="Volume do aquário" suffix="L" input={volume} />
      <Row>
        <Cell>
          <NumberField label="Aumento desejado" suffix="mg/L" input={increase} />
        </Cell>
        <Cell>
          <NumberField label="Concentração do produto" suffix="mg/mL" input={stock} />
        </Cell>
      </Row>
      <Result label="Quantidade do produto" value={fmt(result, 1, 'mL')} />
    </CalculatorCard>
  );
}
