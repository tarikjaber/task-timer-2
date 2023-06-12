import './Body.css';
import TextField from '@mui/material/TextField';
import { Typography, Tooltip, Box } from '@mui/material';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import StartIcon from '@mui/icons-material/Start';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

function Body() {
  return (
    <div className="body">
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h1" gutterBottom sx={{ mb: -1, fontWeight: "bold", mt: -2, fontSize:"120px" }}>
          00:00
        </Typography>
        <Typography variant="h3" gutterBottom sx={{ mb: 2 }}>
          Task Timer
        </Typography>
      </Box>
      <Box sx={{ display: 'flex' }}>
        <TextField
          id="tasks-input"
          label="Tasks"
          multiline
          rows={10}
          variant="filled"
          placeholder='Enter task and time in minutes on a line for every task like &quot;Task Name 10&quot; for 10 minutes.'
          sx={{ flex: '1', marginRight: '20px' }}
        />
        <TextField
          id="notes-input"
          label="Notes"
          multiline
          rows={10}
          variant="filled"
          placeholder='Enter notes...'
          sx={{ flex: '1' }}
        />
      </Box>
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
          <IconButton>
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
        <Tooltip title="Switch to light mode">
          <IconButton>
            <LightModeIcon sx={{ fontSize: 50 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </div>
  );
}

export default Body;