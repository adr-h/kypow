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
               const rootExpr = getRootExpression(expr);
               const rootType = rootExpr.getType();

               if (isKyselyType(rootType)) {
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

function getRootExpression(expr: Expression) {
   let current = expr;
   // so we can start from "execute" in `db.selectFrom().where()...execute()` and walk back up to "db"
   while (Node.isPropertyAccessExpression(current) || Node.isCallExpression(current)) {
      if (Node.isCallExpression(current)) {
         current = current.getExpression();
      }
      if (Node.isPropertyAccessExpression(current)) {
         current = current.getExpression();
      }
   }
   return current;
}


function isKyselyType(type: Type): boolean {
   const symbol = type.getSymbol();
   if (!symbol) return false;

   // If it's a generic instantiation, get the target type
   const targetType = type.getTargetType() ?? type;

   // Directly named Kysely
   if (targetType.getSymbol()?.getName() === "Kysely") return true;

   // Check all base types (handles subclasses)
   for (const base of targetType.getBaseTypes()) {
      if (isKyselyType(base)) return true;
   }

   return false;
}