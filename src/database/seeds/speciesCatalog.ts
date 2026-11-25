import type { AquariumType } from '@/features/aquariums/types/aquarium';
import type { SpeciesCategory } from '@/features/species/types/species';

type CatalogEntry = {
  /** Id fixo para que versões futuras do catálogo possam atualizar a mesma linha. */
  id: string;
  commonName: string;
  scientificName: string;
  category: SpeciesCategory;
  waterType: AquariumType;
};

/** Catálogo inicial, propositalmente pequeno. Ampliações entram por nova migration. */
export const CATALOG_SPECIES: CatalogEntry[] = [
  // Água doce — peixes
  { id: 'cat-neon-tetra', commonName: 'Neon', scientificName: 'Paracheirodon innesi', category: 'fish', waterType: 'freshwater' },
  { id: 'cat-betta', commonName: 'Betta', scientificName: 'Betta splendens', category: 'fish', waterType: 'freshwater' },
  { id: 'cat-guppy', commonName: 'Guppy (lebiste)', scientificName: 'Poecilia reticulata', category: 'fish', waterType: 'freshwater' },
  { id: 'cat-platy', commonName: 'Platy', scientificName: 'Xiphophorus maculatus', category: 'fish', waterType: 'freshwater' },
  { id: 'cat-angelfish', commonName: 'Acará-bandeira', scientificName: 'Pterophyllum scalare', category: 'fish', waterType: 'freshwater' },
  { id: 'cat-peppered-cory', commonName: 'Coridora-pintada', scientificName: 'Corydoras paleatus', category: 'fish', waterType: 'freshwater' },
  // Água doce — plantas
  { id: 'cat-anubias', commonName: 'Anúbias', scientificName: 'Anubias barteri', category: 'plant', waterType: 'freshwater' },
  { id: 'cat-java-fern', commonName: 'Samambaia-de-java', scientificName: 'Microsorum pteropus', category: 'plant', waterType: 'freshwater' },
  { id: 'cat-java-moss', commonName: 'Musgo-de-java', scientificName: 'Taxiphyllum barbieri', category: 'plant', waterType: 'freshwater' },
  { id: 'cat-egeria', commonName: 'Elódea', scientificName: 'Egeria densa', category: 'plant', waterType: 'freshwater' },
  { id: 'cat-vallisneria', commonName: 'Valisnéria', scientificName: 'Vallisneria spiralis', category: 'plant', waterType: 'freshwater' },
  // Água doce — invertebrados
  { id: 'cat-red-cherry', commonName: 'Camarão red cherry', scientificName: 'Neocaridina davidi', category: 'shrimp', waterType: 'freshwater' },
  { id: 'cat-amano', commonName: 'Camarão amano', scientificName: 'Caridina multidentata', category: 'shrimp', waterType: 'freshwater' },
  { id: 'cat-nerite', commonName: 'Caramujo nerita', scientificName: 'Vittina natalensis', category: 'snail', waterType: 'freshwater' },
  { id: 'cat-mystery-snail', commonName: 'Ampulária', scientificName: 'Pomacea diffusa', category: 'snail', waterType: 'freshwater' },
  // Marinho
  { id: 'cat-ocellaris', commonName: 'Peixe-palhaço', scientificName: 'Amphiprion ocellaris', category: 'fish', waterType: 'saltwater' },
  { id: 'cat-blue-tang', commonName: 'Cirurgião-patela', scientificName: 'Paracanthurus hepatus', category: 'fish', waterType: 'saltwater' },
  { id: 'cat-blue-damsel', commonName: 'Donzela-azul', scientificName: 'Chrysiptera cyanea', category: 'fish', waterType: 'saltwater' },
  { id: 'cat-firefish', commonName: 'Peixe-dardo-de-fogo', scientificName: 'Nemateleotris magnifica', category: 'fish', waterType: 'saltwater' },
  { id: 'cat-zoanthus', commonName: 'Zoanthus', scientificName: 'Zoanthus sp.', category: 'coral', waterType: 'saltwater' },
  { id: 'cat-discosoma', commonName: 'Coral-cogumelo', scientificName: 'Discosoma sp.', category: 'coral', waterType: 'saltwater' },
  { id: 'cat-hammer', commonName: 'Coral-martelo', scientificName: 'Euphyllia ancora', category: 'coral', waterType: 'saltwater' },
  { id: 'cat-torch', commonName: 'Coral-tocha', scientificName: 'Euphyllia glabrescens', category: 'coral', waterType: 'saltwater' },
  { id: 'cat-cleaner-shrimp', commonName: 'Camarão-limpador', scientificName: 'Lysmata amboinensis', category: 'shrimp', waterType: 'saltwater' },
  { id: 'cat-cerith', commonName: 'Caramujo cerith', scientificName: 'Cerithium sp.', category: 'snail', waterType: 'saltwater' },
  { id: 'cat-blue-leg-hermit', commonName: 'Ermitão-de-patas-azuis', scientificName: 'Clibanarius tricolor', category: 'other_invertebrate', waterType: 'saltwater' },
  // Salobra
  { id: 'cat-green-puffer', commonName: 'Baiacu-verde', scientificName: 'Dichotomyctere nigroviridis', category: 'fish', waterType: 'brackish' },
  { id: 'cat-archerfish', commonName: 'Peixe-arqueiro', scientificName: 'Toxotes jaculatrix', category: 'fish', waterType: 'brackish' },
  { id: 'cat-bumblebee-goby', commonName: 'Gobi-abelha', scientificName: 'Brachygobius doriae', category: 'fish', waterType: 'brackish' },
];
