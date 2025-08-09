import type { Plugin } from "vite";
import * as fs from 'fs';
import path from "path";

type RedirectPackageImportProps = {
  packageName: string;
  mockPath: string;
  cwd?: string;
};

export function redirectPackageImportPlugin ({
  packageName, mockPath, cwd = process.cwd()
}: RedirectPackageImportProps): Plugin {

  // absolute filesystem path to the mock file
  const mockAbsolute = path.isAbsolute(mockPath)
    ? mockPath
    : path.resolve(cwd, mockPath);

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
        // console.log('resolving import', { importee, importer})
        // only mock exact package imports like `import ... from "foo"`
        if (importee !== packageName) return null;

        // if this is the mock itself doing the importing; skip
        if (importer) {
          const importerResolved = path.resolve(importer);
          if (importerResolved === path.resolve(mockAbsolute)) {
            // console.log('normal resolution occuring');
            // let normal resolution proceed for imports inside the mock file
            return null;
          }
        }

        // console.log('mock resolution occuring');
        return mockAbsolute;
      }
    }
}

