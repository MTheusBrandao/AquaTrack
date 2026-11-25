export const AQUARIUM_TYPES = ['freshwater', 'saltwater', 'brackish'] as const;

export type AquariumType = (typeof AQUARIUM_TYPES)[number];

export const AQUARIUM_TYPE_LABELS: Record<AquariumType, string> = {
  freshwater: 'Água doce',
  saltwater: 'Marinho',
  brackish: 'Salobra',
};

export type Aquarium = {
  id: string;
  name: string;
  type: AquariumType;
  /** Litros */
  volume: number;
  /** Centímetros */
  length: number | null;
  width: number | null;
  height: number | null;
  /** Data local no formato YYYY-MM-DD */
  setupDate: string | null;
  /** °C */
  targetTemperature: number | null;
  description: string | null;
  /** Caminho relativo ao diretório de documentos do app (ver imageStorage). */
  imageUri: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AquariumWithStats = Aquarium & {
  /** Quantidade de espécies diferentes registradas no aquário. */
  speciesCount: number;
};

export type AquariumInput = Omit<Aquarium, 'id' | 'createdAt' | 'updatedAt'>;
