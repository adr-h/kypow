// TODO: wip poc to try to list "query modules" using the Typescript AST instead of grepping for a JSDoc tag
// code will be a mess. will clean up later
import path from "node:path";
import { Node, Type, type Project } from "ts-morph";

type Params = {
   tsProject: Project,
   cwd?: string;
}
export async function listQueryModulesService({ tsProject, cwd }: Params) {
   const sources = tsProject.getSourceFiles();
   const relevantModules: Record<string, string[]> = {};

   for (const source of sources) {
      const functions = source.getFunctions();

      for (const f of functions) {
         // if the function isn't even exported, quit
         if (!f.isExported()) continue;

         f.forEachDescendant((node) => {
            if (!isKyselyExecuteExpression(node)) return;

            const filePath = cwd ? path.relative(cwd, source.getFilePath()) : source.getFilePath();
            if (!relevantModules[filePath]) {
               relevantModules[filePath] = [];
            }

            relevantModules[filePath].push(f.getName()!);
         })
      }
   }

   const modulesList = Object.entries(relevantModules)
      .map(([module, queries]) => ({
         modulePath: module,
         queries
      }))
      .sort((first, second) => {
         return first.modulePath > second.modulePath ? 1 : -1
      })

   return modulesList;
}

const KYSELY_EXECUTE_FUNCTIONS = [
   'execute', 'executeTakeFirst', 'executeTakeFirstOrThrow'
]
function isKyselyExecuteExpression(node: Node) {
   if (!Node.isCallExpression(node)) return false;

   const expr = node.getExpression();
   if (!Node.isPropertyAccessExpression(expr)) return false;

   const isExecuteExpression = KYSELY_EXECUTE_FUNCTIONS.includes(expr.getName());
   if (!isExecuteExpression) return false;

   const executorType = expr.getExpression().getType();
   return isKyselyType(executorType);
}


const KYSLEY_QUERY_BUILDERS = [
   "SelectQueryBuilder",
   "InsertQueryBuilder",
   "UpdateQueryBuilder",
   "DeleteQueryBuilder",
   "QueryCreator"
];
function isKyselyType(type: Type): boolean {
   // Handle generic instantiations: unwrap the target type
   const targetType = type.getTargetType() ?? type;
   const symbol = targetType.getSymbol();
   if (!symbol) return false;

   const name = symbol.getName();
   if (KYSLEY_QUERY_BUILDERS.includes(name)) return true;

   // Check base types in case of subclassing
   for (const base of targetType.getBaseTypes()) {
      if (isKyselyType(base)) return true;
   }

   return false;
}