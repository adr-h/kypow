import type { Plugin } from "vite";
import * as fs from 'fs';
import path from "path";

type RedirectPackageImportProps = {
  packageName: string,
  mockPath: string;
};

export function redirectPackageImport ({
  packageName, mockPath
}: RedirectPackageImportProps): Plugin {

  // absolute filesystem path to the mock file
  const mockAbsolute = path.isAbsolute(mockPath)
    ? mockPath
    : path.resolve(process.cwd(), mockPath);

  return {
      name: 'redirect-package-import',
      enforce: 'pre',

      async buildStart() {
        if (!fs.existsSync(mockAbsolute)) {
          this.error(
            `mockPackagePlugin: mock file not found at ${mockAbsolute}. Check plugin option mockPath.`
          );
        }
      },

      async resolveId(importee, importer) {
        // only mock exact package imports like `import ... from "foo"`
        if (importee !== packageName) return null;

        // if this is the mock itself doing the importing; skip
        if (importer) {
          const importerResolved = path.resolve(importer);
          if (importerResolved === path.resolve(mockAbsolute)) {
            // let normal resolution proceed for imports inside the mock file
            return null;
          }
        }

        return mockAbsolute;
      }
    }
}

