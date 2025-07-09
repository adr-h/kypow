import { setup } from 'kypanel/server/app';
// import bar from '@foo/yasm';
import _ from 'lodash';

// console.log('bar is', bar);

setup({
   foo: 'baz',
   projectRoot: process.env.PROJECT_ROOT || '', //TODO: just make this the workingdir?
   tsConfigPath: '/home/adrian/Code/kypanel/_sample/tsconfig.json',
   moduleFormat: 'esm',
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
});