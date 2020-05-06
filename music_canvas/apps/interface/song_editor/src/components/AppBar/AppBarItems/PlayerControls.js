import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import StopIcon from '@material-ui/icons/Stop';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import SaveIcon from '@material-ui/icons/Save';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import LoopIcon from '@material-ui/icons/Loop';
import Input from '@material-ui/core/Input';
import FilledInput from '@material-ui/core/FilledInput';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import * as Note from "tonal-note"

import {InstrumentContext} from '../../../store'
import {PlayerContext} from '../../../store'
import {DEFAULT_TRACK_NUMBER} from '../../Constants'
import {REQUIRED_NOTES} from '../../Constants'
import {JAZZ_KIT} from '../../Constants'
import {SALAMANDER_GRAND_PIANO} from '../../Constants'
import {DEFAULT_SOUND_CONFIG} from '../../Constants'
import './AppBarItems.css';

const core = require('@magenta/music/node/core');
const Tone = core.Player.tone;

function PlayerControls() {      
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const [tempo, setTempo] = React.useState(70);

    const handleToggle = () => {
      setOpen(prevOpen => !prevOpen);
    };
  
    const handleClose = event => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
        return;
      }  
      setOpen(false);
    };

    function handleListKeyDown(event) {
      if (event.key === 'Tab') {
        event.preventDefault();
        setOpen(false);
      }
    }

    const [instruments, instr_dispatch] = React.useContext(InstrumentContext);
    const [player, player_dispatch] = React.useContext(PlayerContext);
    
    const handleChangeTempo = () => (event) => {
        console.log(event.target.value)
        setTempo(event.target.value)
        player_dispatch({
            type: 'CHANGE_TEMPO',
            value: event.target.value
        });
    };

    const get_samples_files_for_instr = (soundfont, value) => {
        let base = soundfont.base_url
        let samples = {}
        for (let i in soundfont.sf_instruments) {
            let instr = soundfont.sf_instruments[i]
            if (instr.info.value == value) {
                for (let n in REQUIRED_NOTES) {
                    let note = REQUIRED_NOTES[n]
                    let sample_file = base + '/' + instr.info.name + '/' + note.file_name
                    samples[Note.fromMidi(note.midi_note_num)] = sample_file
                }
            }
        }
        return samples
    }

    const handleAddInstrument = (type) => {
        let sound_config_for_instr = DEFAULT_SOUND_CONFIG
        let track = {sections: []};
        let player_model_name = null
        if (type == 'midi-instrument') {
            player_model_name = 'chord_pitches_improv'
        }
        instr_dispatch({
            type: 'ADD_INSTRUMENT',
            new_instrument: {
                id: instruments.instruments.length,
                info: {player_model_name: player_model_name},
                sound_configs: sound_config_for_instr,
                temp_note_store: [],
                recorded_notes: [],
                active: true,
                solo: false,
                type: type,
                track: track
            }
        });
    }

    const handlePlaySelectedInstruments = () => {
        console.log('Handler for playing all selected instruments!');
        player_dispatch({
            type: 'PLAY_SELECTED_INSTRUMENTS',
            instruments: instruments,
        });
    };

    const handleStopSelectedInstruments = () => {
        console.log('Handler for stopping all selected instruments!');
        player_dispatch({
            type: 'STOP_SELECTED_INSTRUMENTS',
            instruments: instruments,
        });
    };

    const handleRecordAllInstruments = () => {
        console.log('Handler for recording all selected instruments!');
        player_dispatch({
            type: 'RECORD_SELECTED_INSTRUMENTS',
            instruments: instruments,
        });
    };

    const handleLoopAllInstruments = (value) => {
        console.log('Handler for looping playback of all selected instruments!');
        player_dispatch({
            type: 'LOOP_INSTRUMENTS',
            loop_value: value,
            instruments: instruments,
        });
    };

    const handleDeleteAllInstruments = () => {
        console.log('Handler for deleting all selected instruments!');
        instr_dispatch({
            type: 'DELETE_ALL_INSTRUMENTS',
        });
    };


    return (
        <div>
            <FormControl className='tempoSelector'>
                <Input
                    id="tempo"
                    defaultValue={70}
                    value={tempo}
                    onChange={handleChangeTempo()}
                    endAdornment={<InputAdornment position="end">BPM</InputAdornment>}
                />
            </FormControl>

        <Button
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          Add Instrument
        </Button>
        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                    <MenuItem onClick={() => handleAddInstrument('midi-instrument')}>MIDI Instrument</MenuItem>
                    <MenuItem onClick={() => handleAddInstrument('ai-instrument')}>AI Instrument</MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>           
            <IconButton onClick={() => handlePlaySelectedInstruments()} className='menuButton' color="inherit" aria-label="menu">
                < PlayCircleFilledIcon/>
            </IconButton>
            <IconButton onClick={() => handleStopSelectedInstruments()} className='menuButton' color="inherit" aria-label="menu">
                <StopIcon />
            </IconButton>
            <IconButton onClick={() => handleDeleteAllInstruments()} className='menuButton' color="inherit" aria-label="menu">
                <DeleteForeverIcon />
            </IconButton>
        </div>
    );
}

export default PlayerControls;