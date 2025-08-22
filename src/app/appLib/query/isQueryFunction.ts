import { FunctionDeclaration, Node, Type, type Project } from "ts-morph";

export function isQueryFunction(f: FunctionDeclaration) {
   let isQueryFunction = false;
   if (!f.isExported()) return isQueryFunction;

   f.forEachDescendant((node, traversal) => {
      if (isKyselyExecuteExpression(node)) {
         isQueryFunction = true;
         return traversal.stop()
      };
   })

   return isQueryFunction;
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