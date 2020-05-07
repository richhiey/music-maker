// See https://github.com/danigb/soundfont-player
// for more documentation on prop options.
import React from 'react';
import {InstrumentContext} from '../../store';
import {PlayerContext} from '../../store';

const core = require('@magenta/music/node/core');
const Tone = core.Player.tone
var current_note = null;

function SoundfontProvider(props) {

  const [instruments, instr_dispatch] = React.useContext(InstrumentContext);
  const [player, player_dispatch] = React.useContext(PlayerContext);

  const get_current_playing_instr = instruments => {
    let solo = null
    let midi_controller = null
    for (let i in instruments) {
      let instr = instruments[i]
      if (instr.solo) { solo = instr }
      else if (instr.type == 'midi-instrument') { midi_controller = instr }
    }
    if (solo) { return solo }
    if (midi_controller && midi_controller.active) { return midi_controller }
    return null
  }

  const instr_to_play = get_current_playing_instr(instruments.instruments)

  const playNote = midi_event => {
    if (instr_to_play && instr_to_play.player) {    
      instr_to_play.player.triggerAttack(
        Tone.Frequency(midi_event.note.number, 'midi')
      )
    }
  };

  const stopNote = midi_event => {
    if (instr_to_play && instr_to_play.player) {
      instr_to_play.player.triggerRelease(
        Tone.Frequency(midi_event.note.number, 'midi'),
        midi_event.timestamp
      )
    }
  };

  // Clear any residual notes that don't get called with stopNote
  const stopAllNotes = () => {
    console.log('Stop all notes!');
  };

    return props.render({
      isLoading: false,
      playNote: playNote,
      stopNote: stopNote,
      stopAllNotes: stopAllNotes,
    });
}

export default SoundfontProvider;
