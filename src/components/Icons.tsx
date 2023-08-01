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
import SettingsIcon from '@mui/icons-material/Settings';

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
  const getIconSize = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 500) {
      return 50; // Medium screen, use a smaller size (40)
    } else if (screenWidth >= 400){
      return 40; // Small screen, use the smallest size (30)
    } else {
      return 30;
    }
  };

  // Use the getIconSize() function to get the appropriate size for the icons
  const iconSize = getIconSize();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Tooltip title="Clear all tasks and task input">
        <IconButton aria-label="Clear all tasks and task input" onClick={() => clearAll(true)}>
          <ClearIcon sx={{ fontSize: iconSize }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Add 10% of task's full time back">
        <IconButton onClick={tenPercentBack}>
          <PercentIcon sx={{ fontSize: iconSize }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Reset current task's time">
        <IconButton onClick={resetCurrentTaskTime}>
          <StartIcon sx={{ fontSize: iconSize }} />
        </IconButton>
      </Tooltip>
      {isPlaying ? (
        <Tooltip title="Pause">
          <IconButton onClick={pauseTimer}>
            <PauseIcon sx={{ fontSize: iconSize }} />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Play">
          <IconButton onClick={playTimer}>
            <PlayArrowIcon sx={{ fontSize: iconSize }} />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Skip to previous task">
        <IconButton onClick={skipPrevious}>
          <SkipPreviousIcon sx={{ fontSize: iconSize }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Skip to next task">
        <IconButton onClick={skipNext}>
          <SkipNextIcon sx={{ fontSize: iconSize }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Open Settings">
        <IconButton onClick={toggleDarkMode}>
          <SettingsIcon sx={{ fontSize: iconSize }} />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export default Icons
