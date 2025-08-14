// wip Poc to try to list "query modules" using the Typescript AST instead of grepping for a JSDoc tag
// code will be a mess. will clean up later
import { Node, Type, type Expression, type Project } from "ts-morph";

type Params = {
   tsProject: Project
}
export async function listQueryModulesService({ tsProject }: Params) {
   const sources = tsProject.getSourceFiles();
   const relevantModules: Record<string, string[]> = {};

   for (const source of sources) {
      const functions = source.getFunctions();

      for (const f of functions) {
         // if the function isn't even exported, quit
         if (!f.isExported()) continue;

         f.forEachDescendant((node) => {
            if (!Node.isCallExpression(node)) return;

            const expr = node.getExpression();

            // Look for .execute()
            if (
               Node.isPropertyAccessExpression(expr)
               && ['execute', 'executeTakeFirst', 'executeTakeFirstOrThrow'].includes(expr.getName())
            ) {
               const receiver = expr.getExpression();
               const receiverType = receiver.getType();

               if (isKyselyRelevant(receiverType)) {
                  // console.log("Found:", node.getText());
                  const filePath = source.getFilePath();

                  relevantModules[filePath] = relevantModules[filePath] ? [
                     ...relevantModules[filePath],
                     f.getName() || ''
                  ] : [f.getName() || '']
               }
            }
         })
      }
   }

   return relevantModules;
}


const KYSLEY_QUERY_BUILDERS = [
  "SelectQueryBuilder",
  "InsertQueryBuilder",
  "UpdateQueryBuilder",
  "DeleteQueryBuilder",
  "QueryCreator"
];
export function isKyselyRelevant(type: Type): boolean {
   // Handle generic instantiations: unwrap the target type
   const targetType = type.getTargetType() ?? type;
   const symbol = targetType.getSymbol();
   if (!symbol) return false;

   const name = symbol.getName();
   if (KYSLEY_QUERY_BUILDERS.includes(name)) return true;

   // Check base types in case of subclassing
   for (const base of targetType.getBaseTypes()) {
      if (isKyselyRelevant(base)) return true;
   }

   return false;
}