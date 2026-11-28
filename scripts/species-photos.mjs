#!/usr/bin/env node
/**
 * Fotos padrão das espécies do catálogo.
 *
 *   npm run species-photos                    baixa do Wikimedia Commons as que faltam
 *   npm run species-photos -- --force <id>    busca de novo a espécie <id> (substitui o arquivo)
 *   npm run species-photos -- --index         só regenera o índice a partir de assets/species/
 *
 * Só aceita imagens com licença livre e grava autor, licença e link de cada uma, que o app mostra
 * em Perfil > Créditos das imagens. Fotos que já existem nunca são sobrescritas sem --force,
 * então as suas fotos ficam a salvo.
 */
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG_FILE = join(ROOT, 'src/database/seeds/speciesCatalog.ts');
const PHOTOS_DIR = join(ROOT, 'assets/species');
const CREDITS_FILE = join(ROOT, 'src/features/species/data/speciesPhotoCredits.json');
const INDEX_FILE = join(ROOT, 'src/features/species/data/speciesPhotos.ts');

const API = 'https://commons.wikimedia.org/w/api.php';
// A Wikimedia exige um User-Agent que identifique o cliente.
const USER_AGENT = 'AquaTrack/1.0 (aquarium app; species photo script)';
const WIDTH = 900;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/** Licenças aceitas: permitem uso em app (inclusive comercial) com atribuição. */
const ALLOWED_LICENSE = /^(cc0|public domain|pd|cc by(-sa)? \d(\.\d)?( [a-z-]+)?)$/i;
/** Termos que costumam indicar mapa, desenho, museu ou peixe fora d'água. */
const UNWANTED = /(map|distribution|range|drawing|illustration|skeleton|stamp|museum|specimen|preserved|dried|plate|diagram|fossil|cooked|market|dead)/i;

const args = process.argv.slice(2);
const indexOnly = args.includes('--index');
const forceIndex = args.indexOf('--force');
const forceIds = forceIndex >= 0 ? args.slice(forceIndex + 1).filter((arg) => !arg.startsWith('--')) : [];

function readCatalog() {
  const source = readFileSync(CATALOG_FILE, 'utf8');
  const entries = [];
  const pattern = /id:\s*'([^']+)',\s*commonName:\s*'([^']+)',\s*scientificName:\s*'([^']+)'/g;
  for (const match of source.matchAll(pattern)) {
    entries.push({ id: match[1], commonName: match[2], scientificName: match[3] });
  }
  if (entries.length === 0) throw new Error('Nenhuma espécie encontrada em speciesCatalog.ts.');
  return entries;
}

function readCredits() {
  return existsSync(CREDITS_FILE) ? JSON.parse(readFileSync(CREDITS_FILE, 'utf8')) : {};
}

function photoFileFor(id) {
  const file = readdirSync(PHOTOS_DIR).find(
    (name) => name.startsWith(`${id}.`) && IMAGE_EXTENSIONS.has(extname(name).toLowerCase()),
  );
  return file ?? null;
}

function stripHtml(html) {
  return String(html ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** "Zoanthus sp." vira "Zoanthus": a busca por gênero traz fotos melhores. */
function searchTerm(scientificName) {
  return scientificName.replace(/\s+sp\.?$/i, '').trim();
}

async function searchCandidates(term) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrsearch: `filetype:bitmap "${term}"`,
    gsrnamespace: '6',
    gsrlimit: '30',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: String(WIDTH),
  });
  const response = await fetch(`${API}?${params}`, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`Commons respondeu ${response.status}`);
  const body = await response.json();
  return body.query?.pages ?? [];
}

function pickBest(pages) {
  const candidates = [];
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    const meta = info.extmetadata ?? {};
    const license = stripHtml(meta.LicenseShortName?.value);
    if (!ALLOWED_LICENSE.test(license)) continue;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(info.mime)) continue;
    if (info.width < WIDTH || info.height < 500) continue;
    const description = `${page.title} ${stripHtml(meta.ImageDescription?.value)}`;
    if (UNWANTED.test(description)) continue;

    const ratio = info.width / info.height;
    // Prefere paisagem perto de 4:3 (formato do card) e a ordem de relevância da busca.
    const score = -Math.abs(ratio - 4 / 3) * 2 - (page.index ?? 0) * 0.05;
    candidates.push({ page, info, meta, license, score });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] ?? null;
}

async function download(url, target) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`download respondeu ${response.status}`);
  writeFileSync(target, Buffer.from(await response.arrayBuffer()));
}

function writeIndex(catalog, credits) {
  const lines = [];
  for (const { id } of catalog) {
    const file = photoFileFor(id);
    if (!file) continue;
    lines.push(`  '${id}': require('../../../../assets/species/${file}'),`);
    // Foto colocada à mão, sem crédito do Wikimedia: é do próprio autor do app.
    if (!credits[id] || credits[id].file !== file) {
      credits[id] = { file, source: 'own' };
    }
  }
  for (const id of Object.keys(credits)) {
    if (!photoFileFor(id)) delete credits[id];
  }

  const content = [
    '// Arquivo gerado por `npm run species-photos`. Não edite à mão: rode `npm run species-photos -- --index`',
    '// depois de colocar ou trocar fotos em assets/species/.',
    lines.length
      ? `export const SPECIES_PHOTOS: Readonly<Record<string, number>> = {\n${lines.join('\n')}\n};`
      : 'export const SPECIES_PHOTOS: Readonly<Record<string, number>> = {};',
    '',
  ].join('\n');
  writeFileSync(INDEX_FILE, content);
  writeFileSync(CREDITS_FILE, `${JSON.stringify(credits, null, 2)}\n`);
  return lines.length;
}

async function main() {
  const catalog = readCatalog();
  const credits = readCredits();

  if (!indexOnly) {
    for (const species of catalog) {
      const existing = photoFileFor(species.id);
      const forced = forceIds.includes(species.id);
      if (existing && !forced) continue;

      process.stdout.write(`${species.commonName} (${species.scientificName})… `);
      try {
        const best = pickBest(await searchCandidates(searchTerm(species.scientificName)));
        if (!best) {
          console.log('nenhuma foto com licença livre encontrada; fica a ilustração.');
          continue;
        }
        const extension = best.info.mime === 'image/png' ? '.png' : best.info.mime === 'image/webp' ? '.webp' : '.jpg';
        if (existing) unlinkSync(join(PHOTOS_DIR, existing));
        const file = `${species.id}${extension}`;
        await download(best.info.thumburl ?? best.info.url, join(PHOTOS_DIR, file));

        credits[species.id] = {
          file,
          source: 'wikimedia',
          title: best.page.title.replace(/^File:/, ''),
          author: stripHtml(best.meta.Artist?.value) || 'Autor desconhecido',
          license: best.license,
          licenseUrl: stripHtml(best.meta.LicenseUrl?.value) || null,
          sourceUrl: best.info.descriptionurl,
        };
        console.log(`ok (${best.license})`);
      } catch (error) {
        console.log(`falhou: ${error.message}`);
      }
      // Pausa curta para não sobrecarregar a API pública.
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  const count = writeIndex(catalog, credits);
  console.log(`\n${count} de ${catalog.length} espécies com foto. Créditos em ${CREDITS_FILE.replace(ROOT, '.')}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
