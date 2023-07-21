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
import MuiAlert from '@mui/material/Alert';

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
  const editor = useRef<ReactCodeMirrorRef>({});
  const [inProgress, setInProgress] = useState<boolean>(false);
  const inProgressRef = useRef<boolean>(false);
  inProgressRef.current = inProgress;
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const startTimeRef = useRef<number>(0);
  const [completedAllTasks, setCompletedAllTasks] = useState<boolean>(false);

  const playTimer = useCallback(() => {
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

    setTasksInputValue(newTasksInputValue);

    isPlayingRef.current = true;
    setInProgress(true);
    setIsPlaying(true);
    setTasks(parsedTasks);
  }, [currentTaskIndex]);

  const togglePlayPause = useCallback(() => {
    if (isPlayingRef.current) {
      pauseTimer();
    } else {
      playTimer();
    }
  }, [playTimer]);

  useEffect(() => {
    console.log("useeffect called here")
    const urlParams = new URLSearchParams(window.location.search);
    const tasks: string | null = urlParams.get('tasks');

    if (tasks) {
      setTasksInputValue(tasks);
      tasksInputRef.current = tasks;
      localStorage.setItem('tasks', tasks);
      playTimer();
    } else {
      setTasksInputValue(localStorage.getItem('tasks') || '');
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.shiftKey && event.key === 'Enter') {
        event.preventDefault();
        togglePlayPause();
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      localStorage.setItem('tasks', tasksInputRef.current ?? '');
    }

    document.addEventListener('keydown', handleKeyDown);
    window.onbeforeunload = handleBeforeUnload;

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const skipNext = useCallback(() => {
    console.log("skipnext called")
    if (!inProgressRef.current) {
      return;
    }

    const currentTaskIndex = currentTaskIndexRef.current;
    const tasks = tasksRef.current;
    const nextTaskIndex = currentTaskIndex + 1;

    setCurrentTaskIndex(prevIndex => prevIndex + 1);

    if (nextTaskIndex < tasks.length) {
      const currentTask = tasks[currentTaskIndex];
      const nextTask = tasks[nextTaskIndex];
      const minutes = nextTask.time / 60;
      const pluralSuffix = minutes === 1 ? '' : 's';
      const previousIndexText = currentTask.index ? ` (${currentTask.index})` : '';
      const nextIndexText = nextTask.index ? ` (${nextTask.index})` : '';
      const notificationMessage = `"${currentTask.name}${previousIndexText}" completed, "${nextTask.name}${nextIndexText}" started for ${minutes} minute${pluralSuffix}`;

      new Notification(notificationMessage);
      setSnackbarMessage(notificationMessage);
      setSnackbarOpen(true);
      setTimeRemaining(nextTask.time);
    } else {
      const notificationMessage = "All tasks completed!";

      new Notification(notificationMessage);
      setSnackbarMessage(notificationMessage);
      setSnackbarOpen(true);
      clearAll(false);
    }
  }, []);

  const startInterval = useCallback((resetTaskTime: boolean) => {
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

    if (resetTaskTime) {
      startTimeRef.current = Date.now(); // Store the start time
    } else {
      startTimeRef.current = Date.now() - (tasksRef.current[currentTaskIndexRef.current].time - timeRemainingRef.current) * 1000;
    }

    const newIntervalId = window.setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newTimeRemaining = tasksRef.current[currentTaskIndexRef.current]?.time - elapsedTime;

      setTimeRemaining(prevTimeRemaining => {
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
  }, [skipNext]);

  useEffect(() => {
    startInterval(false);
  }, [tasks, currentTaskIndex, startInterval]);

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
  }, [timeRemaining, tasks, currentTaskIndex]);

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
      currentTaskIndexRef.current = tasks.length - 1;
      setTimeRemaining(Math.ceil(time * 0.1));
      timeRemainingRef.current = Math.ceil(time * 0.1);

      startInterval(false);

      return;
    }

    const currentTask = tasks[currentTaskIndex];
    const timeIncrement = Math.ceil(currentTask.time * 0.1);
    const newTimeRemaining = timeRemaining + timeIncrement;

    if (newTimeRemaining <= currentTask.time || currentTaskIndex === 0) {
      // Set the updated time remaining for the current task
      setTimeRemaining(Math.min(newTimeRemaining, currentTask.time));
      timeRemainingRef.current = Math.min(newTimeRemaining, currentTask.time);
    } else {
      if (currentTaskIndex > 0) {
        // Calculate the overflow amount
        const overflowAmount = newTimeRemaining - currentTask.time;
        // Set the overflow amount as the new time remaining
        setTimeRemaining(overflowAmount);
        timeRemainingRef.current = overflowAmount;
        // Go to the previous task
        setCurrentTaskIndex(currentTaskIndex - 1);
      }
    }
    startInterval(false);
  }

  function clearAll(clearInput: boolean) {
    if (clearInput) {
      setTasksInputValue('');
    }
    setInProgress(false);
    inProgressRef.current = false;
    editor.current.view?.focus();
    isPlayingRef.current = false;
    setIsPlaying(false);
    setInProgress(false);
    setTimeRemaining(0);
    timeRemainingRef.current = 0;

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
    startInterval(true);
  }

  function pauseTimer() {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
  }

  useEffect(() => {
    if (currentTaskIndex >= tasks.length && tasks.length > 0) {
      setCompletedAllTasks(true);
    } else {
      setCompletedAllTasks(false);
    }
  }, [currentTaskIndex, tasks]);

  function skipPrevious() {
    if (currentTaskIndex > 0) {
      setTimeRemaining(tasks[currentTaskIndex - 1].time);
      timeRemainingRef.current = tasks[currentTaskIndex - 1].time;
      setCurrentTaskIndex(currentTaskIndex - 1);
      currentTaskIndexRef.current = currentTaskIndex - 1;
      setInProgress(true);
      inProgressRef.current = true;
      startInterval(true);
    }
  }

  function tasksInputChange(value: string) {
    if (isPlayingRef.current) {
      pauseTimer();
    }
    if ((value ?? '').trim() === '') {
      clearAll(true);
    }

    if (value.length === 1) {
      if ((tasksInputRef.current ?? "").length > 1) {
        setInProgress(false);
        inProgressRef.current = false;
        editor.current.view?.focus();
        isPlayingRef.current = false;
        setIsPlaying(false);
        setInProgress(false);
        setTimeRemaining(10 * 60);
        timeRemainingRef.current = 10 * 60;
        setCurrentTaskIndex(0);
        currentTaskIndexRef.current = 0;

        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
        intervalIdRef.current = null;
      }
    }

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
        {completedAllTasks ?
          <Typography variant="h3" color="success.main" sx={{ mb: 2 }}>
            Completed All Tasks
          </Typography>
          :
          <Typography variant="h3" gutterBottom sx={{ mb: 2, p: "0 20px" }} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100vw', overflowWrap: 'break-word' }}>
            {inProgress ? (
              tasks[currentTaskIndex]?.index
                ? `${tasks[currentTaskIndex].name} (${tasks[currentTaskIndex].index})`
                : tasks[currentTaskIndex]?.name || 'Task Timer'
            ) : 'Task Timer'}
          </Typography>
        }
      </Box>
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
      <Icons {...{ clearAll, resetCurrentTaskTime, toggleDarkMode, darkMode, playTimer, pauseTimer, skipNext, skipPrevious, tenPercentBack, isPlaying }} />
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <MuiAlert onClose={() => setSnackbarOpen(false)} severity="success" elevation={6} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
      </Box>
  );
}

export default Body;
