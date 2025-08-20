// sampleArgs.ts
import {
   Project,
   Node,
   Type,
   TypeChecker,
   TypeFormatFlags,
} from "ts-morph";


type Props = {
   tsProject: Project;
   sourceFile: string;
   functionName: string;
}

/**
 * Generate sample arguments for a function within a source file.
 */
export function generateSampleArgs(
   { tsProject, sourceFile, functionName }: Props
): any[] {
   const options = tsProject.compilerOptions.get();
   if (!options.strictNullChecks) {
      console.error('Unstrict null checks detected; this might cause issues with optional recursive properties');
   }

   const file = tsProject.getSourceFile(sourceFile);
   if (!file) throw new Error(`Source file ${sourceFile} not found.`);

   const fn = file.getFunction(functionName);
   if (!fn) throw new Error(`Function "${functionName}" not found in file: ${sourceFile}`);

   const checker = tsProject.getTypeChecker();
   const ctx = new Context(checker);
   const params = fn.getParameters() as Node[]; // ParameterDeclaration[]
   const args: any[] = [];

   for (const param of params) {
      const paramType: Type = param.getType();

      args.push(sampleForType(paramType, ctx));
   }

   return args;
}

// Error class so we can detect when excessive recursion occurs
class RecursiveTypeError extends Error {
   constructor(message: string) {
      super(message);
      this.name = "RecursiveTypeError";
   }
}

/** stack context */
class Context {
   readonly checker: TypeChecker;
   readonly stack: string[];

   constructor(checker: TypeChecker, stack?: string[]) {
      this.checker = checker;
      this.stack = stack ? [...stack] : [];
   }

   /** Enter a type; throws RecursiveTypeError if it would cause a cycle. */
   enter(t: Type): Context {
      const key = stableTypeKey(t);
      if (this.isPastRecursiveLimit(t)) {
         throw new RecursiveTypeError(`Infinite recursive type detected: ${key}; stack: ${this.stack}`);
      }

      const next = new Context(
         this.checker,
         [...this.stack, key]
      );

      return next;
   }

   isPastRecursiveLimit(t: Type): boolean {
      const key = stableTypeKey(t);
      return this.stack.filter(e => e === key).length > 3;
   }
}

/* ----------------------------- Utilities ----------------------------- */

