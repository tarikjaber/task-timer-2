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

  function pauseTimer() {
    setIsPlaying(false);
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
  }

  const skipNext = useCallback(() => {
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

  function tenPercentBack() {
    if (!inProgressRef.current) {
      if (tasks.length === 0) {
        return;
      }
      inProgressRef.current = true;
      let time = tasks[tasks.length - 1].time;
      currentTaskIndexRef.current = tasks.length - 1;
      timeRemainingRef.current = Math.ceil(time * 0.1);
      
      setCurrentTaskIndex(tasks.length - 1);
      setTimeRemaining(Math.ceil(time * 0.1));
      setInProgress(true);
      setIsPlaying(true);
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
    inProgressRef.current = false;
    editor.current.view?.focus();
    timeRemainingRef.current = 0;
    setInProgress(false);
    setIsPlaying(false);
    setInProgress(false);
    setTimeRemaining(0);

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

  function skipPrevious() {
    if (currentTaskIndex > 0) {
      timeRemainingRef.current = tasks[currentTaskIndex - 1].time;
      currentTaskIndexRef.current = currentTaskIndex - 1;
      inProgressRef.current = true;
      setTimeRemaining(tasks[currentTaskIndex - 1].time);
      setCurrentTaskIndex(currentTaskIndex - 1);
      setInProgress(true);
      startInterval(true);
    }
  }

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
