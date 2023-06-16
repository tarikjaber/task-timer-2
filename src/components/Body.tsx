import { useEffect, useState, useRef, useCallback } from 'react';
import { Typography, Box } from '@mui/material';
import Icons from './Icons';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { Paper } from '@mui/material';
import { Task, parseTasks } from '../utils';
import { EditorView } from 'codemirror';
import { EditorState } from '@codemirror/state';

interface BodyProps {
  toggleDarkMode: () => void;
  darkMode: boolean;
}

function Body({ toggleDarkMode, darkMode }: BodyProps) {
  const intervalIdRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksInputValue, setTasksInputValue] = useState<string>('');
  const tasksInputRef = useRef<string>();
  tasksInputRef.current = tasksInputValue;
  const tasksRef = useRef<Task[]>([]);
  tasksRef.current = tasks;
  const editor = useRef<ReactCodeMirrorRef>({});
  const notesEditor = useRef<EditorView | null>(null);

  function togglePlayPause() {
    if (isPlayingRef.current) {
      pauseTimer();
    } else {
      playTimer();
    }
  }

  useEffect(() => {
    setTasksInputValue(localStorage.getItem('tasks') || '');

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.shiftKey && event.key === 'Enter') {
        event.preventDefault();
        togglePlayPause();
      } else if (event.ctrlKey && event.key === "p") {
        event.preventDefault();
        notesEditor.current?.dispatch({
          changes: {from: 0, to: notesEditor.current.state?.doc.toString().length, insert:''}
        })
        notesEditor.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (tasks.length === 0) {
      return;
    }

    if (timeRemaining <= 0) {
      setTimeRemaining(tasks[0].time);
    }

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    isPlayingRef.current = true;
    setIsPlaying(true);

    const newIntervalId = window.setInterval(() => {
      setTimeRemaining(prevTimeRemaining => {
        const newTimeRemaining = prevTimeRemaining - 1;
        if (newTimeRemaining <= 0) {
          skipNext();
        }
        return newTimeRemaining;
      });
    }, 1000);

    intervalIdRef.current = newIntervalId;

    return () => {
      clearInterval(newIntervalId);
    };
  }, [tasks, currentTaskIndex]);

  useEffect(() => {
    if (isPlayingRef.current) {
      document.title = `${Math.floor(timeRemaining / 60)
        .toString()
        .padStart(2, '0')}:${(timeRemaining % 60)
        .toString()
        .padStart(2, '0')} - ${tasks[currentTaskIndex]?.name || 'Task Timer'}`;
    } else {
      document.title = 'Task Timer';
    }
  }, [isPlayingRef.current, timeRemaining, tasks, currentTaskIndex]);

  function tPercentBack() {
    if (tasks.length === 0) {
      return;
    }

    const currentTask = tasks[currentTaskIndex];
    const timeIncrement = Math.floor(currentTask.time * 0.1);
    const newTimeRemaining = timeRemaining + timeIncrement;

    // Check if the new time remaining exceeds the total task time
    const updatedTimeRemaining = Math.min(newTimeRemaining, currentTask.time);

    // Set the updated time remaining for the current task
    setTimeRemaining(updatedTimeRemaining);
  }

  function tenPercentBack() {
    if (tasks.length === 0) {
      return;
    }
  
    const currentTask = tasks[currentTaskIndex];
    const timeIncrement = Math.floor(currentTask.time * 0.1);
    const newTimeRemaining = timeRemaining + timeIncrement;
  
    if (newTimeRemaining <= currentTask.time || currentTaskIndex === 0) {
      // Set the updated time remaining for the current task
      setTimeRemaining(Math.min(newTimeRemaining, currentTask.time));
    } else {
      if (currentTaskIndex > 0) {
        // Calculate the overflow amount
        const overflowAmount = newTimeRemaining - currentTask.time;
        // Set the overflow amount as the new time remaining
        setTimeRemaining(overflowAmount);
        // Go to the previous task
        setCurrentTaskIndex(currentTaskIndex - 1);
      }
    }
  }
  

  function clearAll() {
    localStorage.removeItem('tasks');
    setCurrentTaskIndex(0);
    setTimeRemaining(0);
    editor.current.view?.focus();
    isPlayingRef.current = false;
    setIsPlaying(false);
    setTasks([]);

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
    intervalIdRef.current = null;
  }

  function resetCurrentTaskTime() {
    if (tasks.length === 0) {
      return;
    }

    setTimeRemaining(tasks[currentTaskIndex].time);
  }

  function pauseTimer() {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
  }

  function playTimer() {
    let currentTime = tasksRef.current[currentTaskIndex]?.time || 0;
    const parsedTasks = parseTasks(tasksInputRef.current ?? "");
    let nextTime = parsedTasks[currentTaskIndex]?.time || 0;

    if (currentTime !== nextTime) {
      setTimeRemaining(nextTime);
    }

    if (parsedTasks.length === 0) {
      return;
    }

    isPlayingRef.current = true;
    setIsPlaying(true);
    setTasks(parsedTasks);
  }

  function skipNext() {
    if (tasks.length === 0) {
      return;
    }
    if (currentTaskIndex < tasks.length - 1) {
      new Notification(`"${tasks[currentTaskIndex].name}" completed, "${tasks[currentTaskIndex + 1].name}" started for ${tasks[currentTaskIndex + 1].time / 60} minute${tasks[currentTaskIndex + 1].time / 60 === 1 ? '' : 's'}`)
      setTimeRemaining(tasks[currentTaskIndex + 1].time);
      setCurrentTaskIndex(prevIndex => prevIndex + 1);
    } else {
      new Notification("All tasks completed!")
      clearAll();
    }
  }

  function skipPrevious() {
    if (currentTaskIndex > 0) {
      setTimeRemaining(tasks[currentTaskIndex - 1].time);
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  }

  function tasksInputChange(value: string) {
    localStorage.setItem('tasks', value ?? '');
    setTasksInputValue(value);
    pauseTimer();
    if ((value ?? '').trim() === '') {
      clearAll();
    }
  }

  function notesInputChange(value: string) {
    localStorage.setItem('notes', value ?? '');
  }

  function handleCreateEditor(view: EditorView, state: EditorState) {
    view.focus();
    view.dispatch({selection: {anchor: state.doc.length, head: state.doc.length}})
  }

  function handleCreateNotesEditor(view: EditorView, state: EditorState) {
    notesEditor.current = view;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', flexDirection: 'column' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h1" gutterBottom sx={{ mb: -1, fontWeight: 'bold', mt: -2, fontSize: '120px' }}>
          {timeRemaining > 0 ? Math.floor(timeRemaining / 60).toString().padStart(2, '0') : '00'}:{timeRemaining > 0 ? (timeRemaining % 60).toString().padStart(2, '0') : '00'}
        </Typography>
        <Typography variant="h3" gutterBottom sx={{ mb: 2 }}>
          {tasks[currentTaskIndex]?.index ? `${tasks[currentTaskIndex].name} (${tasks[currentTaskIndex].index})` : tasks[currentTaskIndex]?.name || 'Task Timer'}
        </Typography>
      </Box>
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Box sx={{ width: "100%" }}>
          <Paper variant="outlined" sx={{ p: 0, width: "calc(50% - 10px)", display: "inline-block", borderRadius: 0 }}>
            <CodeMirror
              basicSetup={{lineNumbers: false}}
              ref={editor}
              onCreateEditor={handleCreateEditor}
              value={localStorage.getItem('tasks') ?? undefined}
              height="52vh"
              placeholder="Enter tasks here..."
              style={{ width: "100%", fontSize: "18px" }}
              theme={darkMode ? 'dark' : 'light'}
              extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
              onChange={tasksInputChange}
            />
          </Paper>
          <Paper variant="outlined" sx={{ p: 0, width: "calc(50% - 10px)", marginLeft: "20px", display: "inline-block", borderRadius: 0}}>
            <CodeMirror
              basicSetup={{lineNumbers: false}}
              value = {localStorage.getItem('notes') ?? undefined}
              placeholder="Enter notes here..."
              height="52vh"
              style={{ width: "100%", fontSize: "18px" }}
              onCreateEditor={handleCreateNotesEditor}
              theme={darkMode ? 'dark' : 'light'}
              extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
              onChange={notesInputChange}
            />
          </Paper>
        </Box>
      </Box>
      <Icons {...{ clearAll, resetCurrentTaskTime, toggleDarkMode, darkMode, playTimer, pauseTimer, skipNext, skipPrevious, tenPercentBack, isPlaying }} />
    </Box>
  );
}

export default Body;