function stableTypeKey(type: Type): string {
   // stable textual key for a type (tries to avoid truncation)
   try {
      return type.getText(undefined, TypeFormatFlags.NoTruncation | TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
   } catch {
      // fallback
      return type.getText();
   }
}

function getTypeName(type: Type): string | undefined {
   const sym = type.getSymbol() ?? type.getAliasSymbol();
   return sym?.getName();
}

function getArrayElementType(type: Type): Type | undefined {
   const arrEl = type.getArrayElementType();
   if (arrEl) return arrEl;

   const name = getTypeName(type);
   if (name === "Array") {
      const [T] = type.getTypeArguments();
      return T;
   }

   return undefined;
}

function getTupleElementTypes(type: Type): Type[] {
   return type.getTupleElements();
}

function isDateType(t: Type): boolean {
   const name = getTypeName(t);
   return name === "Date";
}

function hasCallSignatures(t: Type): boolean {
   const sigs = t.getCallSignatures();
   return Array.isArray(sigs) && sigs.length > 0;
}

function isObjectLike(t: Type): boolean {
   return t.isObject() || (t.getProperties().length > 0) || !!t.getStringIndexType();
}

function isBigInt(t: Type): boolean {
   const txt = t.getText();
   return txt === "bigint";
}

function isBooleanLiteralText(t: Type): boolean {
   const txt = t.getText();
   return txt === "true" || txt === "false";
}

function stripQuotes(s: string): string {
   return s.replaceAll(`"`, '').replaceAll(`'`, '');
}


/**
 * If `type` is a type parameter T, try to resolve to constraint/default.
 * Returns a resolved Type or null if none.
 */
function resolveTypeParameter(type: Type): Type | null {
   if (!type.isTypeParameter()) return null;

   // constraint (T extends U)
   const constraint = type.getConstraint();
   if (constraint) return (constraint.getApparentType() ?? constraint);

   // default (T = D) (ts-morph exposes getDefault on some versions)
   const def = type.getDefault();
   if (def) return (def.getApparentType() ?? def);

   return null;
}


/**
 * Generate a sample value for a given Type.
 * - ctx: GenCtx (contains checker + active stack)
 */
function sampleForType(type: Type, ctx: Context): any {
   const scope = ctx.enter(type);

   // If this is a type parameter, resolve via constraint/default and re-run
   const resolvedTP = resolveTypeParameter(type);
   if (resolvedTP) {
      return sampleForType(resolvedTP, scope);
   }

   // Literal types
   if (type.isStringLiteral()) {
      // getText yields quoted literal like "'up'" or '"up"'
      return stripQuotes(type.getText());
   }
   if (type.isNumberLiteral()) {
      return Number(type.getText());
   }
   if (type.isBigIntLiteral()) {
      return BigInt(type.getText());
   }
   if (isBooleanLiteralText(type)) return /true/.test(type.getText());

   // Primitives
   if (type.isString()) return "sample";
   if (type.isNumber()) return 1;
   if (isBigInt(type)) return BigInt(1);
   if (type.isBoolean()) return true;
   if (type.isUndefined()) return undefined;
   if (type.isNull()) return null;

   // Function types -> stub
   if (hasCallSignatures(type)) {
      return (..._args: any[]) => { /* noop */ };
   }

   // Date handling
   if (isDateType(type)) return new Date("2020-01-01T00:00:00Z");

   // tuples
   if (type.isTuple && type.isTuple()) {
      const elts = getTupleElementTypes(type);
      return elts.map(t => sampleForType(t, scope));
   }

   // arrays
   const arrElement = getArrayElementType(type);
   if (arrElement) {
      try {
         return [sampleForType(arrElement, scope)];
      } catch (ex) {
         if (ex instanceof RecursiveTypeError) {
            // when an array has a recursive error, just return an empty array
            return [];
         }
      }
   }

   // Map/Set
   const typeName = getTypeName(type);
   if (typeName === "Map") {
      const [K, V] = type.getTypeArguments();
      const k = sampleForType(K, scope);
      const v = sampleForType(V, scope);
      return new Map([[k, v]]);
   }
   if (typeName === "Set") {
      const [T] = type.getTypeArguments();
      const v = sampleForType(T, scope);
      return new Set([v]);
   }

   // enums
   if (type.isEnum() || type.isEnumLiteral()) {
      const sym = type.getSymbol();
      if (sym) {
         const decls = sym.getDeclarations();
         for (const decl of decls) {
            if (Node.isEnumDeclaration(decl)) {
               const mems = decl.getMembers();
               if (mems.length > 0) {
                  return mems[0].getValue();
               }
            }
         }
      }
      // fallback
      return 0;
   }

   // Unions & Intersections
   if (type.isUnion()) {
      const branches = type.getUnionTypes();

      // try non-null/undefined branches first for nicer outputs
      const ordered = [
         ...branches.filter(t => !t.isNull() && !t.isUndefined()),
         ...branches.filter(t => t.isNull() || t.isUndefined()),
      ];

      for (const branch of ordered) {
         try {
            return sampleForType(branch, scope);
         } catch (e) {
            if (e instanceof RecursiveTypeError) {
               // skip recursive branch and try next branch of union
               continue;
            }
            throw e;
         }
      }
      // if all branches skipped due to recursion
      throw new RecursiveTypeError(`All union branches recursive: ${stableTypeKey(type)}`);
   }

   if (type.isIntersection()) {
      const parts = type.getIntersectionTypes();
      let out: any = {};
      for (const part of parts) {
         const piece = sampleForType(part, scope);
         out = { ...out, ...piece };
      }
      return out;
   }

   // Index signatures — e.g. Record<K,V> expands to an index signature in many cases
   const stringIndex = type.getStringIndexType();
   if (stringIndex) {
      return { key: sampleForType(stringIndex, scope) };
   }
   const numberIndex = type.getNumberIndexType();
   if (numberIndex) {
      return { 0: sampleForType(numberIndex, scope) };
   }

   // Object-ish (interfaces / type aliases / instantiated generic shapes)
   if (isObjectLike(type)) {
      const out: any = {};
      const props = type.getProperties();


      for (const prop of props) {
         const propName = prop.getName();
         const decl = (prop.getDeclarations()[0]) ?? (prop.getValueDeclaration());
         const propType = ctx.checker.getTypeOfSymbolAtLocation(prop, decl);

         out[propName] = sampleForType(propType, scope);
      }

      return out;
   }

   // Any/Unknown fallback
   if (type.isAny() || type.isUnknown()) return null;

   // final fallback
   throw new Error('Unsupported type: '+ type.getText());
}


