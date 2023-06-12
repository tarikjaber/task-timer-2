import React, { useEffect, useState } from 'react';
import './Body.css';
import TextField from '@mui/material/TextField';
import { Typography, Tooltip, Box } from '@mui/material';
import Icons from './Icons';

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

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

  function clearAll() {

  }

  function resetCurrentTaskTime() {

  }

  function parseTasks() {
    const tasksInput = document.getElementById('tasks-input') as HTMLInputElement;
    let tasks = tasksInput.value.split('\n').filter(task => task.trim() !== '');
    tasks = tasks.map(task => task.trim()).map(line => line.replace(/^- \[\s\] /, '').replace(/^- \[\s[xX]\] /, '').replace(/^- /, ''));
    let parsedTasks: Task[] = [];
    parsedTasks = tasks.map(task => {
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
        if (isNumeric(last)) {
          time = parseInt(last) * 60;
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

  function play() {
    setTasks(parseTasks());

    const newIntervalId = window.setInterval(() => {
      setTimeRemaining(timeRemaining => {
        if (timeRemaining <= 0) {
          skipNext();
        }
        return timeRemaining - 1;
      });
    }, 1000);

    setIntervalId(newIntervalId);
  }

  function pause() {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }

  function skipNext() {

  }

  function skipPrevious() {

  }

  return (
    <div className="body">
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h1" gutterBottom sx={{ mb: -1, fontWeight: 'bold', mt: -2, fontSize: '120px' }}>
          00:00
        </Typography>
        <Typography variant="h3" gutterBottom sx={{ mb: 2 }}>
          Task Timer
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
      <Icons toggleDarkMode={toggleDarkMode} play={play}  darkMode={darkMode} />
    </div>
  );
}

export default Body;
