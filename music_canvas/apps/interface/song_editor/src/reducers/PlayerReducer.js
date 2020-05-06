import * as Note from "tonal-note"
import * as Dictionary from "tonal-dictionary"
import * as PcSet from "tonal-pcset"
import _ from 'lodash'
import webmidi from "webmidi";
import ls from 'local-storage'
import {parse, stringify} from 'flatted/esm';

const core = require('@magenta/music/node/core');

const musicvae = require('@magenta/music/node/music_vae');
const musicrnn = require('@magenta/music/node/music_rnn');
const Tone = core.Player.tone;

// Constants for coordinating instrument playback 
const thisPatternLength = 8
const MIN_NOTE = 48;
const MAX_NOTE = 84;
const MIN_STEPS = 12
const MAX_STEPS = 24
const MAX_TEMPERATURE = 1
const MIN_TEMPERATURE = 0.5
const TICKS_PER_QUARTER = 24
const STEPS_PER_QUARTER = 8
const MAX_CHORD_SEQUENCE_LENGTH = 8
const MIN_SEQUENCE_LENGTH = 16
const DUMMY_NOTES_MELODY = [{note: 56}, {note: 60}, {note: 63}, {note: 69}]
const DUMMY_NOTES_DRUMS = []

const DEFAULT_CHORD_PROGRESSION = ['C', 'Am', 'F', 'G']

// Conditioning symbols
var current_chord_seq = [];
let generatedSequences = []
let prevNoteSequences = []

// Tracking variables
var generating = []
var clockOutputTickerId = null
let midiTickCount = 0
let lastBeatAt = null
let playIntervalTime = Tone.Time('8n').toSeconds();
let generationIntervalTime = playIntervalTime / 2;
let pulsePattern = true;
let running = false

// Instrument variables
var dummmy_synth = new Tone.MembraneSynth().toMaster();
var feedback_loop_start = null
dummmy_synth.volume.value = -30


function seqToTickArray(seq) {
  return _.flatMap(seq, n =>
    [n.pitch].concat(
      pulsePattern
        ? []
        : _.times(n.quantizedEndStep - n.quantizedStartStep - 1, () => null)
    )
  );
}

function buildNoteSequence(seed, instrument) {
  let step = 0;
  let delayProb = pulsePattern ? 0 : 0.3;
  let notes = seed.map(n => {
    let dur = (1 + (Math.random() < delayProb ? 1 : 0));
    let note = {
      pitch: n.pitch,
      quantizedStartStep: step,
      quantizedEndStep: step + dur,
      program: instrument.info.sgm_instr_id
    };
    step += dur;
    return note;
  });
  let total_steps = null
  if (notes.length) {
    total_steps = _.last(notes).quantizedEndStep
  } else {
    total_steps = 0
  }
  return {
    quantizationInfo: {
      stepsPerQuarter: TICKS_PER_QUARTER
    },
    notes
  };
}

