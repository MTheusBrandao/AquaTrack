import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { colors, sizes, spacing, typography } from '@/theme';

export type ChartPoint = {
  /** Timestamp em ms. */
  x: number;
  y: number;
  highlighted: boolean;
};

type LineChartProps = {
  points: ChartPoint[];
  /** Faixa de referência desenhada como uma faixa sombreada. */
  referenceMin: number | null;
  referenceMax: number | null;
  formatY: (value: number) => string;
  formatX: (timestamp: number) => string;
  accessibilityLabel: string;
  height?: number;
};

const PADDING = { top: 12, right: 12, bottom: 24, left: 44 };
const POINT_RADIUS = 4;

/**
 * Gráfico de linha simples em SVG. Feito sob medida (sem biblioteca) para desenhar a faixa
 * de referência e destacar pontos fora dela, mantendo o visual do design system.
 */
export function LineChart({
  points,
  referenceMin,
  referenceMax,
  formatY,
  formatX,
  accessibilityLabel,
  height = sizes.chartHeight,
}: LineChartProps) {
  const [width, setWidth] = useState(0);

  function handleLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  const values = points.map((point) => point.y);
  const domainValues = [...values, referenceMin, referenceMax].filter(
    (value): value is number => value !== null,
  );
  let yMin = Math.min(...domainValues);
  let yMax = Math.max(...domainValues);
  if (yMin === yMax) {
    yMin -= 1;
    yMax += 1;
  }
  const yPad = (yMax - yMin) * 0.1;
  yMin = Math.max(0, yMin - yPad);
  yMax += yPad;

  const xMin = Math.min(...points.map((point) => point.x));
  const xMax = Math.max(...points.map((point) => point.x));

  const plotWidth = Math.max(0, width - PADDING.left - PADDING.right);
  const plotHeight = height - PADDING.top - PADDING.bottom;

  const scaleX = (x: number) =>
    PADDING.left + (xMax === xMin ? plotWidth / 2 : ((x - xMin) / (xMax - xMin)) * plotWidth);
  const scaleY = (y: number) => PADDING.top + (1 - (y - yMin) / (yMax - yMin)) * plotHeight;

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${scaleX(point.x)},${scaleY(point.y)}`)
    .join(' ');

  const bandTop = scaleY(referenceMax ?? yMax);
  const bandBottom = scaleY(referenceMin ?? yMin);
  const hasBand = referenceMin !== null || referenceMax !== null;
  const labelStyle = { fontSize: typography.tabLabel.fontSize, fill: colors.textSecondary };

  return (
    <View
      style={[styles.container, { height }]}
      onLayout={handleLayout}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}>
      {width > 0 && points.length > 0 ? (
        <Svg width={width} height={height}>
          {hasBand ? (
            <Rect
              x={PADDING.left}
              y={bandTop}
              width={plotWidth}
              height={Math.max(bandBottom - bandTop, 2)}
              fill={colors.secondary}
              opacity={0.35}
            />
          ) : null}

          {[yMax, (yMin + yMax) / 2, yMin].map((value) => (
            <SvgText key={value} x={PADDING.left - 6} y={scaleY(value) + 4} textAnchor="end" {...labelStyle}>
              {formatY(value)}
            </SvgText>
          ))}
          <Line
            x1={PADDING.left}
            x2={PADDING.left + plotWidth}
            y1={PADDING.top + plotHeight}
            y2={PADDING.top + plotHeight}
            stroke={colors.border}
          />

          {points.length > 1 ? (
            <Path d={linePath} stroke={colors.primary} strokeWidth={2} fill="none" strokeLinejoin="round" />
          ) : null}
          {points.map((point) => (
            <Circle
              key={`${point.x}-${point.y}`}
              cx={scaleX(point.x)}
              cy={scaleY(point.y)}
              r={POINT_RADIUS}
              fill={point.highlighted ? colors.warning : colors.surface}
              stroke={point.highlighted ? colors.warning : colors.primary}
              strokeWidth={2}
            />
          ))}

          <SvgText x={PADDING.left} y={height - 6} textAnchor="start" {...labelStyle}>
            {formatX(xMin)}
          </SvgText>
          {xMax !== xMin ? (
            <SvgText x={PADDING.left + plotWidth} y={height - 6} textAnchor="end" {...labelStyle}>
              {formatX(xMax)}
            </SvgText>
          ) : null}
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: spacing.xs,
  },
});
