import { Box, Paper } from "@mui/material"
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { MutableRefObject } from "react";
import { EditorView } from "codemirror";
import { EditorState } from "@codemirror/state";

interface EditorProps {
  darkMode: boolean;
  tasksInputValue: string;
  tasksInputChange: (value: string) => void;
  editor: MutableRefObject<ReactCodeMirrorRef | null>;
  setTasksInputValue: (value: string) => void;
}

function Editor({darkMode, tasksInputValue, tasksInputChange, editor, setTasksInputValue}: EditorProps) {
  function handleCreateEditor(view: EditorView, state: EditorState) {
    view.focus();
    setTasksInputValue(localStorage.getItem('tasks') ?? '');
    view.dispatch({ selection: { anchor: state.doc.length, head: state.doc.length } })
  }

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <Paper variant="outlined" sx={{ p: 0, width: "100%", display: "inline-block" }}>
        <CodeMirror
          basicSetup={{ lineNumbers: false }}
          ref={editor}
          value={tasksInputValue}
          onCreateEditor={handleCreateEditor}
          height="52vh"
          placeholder="Enter tasks here..."
          style={{ width: "100%", fontSize: "18px" }}
          theme={darkMode ? 'dark' : 'light'}
          extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
          onChange={tasksInputChange}
        />
      </Paper>
    </Box>
  )
}

export default Editor