import esbuild, { type Plugin } from 'esbuild';
import path, { resolve } from 'path';
import fs from 'fs/promises';

type MockDbInstancePluginParams = {
  source: string;
  destination: string;
  projectRoot: string;

  projectRelativeFileDir: string;
}

function isRelativeImport(path: string) {
  return path.startsWith('./') || path.startsWith('../');
}

function stripFileExtension(filePath: string) {
  return path.join(
    path.dirname(filePath),
    path.basename(filePath, path.extname(filePath))
  );
}

function hasFileExtension(filePath: string) {
  return Boolean(path.extname(filePath));
}

export const mockDbModulePlugin = ({ source: initialSource, destination: initialDestination, projectRoot, projectRelativeFileDir }: MockDbInstancePluginParams): Plugin => {
  const finalSource = isRelativeImport(initialSource) ? path.resolve(projectRoot, initialSource) : initialSource;
  const absoluteMockPath = isRelativeImport(initialDestination) ? path.resolve(projectRoot, initialDestination) : initialDestination;

  // Filter matches relative imports ending with 'foo' or 'foo.ts'
  const filter = new RegExp(`${path.basename(initialSource)}(\\.[^/]+)?$`)

  return {
    name: 'mock-db-module',
    setup(build) {
      // TODO: rewrite this module entirely. what a mess
      build.onResolve({ filter }, async (args) => {
        const isImporterTheMockItself = args.importer === absoluteMockPath;
        // TODO: also need to check if isImportingMock
        // TOOD: the resolvedImportPath is wrong...
        if (isImporterTheMockItself && isRelativeImport(args.path)) {
          // const routeToOriginalModuleDir = path.relative(absoluteMockPath, projectRelativeFileDir);
          // const originalModuleDirectory = path.resolve(args.resolveDir, routeToOriginalModuleDir)
          const dirOfMock = path.dirname(absoluteMockPath);
          const resolvedImportPath = path.resolve(dirOfMock, args.path);

          const isImportingMock = stripFileExtension(resolvedImportPath) === stripFileExtension(finalSource);
          console.log('mock: resolvedSourcePath', resolvedImportPath);
          console.log('mock: final source', finalSource)
          console.log('mock: absoluteMockPath', absoluteMockPath)
          // console.log('mock: originalModuleDirectory', originalModuleDirectory)
          console.log('mock: args.path', args.path);

          if (!isImportingMock) {
            return;
          }

          if (hasFileExtension(finalSource)) {
            return { path: finalSource, external: true }
          }

          const candidates = [
              path.resolve(finalSource + ".d.ts"),
              path.resolve(finalSource + ".ts"),
              path.resolve(finalSource + ".js"),
              path.resolve(finalSource + ".tsx"),
              path.resolve(finalSource + ".jsx"),
              // path.resolve(finalSource + ".json"),

              path.resolve(finalSource + "index.d.ts"),
              path.resolve(finalSource, "index.ts"),
              path.resolve(finalSource, "index.js"),
              path.resolve(finalSource, "index.jsx"),
              path.resolve(finalSource, "index.tsx"),
          ];
          for (const file of candidates) {
              try {
                // console.log('finding', file,'. its resolverdir was', args.resolveDir);
                if (await fs.stat(file)) {
                    // console.log('found', file);
                    return { path: file };
                }
              } catch(_ex) {}
          }

          return;
        }

        const routeToOriginalModuleDir = path.relative(args.resolveDir, projectRelativeFileDir);
        const originalModuleDirectory = path.resolve(args.resolveDir, routeToOriginalModuleDir)
        const resolvedImportPath = path.resolve(originalModuleDirectory, args.path);
        const isImportingMock = stripFileExtension(resolvedImportPath) === stripFileExtension(finalSource);

        if (isImportingMock) {
          return { path: absoluteMockPath };
        }

        return;
      });
    }
  }
};