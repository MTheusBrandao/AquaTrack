// Permite rodar o código TypeScript do app no Node:
// - imports relativos sem extensão (estilo Metro) → .ts / index.ts
// - alias "@/" → src/
// - módulos nativos do Expo → stubs em tests/stubs (o Node não tem o runtime nativo)
import { existsSync, statSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const testsDir = dirname(fileURLToPath(import.meta.url));
const srcDir = resolvePath(testsDir, '../src');

const NATIVE_STUBS = {
  'expo-crypto': 'expo-crypto.mjs',
  'expo-file-system': 'expo-file-system.mjs',
  'expo-notifications': 'expo-notifications.mjs',
  'react-native': 'react-native.mjs',
};

function resolveTs(base) {
  for (const candidate of [base, `${base}.ts`, `${base}/index.ts`]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return pathToFileURL(candidate).href;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, next) {
    const fromAppCode = /\.m?ts$/.test(context.parentURL ?? '');
    if (fromAppCode && NATIVE_STUBS[specifier]) {
      return next(pathToFileURL(resolvePath(testsDir, 'stubs', NATIVE_STUBS[specifier])).href, context);
    }
    if (fromAppCode && specifier.startsWith('@/')) {
      const url = resolveTs(resolvePath(srcDir, specifier.slice(2)));
      if (url) return next(url, context);
    }
    if (fromAppCode && specifier.startsWith('.')) {
      const url = resolveTs(resolvePath(dirname(fileURLToPath(context.parentURL)), specifier));
      if (url) return next(url, context);
    }
    return next(specifier, context);
  },
});
