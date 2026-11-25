/**
 * Cálculos de aquarismo. Funções puras: recebem números já validados e devolvem
 * null quando a combinação de entradas não tem resposta.
 */

/** 1 °dH (GH ou KH) = 17,848 mg/L de CaCO₃ equivalente. */
export const PPM_PER_DEGREE_HARDNESS = 17.848;
/** 1 meq/L de alcalinidade = 2,8 dKH. */
export const DKH_PER_MEQ = 2.8;

/** Volume bruto em litros a partir de dimensões em centímetros. */
export function tankVolumeLiters(lengthCm: number, widthCm: number, heightCm: number): number {
  return (lengthCm * widthCm * heightCm) / 1000;
}

/** Litros a trocar para uma porcentagem do volume. */
export function waterChangeLiters(volumeLiters: number, percent: number): number {
  return (volumeLiters * percent) / 100;
}

/**
 * Porcentagem de troca de água para levar uma concentração (ex.: nitrato) de `current`
 * até `target`, repondo água com concentração `replacement`. Modelo de diluição de uma
 * troca única: target = current × (1 − p) + replacement × p.
 * Retorna null se o alvo não for alcançável com uma troca (alvo ≤ água nova ou ≥ atual).
 */
export function waterChangePercentForTarget(
  current: number,
  target: number,
  replacement: number,
): number | null {
  if (target >= current) return 0;
  if (target <= replacement) return null;
  return ((current - target) / (current - replacement)) * 100;
}

export function degreesToPpm(degrees: number): number {
  return degrees * PPM_PER_DEGREE_HARDNESS;
}

export function ppmToDegrees(ppm: number): number {
  return ppm / PPM_PER_DEGREE_HARDNESS;
}

export function dkhToMeq(dkh: number): number {
  return dkh / DKH_PER_MEQ;
}

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

/**
 * Densidade relativa aproximada a partir da salinidade, para água a ~25 °C
 * (35 ppt ≈ 1,0264). Aproximação linear, adequada à faixa usada em aquários.
 */
export function salinityToSpecificGravity(ppt: number): number {
  return 1 + ppt * 0.000754;
}

export function specificGravityToSalinity(specificGravity: number): number {
  return (specificGravity - 1) / 0.000754;
}

/**
 * Diluição genérica (C1·V1 = C2·V2): mL de uma solução estoque necessários para elevar
 * a concentração do aquário em `increaseMgPerL`. Não substitui as instruções do fabricante.
 */
export function doseMilliliters(
  volumeLiters: number,
  increaseMgPerL: number,
  stockMgPerMl: number,
): number | null {
  if (stockMgPerMl <= 0) return null;
  return (volumeLiters * increaseMgPerL) / stockMgPerMl;
}
