import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { colors, fontFamilyFor, sizes, spacing, typography } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const DRAW_MS = 650;

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
const POINT_RADIUS = 4.5;

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

  const coords = points.map((point) => ({ x: scaleX(point.x), y: scaleY(point.y) }));
  const linePath = coords.map((c, index) => `${index === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
  const baseline = PADDING.top + plotHeight;
  const areaPath =
    coords.length > 1
      ? `${linePath} L${coords[coords.length - 1].x},${baseline} L${coords[0].x},${baseline} Z`
      : '';
  // Comprimento da linha para o efeito de "desenhar" (traço que avança do início ao fim).
  const lineLength = coords.reduce(
    (total, c, index) => (index === 0 ? 0 : total + Math.hypot(c.x - coords[index - 1].x, c.y - coords[index - 1].y)),
    0,
  );

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: DRAW_MS, easing: Easing.out(Easing.cubic) });
  }, [linePath, progress]);
  const lineProps = useAnimatedProps(() => ({
    strokeDashoffset: lineLength * (1 - progress.value),
  }));

  const bandTop = scaleY(referenceMax ?? yMax);
  const bandBottom = scaleY(referenceMin ?? yMin);
  const hasBand = referenceMin !== null || referenceMax !== null;
  // Linhas tracejadas só nos limites que existem. Com mínimo igual ao máximo (ex.: amônia 0 a 0)
  // as duas cairiam no mesmo y: desenhamos uma só, e a chave é o limite, nunca a coordenada.
  const bandEdges = [
    referenceMax !== null ? { id: 'max', y: bandTop } : null,
    referenceMin !== null && referenceMin !== referenceMax ? { id: 'min', y: bandBottom } : null,
  ].filter((edge): edge is { id: string; y: number } => edge !== null);
  const labelStyle = {
    fontSize: typography.overline.fontSize,
    fontFamily: fontFamilyFor('600'),
    fill: colors.textSecondary,
  };

  return (
    <View
      style={[styles.container, { height }]}
      onLayout={handleLayout}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}>
      {width > 0 && points.length > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity={0.28} />
              <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {hasBand ? (
            <>
              <Rect
                x={PADDING.left}
                y={bandTop}
                width={plotWidth}
                height={Math.max(bandBottom - bandTop, 2)}
                rx={8}
                fill={colors.secondary}
              />
              {bandEdges.map(({ id, y }) => (
                <Line
                  key={id}
                  x1={PADDING.left}
                  x2={PADDING.left + plotWidth}
                  y1={y}
                  y2={y}
                  stroke={colors.success}
                  strokeOpacity={0.35}
                  strokeDasharray="4 5"
                />
              ))}
            </>
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
            <>
              <Path d={areaPath} fill="url(#area)" />
              <AnimatedPath
                d={linePath}
                stroke={colors.primary}
                strokeWidth={2.5}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={[lineLength, lineLength]}
                animatedProps={lineProps}
              />
            </>
          ) : null}
          {points.map((point) => (
            <Circle
              key={`${point.x}-${point.y}`}
              cx={scaleX(point.x)}
              cy={scaleY(point.y)}
              r={POINT_RADIUS}
              fill={point.highlighted ? colors.warning : colors.surface}
              stroke={point.highlighted ? colors.warning : colors.primary}
              strokeWidth={2.5}
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
