import esbuild, { type Plugin } from 'esbuild';
import path, { resolve } from 'path';
import fs from 'fs/promises';

type MockDbInstancePluginParams = {
  pathToOriginalModule: string;
  pathToMockModule: string;
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

export const mockDbModulePlugin = ({ pathToOriginalModule, pathToMockModule, projectRoot, projectRelativeFileDir }: MockDbInstancePluginParams): Plugin => {
  if (!hasFileExtension(pathToOriginalModule) || !hasFileExtension(pathToMockModule)) {
    throw new Error("Both mock and original module paths must have file extensions!");
  }

  const absolutePathToOriginalModule = isRelativeImport(pathToOriginalModule) ? path.resolve(projectRoot, pathToOriginalModule) : pathToOriginalModule;
  const absoluteMockPath = isRelativeImport(pathToMockModule) ? path.resolve(projectRoot, pathToMockModule) : pathToMockModule;

  // Filter matches relative imports ending with 'foo' or 'foo.ts'
  const filter = new RegExp(`${stripFileExtension(path.basename(pathToOriginalModule))}(\\.[^/]+)?$`)

  return {
    name: 'mock-db-module',
    setup(build) {
      // TODO: rewrite this module entirely. what a mess
      build.onResolve({ filter }, async (args) => {
        const isImporterTheMockItself = args.importer === absoluteMockPath;
        // TODO: also need to check if isImportingMock
        // TOOD: the resolvedImportPath is wrong...
        if (isImporterTheMockItself && isRelativeImport(args.path)) {
          const dirOfMock = path.dirname(absoluteMockPath);
          const resolvedImportPath = path.resolve(dirOfMock, args.path);
          const isImportingMock = stripFileExtension(resolvedImportPath) === stripFileExtension(absolutePathToOriginalModule);

          if (!isImportingMock) {
            return;
          }

          return { path: absolutePathToOriginalModule, external: false }
        }

        const routeToOriginalModuleDir = path.relative(args.resolveDir, projectRelativeFileDir);
        const originalModuleDirectory = path.resolve(args.resolveDir, routeToOriginalModuleDir)
        const resolvedImportPath = path.resolve(originalModuleDirectory, args.path);
        const isImportingMock = stripFileExtension(resolvedImportPath) === stripFileExtension(absolutePathToOriginalModule);

        if (isImportingMock) {
          return { path: absoluteMockPath };
        }

        return;
      });
    }
  }
};