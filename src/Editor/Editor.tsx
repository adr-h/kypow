import { useRef } from 'react';

import MonacoEditor from '@monaco-editor/react';

export function Editor() {
  const editorRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function showValue() {
    alert((editorRef.current as any)?.getValue());
  }

  return (
    <>
      <button onClick={showValue}>Show value</button>
      <MonacoEditor
        height="90vh"
        defaultLanguage="javascript"
        defaultValue="// some comment"
        onMount={handleEditorDidMount}
      />
    </>
  );
}