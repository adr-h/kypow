import { Config } from 'kypanel/app/Config';
// import bar from '@foo/yasm';

export const config: Config = {
   foo: 'baz',
   projectRoot: "/home/adrian/Code/kypanel/_sample", //TODO: just make this the workingdir?
   tsConfigPath: '/home/adrian/Code/kypanel/_sample/tsconfig.json',
   moduleFormat: 'esm',
   dialect: 'sqlite', // TODO: very awkward that both the mock and the config need to define the dialect and both be in sync.
   mocks: [
      // TODO: maybe use TS to ensure that relative imports always have leading './'
      // E.g:
      // type ModuleSetting =
      //    {
      //       pathType: "relative"
      //       path: <string that must lead with './' or '../'>
      //    } | {
      //       pathType: "non-relative"
      //       path: <string that must NOT lead with './' or '../'>
      //    }

      // TODO: right now, it only works with absolute paths. Need to write a resolver on the other end that will handle for relative + absolute + node_modules-like imports
      {
         pathToOriginalModule: '/home/adrian/Code/kypanel/_sample/src/db.ts',
         pathToMockModule: '/home/adrian/Code/kypanel/_sample/.kypanel/defaultMock.ts'
      }
   ]
   // TODO: one alternative to needing users to bring their own separate mock module is to do jest-style mock setups:
   // mocks: [
   //    (mocker, dummyKyselyWithRightDialect) => {
   //       mocker.mock('path/to/original/module.ts', () => {
   //          return {
   //             // allow them to re-export the rest of the module as-is
   //             db: dummyKyselyWithRightDialect
   //          }
   //       })
   //    }
   // ]
};
