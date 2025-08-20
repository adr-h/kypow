import type { Project } from "ts-morph"

type Props = {
   tsProject: Project;
   sourceFile: string;
   functionName: string;
}
export function getFunctionJsDocs({ tsProject, sourceFile, functionName }: Props) {
   const file = tsProject.getSourceFile(sourceFile);
   if (!file) throw new Error(`Source file ${sourceFile} not found.`);

   const fn = file.getFunction(functionName);
   if (!fn) throw new Error(`Function "${functionName}" not found in file: ${sourceFile}`);

   return fn.getJsDocs().map(doc => doc.getFullText()).join('\n');
}