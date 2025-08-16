// TODO: wip poc to try to list "query modules" using the Typescript AST instead of grepping for a JSDoc tag
// code will be a mess. will clean up later
import path from "node:path";
import { Node, SyntaxKind, Type, type ExportedDeclarations, type Project } from "ts-morph";

type Params = {
   tsProject: Project,
   cwd?: string;
}
export async function listQueryModulesService({ tsProject, cwd }: Params) {
   const sources = tsProject.getSourceFiles();
   const relevantModules: Record<string, string[]> = {};

   // for all source files
   for (const source of sources) {
      const allExports = source.getExportedDeclarations()

      // and for all exports from source files
      for (const [exportName, declarations] of allExports) {
         for (const f of declarations) {
            //if the exported member is not a function, quit
            if (!isExportedFunction(f)) continue;

            // for each statement in a function ...
            f.forEachDescendant((node) => {
               // if it's not a Kysely query's execute(), quit
               if (!isKyselyExecuteExpression(node)) return;

               const filePath = cwd ? path.relative(cwd, source.getFilePath()) : source.getFilePath();
               if (!relevantModules[filePath]) relevantModules[filePath] = [];

               relevantModules[filePath].push(exportName)
            })
         }
      }
   }

   return relevantModules;
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

function isExportedFunction(decl: ExportedDeclarations): boolean {
   // Direct function declaration
   if (Node.isFunctionDeclaration(decl)) {
      return true;
   }

   // Variable declaration assigned to a function/arrow function
   if (Node.isVariableDeclaration(decl)) {
      const init = decl.getInitializer();
      if (!init) return false;

      const initializerKind = init.getKind();
      return (
         initializerKind === SyntaxKind.FunctionExpression ||
         initializerKind === SyntaxKind.ArrowFunction
      );
   }

   return false;
}