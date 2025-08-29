import { Project as TsMorphProject } from "ts-morph";
import chokidar, { FSWatcher } from 'chokidar';
import { SimpleQueue } from "../queue/SimpleQueue";

type ConstructorProps = {
   tsConfigFilePath: string;
   onUpdateStart?: () => void;
   onUpdateComplete?: () => void;
}

export class WatchedTypeScriptProject {
   private watcher: FSWatcher;
   private project: TsMorphProject;
   private queue: SimpleQueue;

   constructor({ tsConfigFilePath, onUpdateComplete, onUpdateStart }: ConstructorProps) {
      console.time('Starting TS Project');
      this.project = new TsMorphProject({
         tsConfigFilePath,
         skipFileDependencyResolution: true,
      });
      console.timeEnd('Starting TS Project');

      this.queue = new SimpleQueue({
         onRunning: onUpdateStart,
         onEmpty: onUpdateComplete
      });

      //TODO: configurable
      const searchPaths = ['**/**.ts', '**/*.js'];
      const ignorePaths = ['node_modules'];

      this.watcher = chokidar.watch(searchPaths, {
         persistent: true,
         ignoreInitial: true,
         ignored: ignorePaths,
      });

      this.setupListeners();
   }

   async safelyGetProject() {
      await this.queue.waitForEmpty();
      return this.project;
   }

   private setupListeners() {
      this.watcher.on('add', (path) => this.pushAddTask(path));
      this.watcher.on('unlink', (path) => this.pushRemoveTask(path));
      this.watcher.on('change',(path) => this.pushChangeTask(path))
   }

   private pushAddTask(path: string) {
      this.queue.push(() => {
         this.project.addSourceFileAtPath(path);
      });
   }

   private pushRemoveTask(path: string) {
      this.queue.push(() => {
         const sourceFile = this.project.getSourceFile(path);
         if (!sourceFile) return;

         this.project.removeSourceFile(sourceFile);
      })
   }

   private pushChangeTask(path: string) {
      this.queue.push(async () => {
         const sourceFile = this.project.getSourceFile(path);
          if (!sourceFile) return;

         await sourceFile.refreshFromFileSystem();
      })
   }
}