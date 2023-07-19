import { Tooltip, Box } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import StartIcon from '@mui/icons-material/Start';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PercentIcon from '@mui/icons-material/Percent';

interface IconsProps {
  clearAll: (clearInput: boolean) => void;
  resetCurrentTaskTime: () => void;
  toggleDarkMode: () => void;
  playTimer (): void;
  pauseTimer (): void;
  skipNext (): void;
  skipPrevious (): void;
  tenPercentBack (): void;
  isPlaying: boolean;
  darkMode: boolean;
}

function Icons({ toggleDarkMode, clearAll, resetCurrentTaskTime, playTimer, pauseTimer, skipNext, skipPrevious, tenPercentBack, isPlaying, darkMode }: IconsProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Tooltip title="Clear all tasks and task input">
        <IconButton aria-label="Clear all tasks and task input" onClick={() => clearAll(true)}>
          <ClearIcon sx={{ fontSize: 50 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Add 10% of task's full time back">
        <IconButton onClick={tenPercentBack}>
          <PercentIcon sx={{ fontSize: 50 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Reset current task's time">
        <IconButton onClick={resetCurrentTaskTime}>
          <StartIcon sx={{ fontSize: 50 }} />
        </IconButton>
      </Tooltip>
      {isPlaying ? (
        <Tooltip title="Pause">
          <IconButton onClick={pauseTimer}>
            <PauseIcon sx={{ fontSize: 50 }} />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Play">
          <IconButton onClick={playTimer}>
            <PlayArrowIcon sx={{ fontSize: 50 }} />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Skip to previous task">
        <IconButton onClick={skipPrevious}>
          <SkipPreviousIcon sx={{ fontSize: 50 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Skip to next task">
        <IconButton onClick={skipNext}>
          <SkipNextIcon sx={{ fontSize: 50 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
        <IconButton onClick={toggleDarkMode}>
          {darkMode ? <LightModeIcon sx={{ fontSize: 50 }} /> : <DarkModeIcon sx={{ fontSize: 50 }} />}
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export default Icons
