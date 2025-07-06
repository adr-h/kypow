import { setup } from 'kypanel/server/app';
// import bar from '@foo/yasm';
import _ from 'lodash';

// console.log('bar is', bar);

setup({
   foo: 'baz',
   projectRoot: process.env.PROJECT_ROOT || '', //TODO: just make this the workingdir?
   tsConfigPath: '/home/adrian/Code/kypanel/_sample/tsconfig.json',
   moduleFormat: 'esm',
   compileMode: {
      dbModules: [
         // source and destination should be defined with paths relative to the project root, unless they are node_module imports
         {
            source: './src/db',
            destination: './.kypanel/defaultMock.ts'
         }
      ]
   }
});