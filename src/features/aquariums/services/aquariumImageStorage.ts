import { Directory, File, Paths } from 'expo-file-system';

import { createId } from '@/utils/id';

const IMAGES_DIR = 'aquarium-images';

/**
 * O banco guarda apenas o caminho relativo ao diretório de documentos.
 * No iOS o caminho absoluto do container muda entre instalações/atualizações,
 * então um URI absoluto salvo no banco deixaria de funcionar.
 */
export function isStoredImage(uri: string): boolean {
  return !uri.includes('://');
}

export function resolveImageUri(uri: string): string {
  return isStoredImage(uri) ? new File(Paths.document, uri).uri : uri;
}

/** Copia a imagem escolhida (que fica em cache temporário) para o armazenamento do app. */
export async function persistImage(sourceUri: string): Promise<string> {
  const directory = new Directory(Paths.document, IMAGES_DIR);
  directory.create({ intermediates: true, idempotent: true });

  const source = new File(sourceUri);
  const extension = source.extension || '.jpg';
  const relativePath = `${IMAGES_DIR}/${createId()}${extension}`;

  await source.copy(new File(Paths.document, relativePath));
  return relativePath;
}

export function deleteStoredImage(relativePath: string): void {
  try {
    const file = new File(Paths.document, relativePath);
    if (file.exists) file.delete();
  } catch (error) {
    // Falha ao remover um arquivo órfão não deve impedir a operação principal.
    console.warn('Não foi possível remover a imagem do aquário', error);
  }
}
