import { z } from 'zod';

import { optionalPastDate, optionalText } from '@/utils/validation';

import { SPECIES_CATEGORIES, type AquariumOrganism } from '../types/species';

const organismFields = z.object({
  quantity: z
    .string()
    .trim()
    .min(1, 'Informe a quantidade.')
    .regex(/^\d+$/, 'Use um número inteiro.')
    .transform(Number)
    .refine((value) => value >= 1 && value <= 9999, 'Use um valor entre 1 e 9999.'),
  addedAt: optionalPastDate,
  notes: optionalText(300),
});

const customSpeciesSchema = z.object({
  commonName: z.string().trim().min(1, 'Informe o nome popular.').max(60, 'Use no máximo 60 caracteres.'),
  scientificName: optionalText(80),
  category: z.enum(SPECIES_CATEGORIES, 'Escolha a categoria.'),
});

/**
 * Um único formulário serve para adicionar e editar. `customSpecies` só é preenchido
 * quando o usuário cadastra manualmente uma espécie que não está no catálogo.
 */
export const organismSchema = organismFields.extend({
  customSpecies: customSpeciesSchema.nullable(),
});

export type OrganismFormValues = z.input<typeof organismSchema>;
export type OrganismFormOutput = z.output<typeof organismSchema>;

export function emptyOrganismForm(customSpeciesName?: string): OrganismFormValues {
  return {
    quantity: '1',
    addedAt: null,
    notes: '',
    customSpecies:
      customSpeciesName === undefined
        ? null
        : { commonName: customSpeciesName, scientificName: '', category: 'fish' },
  };
}

export function organismToForm(organism: AquariumOrganism): OrganismFormValues {
  return {
    quantity: String(organism.quantity),
    addedAt: organism.addedAt,
    notes: organism.notes ?? '',
    customSpecies: null,
  };
}
