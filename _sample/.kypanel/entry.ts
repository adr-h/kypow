import { setupKypanel } from '../../server/main';
import bar from '@foo/yasm';
import _ from 'lodash';

console.log('bar is', bar);

setupKypanel({
   foo: 'baz',
   projectRoot: process.env.PROJECT_ROOT || '', //TODO: just make this the workingdir?
   tsConfigPath: '/home/adrian/Code/kypanel/_sample/tsconfig.json'
});