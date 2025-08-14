import type { DialectPlugin } from "../lib/sql";
import { resolveDialectPlugin } from "../lib/sql/resolveDialectPlugin";
import type { Config } from "./Config";
import { createViteWithKyselyImposter } from "./createViteWithKyselyImposter";
import { KyselyImposterPath } from './services/getQuery/fake-kysely';
import type { ViteDevServer } from "vite";
import { getQueryService } from "./services/getQuery";
import { listQueryModulesService, listQueryModulesServicePoc } from "./services/listQueryModules";
import { fileURLToPath } from "url";
import { listQueriesService } from "./services/listQueries";
import { WatchedTypeScriptProject } from "../lib/type-system/WatchedTypeScriptProject";

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
   queryTimeout: number;

   private _vite?: ViteDevServer;

   private watchedTsProject: WatchedTypeScriptProject;

   constructor(config: Config) {
      this.projectRoot = config.projectRoot;
      this.kypowRoot = kypowRoot;
      this.tsconfig = config.tsConfigPath;
      this.sqlDialect = resolveDialectPlugin(config.dialect);
      this.noExternal = config.noExternal || [];
      this.queryTimeout = config.queryTimeout;

      // TODO: customisable
      this.searchPaths = ['**/**.ts', '**/*.js'];
      this.ignorePaths = ['node_modules']

      this.watchedTsProject = new WatchedTypeScriptProject({
         tsConfigFilePath: config.tsConfigPath
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
         timeout: this.queryTimeout
      });

      return {
         name: query.name,
         description: query.description,
         params: query.params,
         sql: query.sql,
         sampleSql: query.sampleSql,
      }
   }

   async listQueryModules() {
      const tsProject = await this.watchedTsProject.safelyGetProject();
      const modules = await listQueryModulesServicePoc({
         tsProject
      })

      return {
         modules: Object.keys(modules)
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