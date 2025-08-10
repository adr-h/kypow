import chokidar from 'chokidar';


type CreateWatcherParams = {
   searchPaths: string[];
   ignorePaths?: string[];
   cwd?: string
}
export function createWatcher({ searchPaths, ignorePaths, cwd = process.cwd()}: CreateWatcherParams) {
   // const searchPaths = ['**/*.ts', '**/*.js'];

   const watcher = chokidar.watch(searchPaths, {
      persistent: true,
      ignoreInitial: true,
      ignored: ignorePaths,
      cwd
   });

   console.log('initialised watcher with', searchPaths, {
      persistent: true,
      ignoreInitial: true,
      ignored: ignorePaths,
      cwd
   })

   watcher
      .on('ready', () => console.log('Watcher ready', watcher.getWatched()))
      .on('add', path => console.log('File added:', path))
      .on('change', path => console.log('File changed:', path))
      .on('unlink', path => console.log('File removed:', path))
      .on('error', err => console.error('Watcher error:', err));

   return watcher;
}

