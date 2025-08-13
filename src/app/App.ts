import type { FSWatcher } from "chokidar";
import { createWatcher, isSameRelativePath } from "../lib/file_system";
import type { DialectPlugin } from "../lib/sql";
import { resolveDialectPlugin } from "../lib/sql/resolveDialectPlugin";
import type { Config } from "./Config";
import { createViteWithKyselyImposter } from "./createViteWithKyselyImposter";
import { KyselyImposterPath } from './services/getQuery/fake-kysely';
import type { ViteDevServer } from "vite";
import { getQueryService } from "./services/getQuery";
import { listQueryModulesService } from "./services/listQueryModules";
import { fileURLToPath } from "url";
import { listQueriesService } from "./services/listQueries";

Error.stackTraceLimit = 1000;
const kypowRoot = fileURLToPath(new URL('..', import.meta.url))

export class App {
   projectRoot: string;
   kypowRoot: any;
   tsconfig: string;
   sqlDialect: DialectPlugin;
   searchPaths: string[];
   ignorePaths: string[];
   noExternal: string[];

   private watcher: FSWatcher;
   private _vite?: ViteDevServer;

   constructor(config: Config) {
      this.projectRoot = config.projectRoot;
      this.kypowRoot = kypowRoot;
      this.tsconfig = config.tsConfigPath;
      this.sqlDialect = resolveDialectPlugin(config.dialect);
      this.noExternal = config.noExternal || [];

      // TODO: customisable
      this.searchPaths = ['**/**.ts', '**/*.js'];
      this.ignorePaths = ['node_modules']

      this.watcher = createWatcher({ searchPaths: this.searchPaths, ignorePaths: this.ignorePaths, cwd: this.projectRoot })
   }

   private async getVite() {
      if (!this._vite) {
         // const watcher = createWatcher({ searchPaths, ignorePaths, cwd: projectRoot });
         this._vite = await createViteWithKyselyImposter({
            projectRoot: this.projectRoot,
            kypowRoot: this.kypowRoot,
            noExternal: this.noExternal,
            kyselyImposterModule: KyselyImposterPath,
         })
      }

      return this._vite;
   }

   private async loadModule(modulePath: string) {
      const vite = await this.getVite();
      return vite.ssrLoadModule(modulePath);
   }

   async getQuery({modulePath, functionName}: {
      modulePath: string;
      functionName: string;
   }) {
      const query = await getQueryService({
         modulePath,
         functionName,
         tsconfig: this.tsconfig,
         sqlDialect: this.sqlDialect,
         loadModule: this.loadModule.bind(this),
      });

      return {
         name: query.name,
         description: query.description,
         params: query.params,
         sql: query.sql,
         sampleSql: query.sampleSql,

         // TOOD: messy.
         addUpdateListener: (callback: (newQuery: ReturnType<App['getQuery']>) => void) => {
            const listener = (changedFile: string) => {
               if (!isSameRelativePath(changedFile, modulePath)) return;
               callback(this.getQuery({modulePath, functionName}));
            };

            const removeListener = () => {
               this.watcher.off('change', listener);
               this.watcher.off('unlink', listener);
            }
            this.watcher.on('change', listener);
            this.watcher.on('unlink', listener);

            return {
               removeListener
            }
         }
      }
   }

   async listQueryModules() {
      return {
         modules: await listQueryModulesService({
            searchPaths: this.searchPaths,
            ignorePaths: this.ignorePaths,
            cwd: this.projectRoot
         }),

         // TODO: messy.
         addUpdateListener: (callback: (newList: ReturnType<App['listQueryModules']>) => void) => {
            const listener = (_changedFile: string) => callback(this.listQueryModules());
            const removeListener = () => {
               this.watcher.off('add', listener);
               this.watcher.off('change', listener);
               this.watcher.off('unlink', listener);
            }
            this.watcher.on('add', listener);
            this.watcher.on('change', listener);
            this.watcher.on('unlink', listener);

            return {
               removeListener
            }
         }
      }
   }

   async listQueries({ modulePath }: { modulePath: string}) {
      return listQueriesService({
         modulePath,
         tsconfig: this.tsconfig
      });
   }

}