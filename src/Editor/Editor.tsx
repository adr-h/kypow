import { useEffect, useRef, useState } from 'react';


import MonacoEditor from '@monaco-editor/react';
import * as monaco from "monaco-editor";
import { registerKysely } from './registration/registerKysely';

type EditorInstance = ReturnType<typeof monaco.editor.create>;
type MonacoInstance = typeof monaco;

type EditorProps = {
   registerExtraLibs?: (m: MonacoInstance) => Promise<void>;
}


export function Editor(props: EditorProps) {
   const [editorInstance, setEditorInstance] = useState<EditorInstance>();
   const [monacoInstance, setMonacoInstsance] = useState<MonacoInstance>();

   const handleEditorDidMount = (editor: EditorInstance, monaco: MonacoInstance) => {
      setEditorInstance(editor);
      setMonacoInstsance(monaco);

      console.log('setting compiler options');
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
         allowSyntheticDefaultImports: true,
         baseUrl: "file:///",
         moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
         module: monaco.languages.typescript.ModuleKind.ESNext,
         target: monaco.languages.typescript.ScriptTarget.ESNext,
      });
      registerKysely(monaco);

      console.log('done setting compiler options');
   }

   const getExtraLibs = () => {
      if (!monacoInstance) {
         return;
      }

      console.log(monacoInstance.languages.typescript.typescriptDefaults.getExtraLibs())
   }

   useEffect(() => {
      if (!monacoInstance) {
         console.log('do nthing - not ready');
         return;
      }

      // write a module to do the really spicy stuff
      // monaco.languages.typescript.typescriptDefaults.addExtraLib()
   }, [monacoInstance])

   function showValue() {
      alert(editorInstance?.getValue());
   }



   return (
      <>
         <button onClick={getExtraLibs}>GetExtarlibs</button>
         <button onClick={showValue}>Show value</button>
         <MonacoEditor
            height="90vh"
            defaultPath='file:///_kypanel_main.ts'
            defaultLanguage="typescript"
            defaultValue="import * as f from 'fiz'"
            onMount={handleEditorDidMount}
         />
      </>
   );
}