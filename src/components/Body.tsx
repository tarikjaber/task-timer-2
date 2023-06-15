import { useEffect, useState, useRef } from 'react';
import TextField from '@mui/material/TextField';
import { Typography, Box, Paper } from '@mui/material';
import ReactResizeDetector from 'react-resize-detector';
import Icons from './Icons';
import Editor from '@monaco-editor/react';


interface BodyProps {
  toggleDarkMode: () => void;
  darkMode: boolean;
}

interface Task {
  name: string;
  time: number;
  repetitionCount: number;
  index?: number;
}

function Body({ toggleDarkMode, darkMode }: BodyProps) {
  const intervalIdRef = useRef<number | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksInputValue, setTasksInputValue] = useState<string>('');

  function togglePlayPause() {
    if (isPlaying) {
      pauseTimer();
    } else {
      playTimer();
    }
  }

  useEffect(() => {
    setTasksInputValue(localStorage.getItem('tasks') || '');
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
    if (isPlaying) {
      document.title = `${Math.floor(timeRemaining / 60)
        .toString()
        .padStart(2, '0')}:${(timeRemaining % 60)
        .toString()
        .padStart(2, '0')} - ${tasks[currentTaskIndex]?.name || 'Task Timer'}`;
    } else {
      document.title = 'Task Timer';
    }
  }, [isPlaying, timeRemaining, tasks, currentTaskIndex]);

  function isNumeric(value: string) {
    return /^-?\d+$/.test(value);
  }

  function tenPercentBack() {
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

  function parseTasks() {
    let lines = tasksInputValue.split('\n').filter(task => task.trim() !== '');
    lines = lines.map(task => task.trim()).map(line => line.replace(/^- \[\s\] /, '').replace(/^- \[\s[xX]\] /, '').replace(/^- /, ''));
    let parsedTasks: Task[] = [];

    parsedTasks = lines.flatMap((task, index) => {
      let parts = task.split(' ');
      let nameParts = parts.slice(0, parts.length - 1);;
      let last = parts[parts.length - 1];
      let numRepeats = 1;
      let time = 10 * 60;
      let rIndex = last.indexOf('r');

      if (rIndex !== -1) {
        let preR = last.slice(0, rIndex);
        let postR = last.slice(rIndex + 1);
        if (!isNaN(Number(preR)) && isNumeric(postR)) {
          time = Number(preR) * 60;
          numRepeats = parseInt(postR);
        }
      } else if (!isNaN(Number(last))){
        time = Number(last) * 60;
      } else {
        nameParts.push(last);
      }

      const taskName = nameParts.join(' ');

      if (numRepeats === 1) {
        return [{
          name: taskName,
          time,
          repetitionCount: numRepeats
        }];
      } else {
        return Array.from({ length: numRepeats }, (_, repeatIndex) => ({
          name: taskName,
          time,
          repetitionCount: numRepeats,
          index: repeatIndex + 1
        }));
      }
    });
    return parsedTasks;
  }

  function clearAll() {
    localStorage.removeItem('tasks');
    setCurrentTaskIndex(0);
    setTimeRemaining(0);
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
    setIsPlaying(false);
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
  }

  function playTimer() {
    let currentTime = tasks[currentTaskIndex]?.time || 0;
    const parsedTasks = parseTasks();

    let nextTime = parsedTasks[currentTaskIndex]?.time || 0;

    if (currentTime !== nextTime) {
      setTimeRemaining(nextTime);
    }

    if (parsedTasks.length === 0) {
      return;
    }

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

  function handleTasksInputChange(value?: string) {
    localStorage.setItem('tasks', value ?? '');
    setTasksInputValue(value ?? '');
    pauseTimer();
    if ((value ?? '').trim() === '') {
      clearAll();
    }
  };

  function handleNotesInputChange(value?: string) {
    localStorage.setItem('notes', value ?? '');
  };

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
      <Box sx={{ display: 'flex', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Box sx={{ flex: '1', width: '100%', marginRight: '20px' }}>
          <Paper variant="outlined" sx={{ p: 0 }}>
            <Editor defaultValue={localStorage.getItem('tasks') ?? undefined} height="52vh" defaultLanguage="markdown" theme={darkMode ? "vs-dark" : "light"} options={{ lineNumbers: "off", minimap: {enabled: false}, fontSize: 18, lineDecorationsWidth: 0, padding: {top: 3, bottom: 3}, automaticLayout: true}} onChange={handleTasksInputChange}/>
          </Paper>
        </Box>
        <Box sx={{ flex: '1', width: '100%' }}>
          <Paper variant="outlined" sx={{ p: 0 }}>
            <Editor defaultValue={localStorage.getItem('notes') ?? undefined} height="52vh" defaultLanguage="markdown" theme={darkMode ? "vs-dark" : "light"} options={{ lineNumbers: "off", minimap: {enabled: false}, fontSize: 18,  lineDecorationsWidth: 0, padding: {top: 3, bottom: 3}, automaticLayout: true}} onChange={handleNotesInputChange}/>
          </Paper>
        </Box>
      </Box>
      <Icons {...{ clearAll, resetCurrentTaskTime, toggleDarkMode, darkMode, playTimer, pauseTimer, skipNext, skipPrevious, isPlaying, tenPercentBack }} />
    </Box>
  );
}

export default Body;
