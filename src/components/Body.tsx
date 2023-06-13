import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import { Typography, Tooltip, Box } from '@mui/material';
import Icons from './Icons';
import { ConstructionOutlined } from '@mui/icons-material';

interface BodyProps {
  toggleDarkMode: () => void;
  darkMode: boolean;
}

interface Task {
  name: string;
  time: number;
  repetitionCount: number;
}

function Body({ toggleDarkMode, darkMode }: BodyProps) {
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [currentTaskName, setCurrentTaskName] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const tasksInput = document.getElementById('tasks-input') as HTMLInputElement;
    const notesInput = document.getElementById('notes-input') as HTMLInputElement;

    const handleTasksInputChange = () => {
      localStorage.setItem('tasks', tasksInput.value);
    };

    const handleNotesInputChange = () => {
      localStorage.setItem('notes', notesInput.value);
    };

    tasksInput.addEventListener('input', handleTasksInputChange);
    notesInput.addEventListener('input', handleNotesInputChange);

    return () => {
      tasksInput.removeEventListener('input', handleTasksInputChange);
      notesInput.removeEventListener('input', handleNotesInputChange);
    };
  }, []);

  function isNumeric(value: string) {
    return /^-?\d+$/.test(value);
  }

  function parseTasks() {
    const tasksInput = document.getElementById('tasks-input') as HTMLInputElement;
    let lines = tasksInput.value.split('\n').filter(task => task.trim() !== '');
    lines = lines.map(task => task.trim()).map(line => line.replace(/^- \[\s\] /, '').replace(/^- \[\s[xX]\] /, '').replace(/^- /, ''));
    let parsedTasks: Task[] = [];
    parsedTasks = lines.map(task => {
      let parts = task.split(' ');
      let last = parts[parts.length - 1];
      let numRepeats = 1;
      let time = 10 * 60;
      let rIndex = last.indexOf('r');
      if (rIndex !== -1) {
        let preR = last.slice(0, rIndex);
        let postR = last.slice(rIndex + 1);
        if (isNumeric(preR) && isNumeric(postR)) {
          time = parseInt(preR) * 60;
          numRepeats = parseInt(postR);
        }
      } else {
        if (!isNaN(Number(last))) {
          time = Number(last) * 60;
        }
      }
      return {
        name: parts[0],
        time,
        repetitionCount: numRepeats
      };
    });
    return parsedTasks;
  }
  
  function clearAll() {
    console.log("CLEAR ALL CALLED")

    localStorage.removeItem('tasks');
    localStorage.removeItem('notes');
    setCurrentTaskIndex(0);
    setTimeRemaining(0);
    setIsPlaying(false);
    setTasks([]);


    console.log("Interval ID: ", intervalId)

    if (intervalId) {
      console.log("Clear Interval Called")
      clearInterval(intervalId);
    }
    setIntervalId(null);

    const tasksInput = document.getElementById('tasks-input') as HTMLInputElement;
    const notesInput = document.getElementById('notes-input') as HTMLInputElement;
    tasksInput.value = '';
    notesInput.value = '';
  }

  function resetCurrentTaskTime() {
    if (!isPlaying) {
      return;
    }

    setTimeRemaining(tasks[currentTaskIndex].time);
  }

  function playTimer() {
    const parsedTasks = parseTasks();
  
    if (parsedTasks.length === 0) {
      return;
    }
  
    console.log("Settings tasks to parsed tasks: ", parsedTasks);
  
    setTasks(parsedTasks);
  }
  
  useEffect(() => {
    if (tasks.length === 0) {
      return;
    }
  
    if (timeRemaining <= 0) {
      setTimeRemaining(tasks[0].time);
    }

    if (intervalId) {
      clearInterval(intervalId);
    }
  
    const newIntervalId = window.setInterval(() => {
      setTimeRemaining(prevTimeRemaining => {
        const newTimeRemaining = prevTimeRemaining - 1;
        console.log("Tasks: ", tasks);
        if (newTimeRemaining <= 0) {
          skipNext();
        }
        return newTimeRemaining;
      });
    }, 1000);
  
    setIntervalId(newIntervalId);
  
    // Cleanup interval on component unmount or when tasks change
    return () => {
      clearInterval(newIntervalId);
    };
  }, [tasks, currentTaskIndex]);
  
  function pauseTimer() {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }

  function skipNext() {
    console.log("Skip next called");
    console.log(currentTaskIndex);
    console.log(tasks);
    console.log("Tasks Length: ", tasks.length)
    if (currentTaskIndex < tasks.length - 1) {
      console.log("Task completed notification: ", `"${tasks[currentTaskIndex].name}" completed, ${tasks[currentTaskIndex + 1].name} started for ${tasks[currentTaskIndex + 1].time / 60} minute${tasks[currentTaskIndex + 1].time / 60 === 1 ? '' : 's'}`)
      new Notification(`"${tasks[currentTaskIndex].name}" completed, ${tasks[currentTaskIndex + 1].name} started for ${tasks[currentTaskIndex + 1].time / 60} minute${tasks[currentTaskIndex + 1].time / 60 === 1 ? '' : 's'}`)
      setTimeRemaining(tasks[currentTaskIndex + 1].time);
      setCurrentTaskIndex(prevIndex => prevIndex + 1);
    } else {
      console.log('All tasks completed notification')
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

  return (
    <Box sx={{padding: '20px'}}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h1" gutterBottom sx={{ mb: -1, fontWeight: 'bold', mt: -2, fontSize: '120px' }}>
          {timeRemaining > 0 ? Math.floor(timeRemaining / 60).toString().padStart(2, '0') : '00'}:{timeRemaining > 0 ? (timeRemaining % 60).toString().padStart(2, '0') : '00'}
        </Typography>
        <Typography variant="h3" gutterBottom sx={{ mb: 2 }}>
          {tasks[currentTaskIndex]?.name || 'Task Timer'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', maxWidth: '1200px', margin: '0 auto' }}>
        <TextField
          id="tasks-input"
          label="Tasks"
          multiline
          rows={12}
          variant="filled"
          placeholder='Enter task and time in minutes on a line for every task like "Task Name 10" for 10 minutes.'
          sx={{ flex: '1', marginRight: '20px' }}
          defaultValue={localStorage.getItem('tasks')}
        />
        <TextField
          id="notes-input"
          label="Notes"
          multiline
          rows={12}
          variant="filled"
          placeholder="Enter notes..."
          sx={{ flex: '1' }}
          defaultValue={localStorage.getItem('notes')}
        />
      </Box>
      <Icons {...{ clearAll, resetCurrentTaskTime, toggleDarkMode, darkMode, playTimer, pauseTimer, skipNext, skipPrevious, isPlaying, setIsPlaying }} />
    </Box>
  );
}

export default Body;
