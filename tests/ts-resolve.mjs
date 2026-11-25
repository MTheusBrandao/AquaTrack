// Resolve imports relativos sem extensão (estilo Metro) para arquivos .ts / index.ts.
import { registerHooks } from 'node:module';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve as resolvePath, dirname } from 'node:path';

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && /\.m?ts$/.test(context.parentURL ?? '')) {
      const base = resolvePath(dirname(fileURLToPath(context.parentURL)), specifier);
      for (const candidate of [base, `${base}.ts`, `${base}/index.ts`]) {
        if (existsSync(candidate) && statSync(candidate).isFile()) {
          return next(pathToFileURL(candidate).href, context);
        }
      }
    }
    return next(specifier, context);
  },
});

