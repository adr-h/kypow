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

function stripFileExtension(filePath) {
  return path.join(
    path.dirname(filePath),
    path.basename(filePath, path.extname(filePath))
  );
}

function hasFileExtension(filePath) {
  return path.extname(filePath) !== '';
}

export const mockDbModulePlugin = ({ source: initialSource, destination: initialDestination, projectRoot, projectRelativeFileDir }: MockDbInstancePluginParams): Plugin => {
  const finalSource = isRelativeImport(initialSource) ? path.resolve(projectRoot, initialSource) : initialSource;
  const finalDestination = isRelativeImport(initialDestination) ? path.resolve(projectRoot, initialDestination) : initialDestination;

  // Filter matches relative imports ending with 'foo' or 'foo.ts'
  // const filter = /(^\.{1,2}\/.*foo(\.ts)?$)/;
  const filter = new RegExp(`${path.basename(initialSource)}(\\.[^/]+)?$`)



  return {
    name: 'mock-db-module',
    setup(build) {
      build.onResolve({ filter }, async (args) => {
        // Prevent recursion: don't intercept imports coming *from* the replacement
        const importer = path.resolve(args.importer);
        console.log('importer', importer);
        console.log('args path', args.path);
        console.log('finalSource', finalSource);
        console.log('finalDestination', finalDestination);

        const pathToActualFileDir = path.relative(args.resolveDir, projectRelativeFileDir);
        const _a = path.resolve(args.resolveDir, pathToActualFileDir)
        console.log(_a);

        const resolvedImportPath = path.resolve(_a, args.path);
        console.log('resolvedSourcePath', resolvedImportPath);
        const isImportingMock = stripFileExtension(resolvedImportPath) === stripFileExtension(finalSource);

        if (isImportingMock) {
          return { path: finalDestination };

          // if (hasFileExtension(resolvedImportPath)) {
          //   return { path: finalDestination };
          // }

          // const candidates = [
          //   path.resolve(resolvedImportPath + ".d.ts"),
          //   path.resolve(resolvedImportPath + ".ts"),
          //   path.resolve(resolvedImportPath + ".js"),
          //   path.resolve(resolvedImportPath + ".tsx"),
          //   path.resolve(resolvedImportPath + ".jsx"),
          //   path.resolve(resolvedImportPath + ".json"),

          //   path.resolve(resolvedImportPath + "index.d.ts"),
          //   path.resolve(resolvedImportPath +"index.ts"),
          //   path.resolve(resolvedImportPath +"index.js"),
          //   path.resolve(resolvedImportPath +"index.jsx"),
          //   path.resolve(resolvedImportPath +"index.tsx"),
          // ];

          // for (const file of candidates) {
          //   try {
          //     console.log('finding', file, '. its resolverdir was', args.resolveDir);
          //     if (await fs.stat(file)) {
          //       console.log('found', file);
          //       return { path: finalDestination };
          //     }
          //   } catch (_ex) { }
          // }
          // console.log('failed to resolve')
        }

        // if (importer === finalDestination) {
        //   return;
        // }

        //   const candidates = [
        //     path.resolve(_a, args.path + ".d.ts"),
        //     path.resolve(_a, args.path + ".ts"),
        //     path.resolve(_a, args.path + ".js"),
        //     path.resolve(_a, args.path + ".tsx"),
        //     path.resolve(_a, args.path + ".jsx"),
        //     path.resolve(_a, args.path + ".json"),

        //     path.resolve(_a, args.path + "index.d.ts"),
        //     path.resolve(_a, args.path, "index.ts"),
        //     path.resolve(_a, args.path, "index.js"),
        //     path.resolve(_a, args.path, "index.jsx"),
        //     path.resolve(_a, args.path, "index.tsx"),
        // ];

        // for (const file of candidates) {

        //     try {
        //       console.log('finding', file,'. its resolverdir was', args.resolveDir);
        //       if (await fs.stat(file)) {
        //           console.log('found', file);
        //           return { path: file };
        //       }
        //     } catch(_ex) {}
        // }

        // console.log('resolving');
        // const resolved = await build.resolve(args.path, {
        //   importer: args.importer,
        //   kind: args.kind
        // });

        // console.log('resolved', resolved);

        // if (path.resolve(resolved.path) === finalSource) {
        //   return {
        //     path: finalDestination
        //   };
        // }

        return;
      });
    }
  }
};