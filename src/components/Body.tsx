import { useEffect, useState, useRef, useCallback } from 'react';
import { Typography, Box } from '@mui/material';
import Icons from './Icons';
import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { parseTasks } from '../utils';
import { Task } from '../utils/types';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Editor from './Editor';
import { useSnackbar } from '../hooks/useSnackbar';

interface BodyProps {
  toggleDarkMode: () => void;
  darkMode: boolean;
}

function Body({ toggleDarkMode, darkMode }: BodyProps) {
  const intervalIdRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);
  isPlayingRef.current = isPlaying;
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
  const [inProgress, setInProgress] = useState<boolean>(false);
  const inProgressRef = useRef<boolean>(false);
  inProgressRef.current = inProgress;
  const startTimeRef = useRef<number>(0);
  const [completedAllTasks, setCompletedAllTasks] = useState<boolean>(false);
  const editor = useRef<ReactCodeMirrorRef>({});
  const { snackbarOpen, snackbarMessage, setSnackbarOpen, setSnackbarMessage } = useSnackbar();

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
  import { useEffect, useState, useRef, useCallback } from 'react';
  import { Task } from '../utils/types';
  import { parseTasks } from '../utils';
  
  export function useTaskTimer(initialValue: string) {
    const intervalIdRef = useRef<number | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const isPlayingRef = useRef<boolean>(false);
    isPlayingRef.current = isPlaying;
    const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
    const currentTaskIndexRef = useRef<number>(0);
    currentTaskIndexRef.current = currentTaskIndex;
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const timeRemainingRef = useRef<number>(0);
    timeRemainingRef.current = timeRemaining;
    const tasksRef = useRef<Task[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    tasksRef.current = tasks;
    const [tasksInputValue, setTasksInputValue] = useState<string>(initialValue);
    const tasksInputRef = useRef<string>();
    tasksInputRef.current = tasksInputValue;
    const [inProgress, setInProgress] = useState<boolean>(false);
    const inProgressRef = useRef<boolean>(false);
    inProgressRef.current = inProgress;
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
  
      setInProgress(true);
      setIsPlaying(true);
      setTasks(parsedTasks);
    }, [currentTaskIndex]);
  
    // Other functions and useEffects related to the task timer
  
    return {
      isPlaying,
      currentTaskIndex,
      timeRemaining,
      tasks,
      inProgress,
      tasksInputValue,
      setTasksInputValue,
      playTimer,
      pauseTimer,
      skipNext,
      tenPercentBack,
      clearAll,
      resetCurrentTaskTime,
      skipPrevious
    };
  }
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tasks: string | null = urlParams.get('tasks');

    if (tasks) {
      setTasksInputValue(tasks);
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
  });

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

  useEffect(() => {
    if (currentTaskIndex >= tasks.length && tasks.length > 0) {
      setCompletedAllTasks(true);
    } else {
      setCompletedAllTasks(false);
    }
  }, [currentTaskIndex, tasks]);

  
  function tasksInputChange(value: string) {
    if (isPlayingRef.current) {
      pauseTimer();
    }
    if ((value ?? '').trim() === '') {
      clearAll(true);
    }

    if (value.length === 1) {
      if ((tasksInputRef.current ?? "").length > 1) {
        inProgressRef.current = false;
        editor.current.view?.focus();
        timeRemainingRef.current = 10 * 60;
        currentTaskIndexRef.current = 0;
        setIsPlaying(false);
        setInProgress(false);
        setTimeRemaining(10 * 60);
        setCurrentTaskIndex(0);

        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
        intervalIdRef.current = null;
      }
    }
    tasksInputRef.current = value;
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
      <Editor 
        darkMode={darkMode}
        tasksInputValue={tasksInputValue}
        tasksInputChange={tasksInputChange}
        setTasksInputValue={setTasksInputValue}
        editor={editor}
      />
      <Icons 
        clearAll={clearAll}
        resetCurrentTaskTime={resetCurrentTaskTime}
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        playTimer={playTimer}
        pauseTimer={pauseTimer}
        skipNext={skipNext}
        skipPrevious={skipPrevious}
        tenPercentBack={tenPercentBack}
        isPlaying={isPlaying}
      />
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <MuiAlert onClose={() => setSnackbarOpen(false)} severity="success" elevation={6} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default Body;
