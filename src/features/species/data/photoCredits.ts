import { CATALOG_SPECIES } from '@/database/seeds/speciesCatalog';

import credits from './speciesPhotoCredits.json';

/** Registro gravado por `npm run species-photos` para cada foto em assets/species/. */
export type SpeciesPhotoCredit =
  | { file: string; source: 'own' }
  | {
      file: string;
      source: 'wikimedia';
      title: string;
      author: string;
      license: string;
      licenseUrl: string | null;
      sourceUrl: string;
    };

export type PhotoCreditEntry = { speciesId: string; speciesName: string; credit: SpeciesPhotoCredit };

/** Créditos na ordem do catálogo, com o nome popular da espécie. */
export function listPhotoCredits(): PhotoCreditEntry[] {
  const byId = credits as Record<string, SpeciesPhotoCredit>;
  return CATALOG_SPECIES.filter((species) => byId[species.id]).map((species) => ({
    speciesId: species.id,
    speciesName: species.commonName,
    credit: byId[species.id],
  }));
}
