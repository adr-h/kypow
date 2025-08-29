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
import { createPlainVite } from "./createPlainVite";
import { runQueryService } from "./services/runQuery";
import { searchModulesService } from "./services/searchModules";

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

   private _viteWithKyselyImposter?: ViteDevServer;
   private _plainVite?: ViteDevServer;

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

   private async getPlainVite() {
      if (!this._plainVite) {
         this._plainVite = await createPlainVite({projectRoot: this.projectRoot,})
      }

      return this._plainVite;
   }

   private async getViteWithKyselyImposter() {
      if (!this._viteWithKyselyImposter) {
         // const watcher = createWatcher({ searchPaths, ignorePaths, cwd: projectRoot });
         this._viteWithKyselyImposter = await createViteWithKyselyImposter({
            projectRoot: this.projectRoot,
            kypowRoot: this.kypowRoot,
            noExternal: this.noExternal,
            kyselyImposterModule: KyselyImposterPath,
         })
      }

      return this._viteWithKyselyImposter;
   }

   public subscribeToUpdates(f: UpdateSubscriber) {
      this.updateSubscribers.push(f);
   }

   public unsubscribeToUpdates(f: UpdateSubscriber) {
      const indexOf = this.updateSubscribers.indexOf(f);
      if (indexOf === -1) return;

      this.updateSubscribers.splice(indexOf, 1);
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

   async getQuery({modulePath, functionName, functionParams }: {
      modulePath: string;
      functionName: string;
      functionParams?: any[]
   }) {
      const tsProject = await this.watchedTsProject.safelyGetProject();
      const vite = await this.getViteWithKyselyImposter();

      const query = await getQueryService({
         modulePath,
         functionName,
         functionParams,
         tsProject,
         sqlDialect: this.sqlDialect,
         vite,
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

   async executeQuery({modulePath, functionName, functionParams }: {
      modulePath: string;
      functionName: string;
      functionParams?: any[]
   }) {
      const vite = await this.getPlainVite();
      const { result } =  await runQueryService({ modulePath, functionName, functionParams, vite });

      return { result };
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

   async searchModules({ searchInput }: { searchInput: string }) {
      const tsProject = await this.watchedTsProject.safelyGetProject();
      const modules = await searchModulesService({ tsProject, cwd: this.projectRoot, searchInput });

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