import { Tooltip, Box } from '@mui/material';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import StartIcon from '@mui/icons-material/Start';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

interface IconsProps {
  toggleDarkMode: () => void;
  play (): void;
  darkMode: boolean;
}

function Icons({ toggleDarkMode, play, darkMode }: IconsProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Tooltip title="Clear all tasks and task input">
        <IconButton aria-label="Clear all tasks and task input">
          <ClearAllIcon sx={{ fontSize: 50 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Reset current task's time">
        <IconButton>
          <StartIcon sx={{ fontSize: 50 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Play">
        <IconButton onClick={play}>
          <PlayArrowIcon sx={{ fontSize: 50 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Skip to previous task">
        <IconButton>
          <SkipPreviousIcon sx={{ fontSize: 50 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Skip to next task">
        <IconButton>
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
