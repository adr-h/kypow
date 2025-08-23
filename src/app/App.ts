import type { DialectPlugin } from "../lib/sql";
import { resolveDialectPlugin } from "../lib/sql/resolveDialectPlugin";
import type { Config } from "./Config";
import { createViteWithKyselyImposter } from "./createViteWithKyselyImposter";
import { KyselyImposterPath } from './services/getQuery/fake-kysely';
import type { ViteDevServer } from "vite";
import { getQueryService } from "./services/getQuery";
import { listQueryModulesServicePoc } from "./services/listQueryModules";
import { fileURLToPath } from "url";
import { listQueriesService } from "./services/listQueries";
import { WatchedTypeScriptProject } from "../lib/type-system/WatchedTypeScriptProject";

Error.stackTraceLimit = 1000;
const kypowRoot = fileURLToPath(new URL('..', import.meta.url))

type UpdateSubscriber = (a: { type: 'LOADING' | 'READY' }) => void;

export class App {
   projectRoot: string;
   kypowRoot: any;
   tsconfig: string;
   sqlDialect: DialectPlugin;
   searchPaths: string[];
   ignorePaths: string[];
   noExternal: string[];
   queryTimeout: number;
   updateSubscribers: UpdateSubscriber[];

   private _vite?: ViteDevServer;

   private watchedTsProject: WatchedTypeScriptProject;

   constructor(config: Config) {
      this.projectRoot = config.projectRoot;
      this.kypowRoot = kypowRoot;
      this.tsconfig = config.tsConfigPath;
      this.sqlDialect = resolveDialectPlugin(config.dialect);
      this.noExternal = config.noExternal || [];
      this.queryTimeout = config.queryTimeout;
      this.updateSubscribers = [];

      // TODO: customisable
      this.searchPaths = ['**/**.ts', '**/*.js'];
      this.ignorePaths = ['node_modules']

      this.watchedTsProject = new WatchedTypeScriptProject({
         tsConfigFilePath: config.tsConfigPath,
         onUpdateComplete: this.onTsProjectUpdateComplete.bind(this),
         onUpdateStart: this.onTsProjectUpdateStart.bind(this)
      });
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

   public subscribeToUpdates(f: UpdateSubscriber) {
      this.updateSubscribers.push(f);
   }

   public unsubscribeToUpdates(f: UpdateSubscriber) {
      const indexOf = this.updateSubscribers.indexOf(f);
      if (indexOf === -1) return;

      this.updateSubscribers.splice(indexOf);
   }

   private async onTsProjectUpdateStart() {
      // alert subscribers
      for (const subscriber of this.updateSubscribers) {
         subscriber({type: 'LOADING'})
      }
   }
   private async onTsProjectUpdateComplete() {
      for (const subscriber of this.updateSubscribers) {
         subscriber({type: 'READY'})
      }
   }

   private async loadModule(modulePath: string) {
      const vite = await this.getVite();
      return vite.ssrLoadModule(modulePath);
   }

   async getQuery({modulePath, functionName, functionParams }: {
      modulePath: string;
      functionName: string;
      functionParams?: any[]
   }) {
      const tsProject = await this.watchedTsProject.safelyGetProject();

      console.log('Used params:', functionParams);

      const query = await getQueryService({
         modulePath,
         functionName,
         functionParams,
         tsProject,
         sqlDialect: this.sqlDialect,
         loadModule: this.loadModule.bind(this),
         timeout: this.queryTimeout
      });

      return {
         name: query.name,
         description: query.description,
         sql: query.sql,
         interpolatedSql: query.interpolatedSql,
         paramsUsed: query.paramsUsed,
      }
   }

   async listQueryModules() {
      const tsProject = await this.watchedTsProject.safelyGetProject();
      const modules = await listQueryModulesServicePoc({
         tsProject,
         cwd: this.projectRoot
      })

      return {
         modules
      };
   }

   async listQueries({ modulePath }: { modulePath: string}) {
      const tsProject = await this.watchedTsProject.safelyGetProject();

      const results: string[] = await listQueriesService({
         modulePath,
         tsProject
      });

      return results;
   }

}