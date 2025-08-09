import { Config } from 'kypanel/app/Config';
// import bar from '@foo/yasm';

export const config: Config = {
   foo: 'baz',
   projectRoot: process.env.PROJECT_ROOT || '', //TODO: just make this the workingdir?
   tsConfigPath: '/home/adrian/Code/kypanel/_sample/tsconfig.json',
   moduleFormat: 'esm',
   dialect: 'sqlite',
};
