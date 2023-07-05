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
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

interface BodyProps {
  toggleDarkMode: () => void;
  darkMode: boolean;
}

function Body({ toggleDarkMode, darkMode }: BodyProps) {
  const intervalIdRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const currentTaskIndexRef = useRef<number>(0);
  currentTaskIndexRef.current = currentTaskIndex;
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const timeRemainingRef = useRef<number>(0);
  timeRemainingRef.current = timeRemaining;
  const tasksRef = useRef<Task[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  tasksRef.current = tasks;
  const [tasksInputValue, setTasksInputValue] = useState<string>('');
  const tasksInputRef = useRef<string>();
  tasksInputRef.current = tasksInputValue;
  const tempInputRef = useRef<string>();
  const editor = useRef<ReactCodeMirrorRef>({});
  const [inProgress, setInProgress] = useState<boolean>(false);
  const inProgressRef = useRef<boolean>(false);
  inProgressRef.current = inProgress;
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

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
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      console.log("before unload called")
      localStorage.setItem('tasks', tasksInputRef.current ?? '');
    }

    document.addEventListener('keydown', handleKeyDown);
    window.onbeforeunload = handleBeforeUnload;

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const startInterval = useCallback(async () => {
    if (!inProgressRef.current) {
      return;
    }

    if (timeRemainingRef.current <= 0) {
      setTimeRemaining(tasksRef.current[0].time);
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
    }, 250);

    intervalIdRef.current = newIntervalId;

    return () => {
      clearInterval(newIntervalId);
    };
  }, []);

  useEffect(() => {
    startInterval();
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

  function tenPercentBack() {
    if (!inProgressRef.current) {
      if (tasks.length === 0) {
        return;
      }
      setInProgress(true);
      inProgressRef.current = true;
      setIsPlaying(true);
      let time = tasks[tasks.length - 1].time;
      setCurrentTaskIndex(tasks.length - 1);
      setTimeRemaining(Math.ceil(time * 0.1));
      timeRemainingRef.current = Math.ceil(time * 0.1);

      setTasksInputValue(tempInputRef.current ?? '');
      startInterval();

      return;
    }

    const currentTask = tasks[currentTaskIndex];
    const timeIncrement = Math.ceil(currentTask.time * 0.1);
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
    setTasksInputValue('');
    setTimeRemaining(0);
    setCurrentTaskIndex(0);
    editor.current.view?.focus();
    isPlayingRef.current = false;
    setIsPlaying(false);
    setInProgress(false);

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
    intervalIdRef.current = null;
  }

  function resetCurrentTaskTime() {
    if (!inProgress) {
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

    let newTasksInputValue = tasksInputRef.current?.split('\n')
      .map(task => task.trim().replace(/^- \[ \] /, '').replace(/^- \[[xX]\] /, '').replace(/^- /, "")).join('\n') ?? '';

    tempInputRef.current = newTasksInputValue;

    setTasksInputValue(newTasksInputValue);

    isPlayingRef.current = true;
    setInProgress(true);
    setIsPlaying(true);
    setTasks(parsedTasks);
  }

  function skipNext() {
    if (!inProgressRef.current) {
      return;
    }
    setCurrentTaskIndex(prevIndex => prevIndex + 1);
    if (currentTaskIndexRef.current < tasksRef.current.length - 1) {
      new Notification(`"${tasksRef.current[currentTaskIndexRef.current].name}" completed, "${tasksRef.current[currentTaskIndex + 1].name}" started for ${tasksRef.current[currentTaskIndex + 1].time / 60} minute${tasksRef.current[currentTaskIndex + 1].time / 60 === 1 ? '' : 's'}`)
      setSnackbarMessage(`"${tasksRef.current[currentTaskIndexRef.current].name}" completed, "${tasksRef.current[currentTaskIndex + 1].name}" started for ${tasksRef.current[currentTaskIndex + 1].time / 60} minute${tasksRef.current[currentTaskIndex + 1].time / 60 === 1 ? '' : 's'}`);
      setSnackbarOpen(true);
      setTimeRemaining(tasksRef.current[currentTaskIndexRef.current + 1].time);
    } else {
      new Notification("All tasks completed!")
      setSnackbarMessage("All tasks completed!");
      setSnackbarOpen(true);
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
    if (isPlayingRef.current) {
      pauseTimer();
    }
    if ((value ?? '').trim() === '') {
      clearAll();
    }

    if (value.length === 1) {
      if ((tasksInputRef.current ?? "").length > 1) {
        clearAll();
      }
    }

    setTasksInputValue(value);
    tasksInputRef.current = value;
  }

  function handleCreateEditor(view: EditorView, state: EditorState) {
    view.focus();
    setTasksInputValue(localStorage.getItem('tasks') ?? '');
    view.dispatch({ selection: { anchor: state.doc.length, head: state.doc.length } })
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', flexDirection: 'column' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h1" gutterBottom sx={{ mb: -1, fontWeight: 'bold', mt: -2, fontSize: '120px' }}>
          {timeRemaining > 0 ? Math.floor(timeRemaining / 60).toString().padStart(2, '0') : '00'}:{timeRemaining > 0 ? (timeRemaining % 60).toString().padStart(2, '0') : '00'}
        </Typography>
        <Typography variant="h3" gutterBottom sx={{ mb: 2 }}>
          {inProgress ? (
            tasks[currentTaskIndex]?.index
              ? `${tasks[currentTaskIndex].name} (${tasks[currentTaskIndex].index})`
              : tasks[currentTaskIndex]?.name || 'Task Timer'
          ) : 'Task Timer'}
        </Typography>
      </Box>
      <Box sx={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <Paper variant="outlined" sx={{ p: 0, width: "100%", display: "inline-block", borderRadius: 0 }}>
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
      <Icons {...{ clearAll, resetCurrentTaskTime, toggleDarkMode, darkMode, playTimer, pauseTimer, skipNext, skipPrevious, tenPercentBack, isPlaying }} />
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <MuiAlert onClose={() => setSnackbarOpen(false)} severity="success" elevation={6} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default Body;