const PlayerReducer = (state, action) => {
    let instruments = action.instruments;
    if (instruments) {
        instruments = instruments.instruments
    }

    switch (action.type) {


        case 'PLAY_SELECTED_INSTRUMENTS':
            console.log('PLAY_SELECTED_INSTRUMENTS - inside Player Reducer');
            for(let i in instruments) {
                let instrument = instruments[i];
                instrument.recorder.stop();
                instrument.player.resumeContext();
                instrument.player.start(instrument.recorder.getNoteSequence());
            }
            return state;


        case 'STOP_SELECTED_INSTRUMENTS':
            console.log('STOP_SELECTED_INSTRUMENTS - inside Player Reducer');
            for(let _ in instruments) {
                let r_instrument = instruments[_];
                r_instrument.recorder.stop();
                r_instrument.player.stop();
            }
            for (let o in webmidi.outputs) {
                let output = webmidi.outputs[o]
                console.log(output)
                output.sendStop()
            }

            Tone.Transport.clear(clockOutputTickerId);
            feedback_loop_start = null
            clockOutputTickerId = null
            Tone.Transport.stop();
            return state;


        case 'RECORD_SELECTED_INSTRUMENTS':
            console.log('RECORD_SELECTED_INSTRUMENTS - inside Player Reducer');
            for(let _ in instruments) {
                let r_instrument = instruments[_];
                r_instrument.player.stop();
                r_instrument.recorder.reset();
                r_instrument.recorder.start();
            }
            return state;


        case 'SAVE_SELECTED_INSTRUMENTS':
            console.log('SAVE_SELECTED_INSTRUMENTS - inside Player Reducer');
            return state;


        case 'LOOP_INSTRUMENTS':
            // Initialize variables
            if (feedback_loop_start) {
                console.log('Loop already running, returning from here')
            }
            console.log('LOOP_SELECTED_INSTRUMENTS - inside Player Reducer');
            feedback_loop_start = true
            let start_silence = Tone.Time('1m');
            Tone.Transport.bpm.value = state.tempo;
            // Send start message for MIDI clock output 
            let outputs = webmidi.outputs
            for (let o in outputs) {
                let output = outputs[o]
                output.sendStart()
            }
            // Add event listeners for MIDI clock ticks
            startClockOutput()
            let inputs = webmidi.inputs
            for(let i in inputs) {
                let input = inputs[i]
                input.addListener('start', 'all', incomingMidiClockStart)
                input.addListener('stop', 'all', incomingMidiClockStop)
                input.addListener('clock', 'all', function (e) {
                    incomingMidiClockTick(e, instruments)
                })
            }

            for (let i in instruments) {
                let instrument = instruments[i]
                if (instrument.type == 'midi-instrument') {
                    setupMIDIInstrumentRecorder(instrument)
                } else if (instrument.type == 'ai-instrument') {
                    setupMelodyInstrumentGenerator(instrument)
                } else if (instrument.type == 'drum-instrument') {
                    setupDrumLoopGenerator(instrument)

                }
            }
            Tone.Transport.start();
            return state;


        case 'CHANGE_TEMPO':
            console.log('CHANGE_TEMPO - inside Player Reducer');
            state.tempo = action.value;
            console.log(action)
            console.log(state);
            return state;
    }


    function setupMIDIInstrumentRecorder(instrument) {
        console.log('Initializing MIDI Instrument Recorder')
        instrument.recorder.start()
        console.log('Done!')
    }

    function setupMelodyInstrumentGenerator(instrument) {
        console.log('Initializing Melody Instrument Generator')
        // Generate a dummy note sequence to initialize generation model 
        let dummy_ns = null
        let seed_ns = buildNoteSequence(DUMMY_NOTES_MELODY, instrument)
        if (instrument.player_model) {            
            dummy_ns = instrument.player_model.continueSequence(
                seed_ns,
                16,
                1,
                DEFAULT_CHORD_PROGRESSION
            )
        } else {
            console.log('Couldnt find player model for instrument')
        }
        console.log(dummy_ns)
        console.log('Done!')
    }

    function setupDrumLoopGenerator(instrument) {
        console.log('Initializing Drum Loop Generator')
        let seed_ns = buildNoteSequence(DUMMY_NOTES_MELODY, instrument)
        // Generate a dummy note sequence to initialize generation model
        if (instrument.player_model) {            
            let dummy_ns = instrument.player_model.continueSequence(
                seed_ns,
                16,
                1,
            )
        } else {
            console.log('Couldnt find player model for drums')
        }
        console.log('Done!')
    }
};


function startClockOutput() {
    let outputs = webmidi.outputs
    for (let o in outputs) {
    let output = outputs[o]        
    clockOutputTickerId = Tone.Transport.scheduleRepeat(time => {
        let startDelay = time - Tone.context.currentTime;
        let quarter = Tone.Time('4n').toSeconds();
        for (let i = 0; i < TICKS_PER_QUARTER; i++) {
            let tickDelay = startDelay + (quarter / TICKS_PER_QUARTER) * i;
            output.sendClock({ time: `+${tickDelay * 1000}` });
        }
    }, '4n');
    }
}


function incomingMidiClockStart(e) {
    midiTickCount = 0;
    console.log('incomingMidiClockStart')
}

function incomingMidiClockStop(e) {
    midiTickCount = 0;
    for(let i in webmidi.inputs) {
        let input = webmidi.inputs[i]
        input.removeListener('noteon')
        input.removeListener('clock')
        input.removeListener('start')
        input.removeListener('stop')
    }
    console.log('incomingMidiClockStop')
}

