import type { Plugin } from "vite";
import { normalizePath } from 'vite' // always normalize to forward slashes

type RedirectModuleImportProps = {
  mockModuleAbsolutePath: string,
  originalModuleAbsolutePath: string;
};

export function redirectModuleImport ({
  mockModuleAbsolutePath, originalModuleAbsolutePath
}: RedirectModuleImportProps): Plugin {
  return {
      name: 'redirect-module-import',
      enforce: 'pre',

      async resolveId(source, importer) {
        // Resolve the actual path of the import
        const resolved = await this.resolve(source, importer, { skipSelf: true })
        if (!resolved) return null

        const resolvedId = normalizePath(resolved.id);
        const importerPath = importer ? normalizePath(importer) : ''

        // If this resolves to the originalModule, and is NOT an import from the mock
        if (resolvedId === originalModuleAbsolutePath && !importerPath.startsWith(mockModuleAbsolutePath)) {
          return mockModuleAbsolutePath
        }

        return null;
      }
    }
}