// Sync all instruments according to MIDI input clock!!
function incomingMidiClockTick(e, instruments) {
    let half_note = TICKS_PER_QUARTER * 2
    let one_measure = TICKS_PER_QUARTER * 4
    let two_measures = TICKS_PER_QUARTER * 8
    let four_measures = TICKS_PER_QUARTER * 16

    let midi_controller = null
    for (let i in instruments) {
        let instrument = instruments[i]
        if (instrument.type == 'midi-instrument') {
            midi_controller = instrument
        }
    }
    if (true) {    
        for (let i in instruments) {
            let instrument = instruments[i]
            let controller_ns = buildNoteSequence(DUMMY_NOTES_MELODY, instrument)
            let gen_seq = generatedSequences[instrument.id] || []
            if (instrument.type == 'ai-instrument') {
                if (midiTickCount % (TICKS_PER_QUARTER/6) === 0) {
                    doTick(instrument);
                }
                if (midiTickCount % (one_measure + half_note) === 0) {
                    generatedSequences[instrument.id] = []
                    console.log('Generated Sequence - ')
                    console.log(gen_seq)
                    if (!generating[instrument.id] && gen_seq.length < MIN_SEQUENCE_LENGTH) {                        
                        generating[instrument.id] = true
                        setTimeout(generateNextSequence(
                            instrument, 
                            controller_ns
                        ), 0)
                    }
                }
            } else if (instrument.type == 'midi-instrument') {
                updateChordSequence(instrument, midiTickCount)
            } else if (instrument.type == 'drum-instrument') {
                console.log('Generating stuff for drum instrument')
            }
        }
    }
    if (midiTickCount % TICKS_PER_QUARTER === 0) {
        console.log('Quarter note - ' + (midiTickCount / TICKS_PER_QUARTER) + ' | Measure - ' + (midiTickCount / (TICKS_PER_QUARTER * 4)))
    }
    midiTickCount++;
}

function generateNextSequence(instrument, controller_seed_seq) {
    console.log('---------------Inside generateNextSequence ------------')
    console.log(controller_seed_seq)
    let genSeq = null
    if (controller_seed_seq.notes.length) {
        instrument.player_model.continueSequence(
            controller_seed_seq,
            16,
            1.2,
            DEFAULT_CHORD_PROGRESSION).then(genSeq => {
                console.log('--------------- Generated Sequence ---------------')
                let seq_to_ticks = seqToTickArray(genSeq.notes)
                console.log(seq_to_ticks)
                generating[instrument.id] = false
                if (generatedSequences[instrument.id] && generatedSequences[instrument.id].length < MIN_SEQUENCE_LENGTH) {
                    generatedSequences[instrument.id] = generatedSequences[instrument.id].concat(seq_to_ticks)
                } else {
                    generatedSequences[instrument.id] = seq_to_ticks
                }
                console.log(generatedSequences[instrument.id])
           });
    } else {
        console.log('Current note sequence too small')
    }
}

function detectChord(notes, start, end) {
    return new Promise(resolve => {
        resolve(DEFAULT_CHORD_PROGRESSION)
    });
}

async function updateChordSequence (instrument, midi_tick_count) {
    //console.log('Running updateChordSequence')
    let chords = []
    let start = Math.max(midi_tick_count - (2 * TICKS_PER_QUARTER), 0)
    let stop = midi_tick_count
    let notes = instrument.recorder.getNoteSequence()
    if (notes) {
        notes.id = instrument.id
        chords = detectChord(notes, start, stop)
    } else {
        console.log('No notes recorded .. Using DEFAULT_CHORD_PROGRESSION')
    }
    for (let c in chords) {
        let chord = chords[c]
        if (current_chord_seq.length > MAX_CHORD_SEQUENCE_LENGTH) {
            let temp = current_chord_seq.shift()
        }
        current_chord_seq.push(chord)
    }
    return chords
}

function doTick(instrument) {
    //console.log('doTick() - Playing note at clock - ' + midiTickCount)
    let gen_seq = generatedSequences[instrument.id]
    if (gen_seq) {
        let note = gen_seq[midiTickCount % thisPatternLength]
        machineKeyDown(note, instrument)
    }
}


function machineKeyDown(note, instrument) {
    if (note < MIN_NOTE || note > MAX_NOTE) return;
    //synth.triggerAttackRelease(note);
    if (note) {
        instrument.player.playNote(webmidi.now, {pitch: note, program: instrument.info.sgm_instr_id})
    }
}
export default PlayerReducer;


