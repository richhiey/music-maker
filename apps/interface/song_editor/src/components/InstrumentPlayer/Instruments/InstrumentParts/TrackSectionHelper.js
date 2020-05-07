import React from 'react';
import _ from 'lodash'
import webmidi from 'webmidi'

// Material UI
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import NativeSelect from '@material-ui/core/NativeSelect';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import {DEFAULT_STEPS_PER_QUARTER} from '../../../Constants'
import {DEFAULT_CHORD_SEQ} from '../../../Constants'
import {MAX_TEMPERATURE} from '../../../Constants'

// Icons
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import StopIcon from '@material-ui/icons/Stop';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import GetAppIcon from '@material-ui/icons/GetApp';

const core = require('@magenta/music/node/core');
const tf = core.tf;
const Tone = core.Player.tone;
const HUMANIZE_SECONDS = 0.01;
const Z_DIM = 256;
const QPM = 120;
const STEPS_PER_QUARTER = 24;


let synth = new Tone.MembraneSynth().toMaster()

export function processValueForKey(key, value) {
    return value
}

export function visualzeNoteSequence(noteSequence, canvasName, active_note = null, visualizerConfig = null) {
    if (noteSequence && noteSequence.notes) {
        let canvas = document.getElementById(canvasName)
        let viz = new core.PianoRollCanvasVisualizer(noteSequence, canvas)
        if (active_note) {
            viz.redraw(active_note)
        }
    }    
    // } else {
    //     const context = document.getElementById(canvasName).getContext('2d');
    //     context.canvas.width = context.canvas.width
    //     context.canvas.height = context.canvas.height
    //     context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    // }
}

export function quantizeSequence(seed, stepsPerQuarter, tempo) {
    console.log('Within quantizeSequence')
    console.log(seed)
    return core.sequences.quantizeNoteSequence(
        {
            ticksPerQuarter: 220,
            totalTime: seed.length * (60/tempo),
            quantizationInfo: {
                stepsPerQuarter: stepsPerQuarter
            },
            timeSignatures: [
                {
                    time: 0,
                    numerator: 4,
                    denominator: 4
                }
            ],
            tempos: [
                {
                    time: 0,
                    qpm: tempo
                }
            ],
            notes: seed
        },
        stepsPerQuarter
    );
}

export function arpeggiateSequence(seed, stepsPerQuarter, tempo, num_steps) {
    console.log('-------------------')
    console.log(seed)
    let step = 0;
    let delayProb =  0.3
    seed = seed.slice(0, num_steps)
    let notes = seed.map(n => {
        let dur = Tone.Time //+ (Math.random() > delayProb ? 1 : 0)
        let note = {
            pitch: n.pitch,
            quantizedStartStep: step,
            quantizedEndStep: step + dur
        };
        step += dur;
        return note;
    });
    console.log(seed)
    console.log('-------------------')
    return {
        totalQuantizedSteps: _.last(notes).quantizedEndStep,
        quantizationInfo: {
            stepsPerQuarter: stepsPerQuarter
        },
        notes: notes
    }
}

export function buildNoteSequence(noteSequence, stepsPerQuarter, tempo, num_measures, action) {
    let seed = noteSequence
    if (!seed.quantizationInfo){
        seed = quantizeSequence(seed.notes, stepsPerQuarter, tempo)
    }
    if (action) {
        seed = arpeggiateSequence(seed.notes, stepsPerQuarter, tempo, num_measures)
    }
    return seed
}


export function interpolateMelodies(instrument) {
    console.log('Within interpolate ..')
}

export function generateDrumsRNN() {
    console.log('Inside generateDrumsRNN ...')
}

export function generateDrumsVAE() {
    console.log('Inside generateDrumsVAE ...')
}

const normalize_temp = (temp) => {
    return (temp/100)*1.4
}
export function generateMelodyRNN(section_id, section, instrument, transformAction) {
    console.log(section.startNotes)
    instrument.player_model.continueSequence(
        quantizeSequence(section.startNotes.notes, section.stepsPerQuarter, 70),
        section.numMeasures * section.stepsPerQuarter * 4, 
        normalize_temp(section.temperature),
        section.chordProg
    ).then(generatedSequence => {
        transformAndSaveMelody(
            section_id,
            section,
            generatedSequence, 
            transformAction
        )
        visualzeNoteSequence(generatedSequence, buildVisualizerCanvasId(section_id, instrument.id, 'generatedNotes'))
    });
}

// Concatenate multiple NoteSequence objects.
const concatenateSequences = (seqs) => {
  const seq = core.sequences.clone(seqs[0]);
  let numSteps = seqs[0].totalQuantizedSteps;
  for (let i=1; i<seqs.length; i++) {
    const s = core.sequences.clone(seqs[i]);
    s.notes.forEach(note => {
      note.quantizedStartStep += numSteps;
      note.quantizedEndStep += numSteps;
      seq.notes.push(note);
    });
    numSteps += s.totalQuantizedSteps;
  }
  seq.totalQuantizedSteps = numSteps;
  return seq;
}


export function generateMelodyVAE(section_id, section, instrument, transformAction) {
    console.log('Deal with MusicVAE interpolate stuff!!')
    instrument.player_model.interpolate(
        [
            quantizeSequence(section.startNotes.notes, section.stepsPerQuarter, 70),
            quantizeSequence(section.endNotes.notes, section.stepsPerQuarter, 70)
        ],
        4,
        normalize_temp(section.temperature),
        section.chordProg
    ).then(genSeqs => {
        console.log('generatedSequences!!')
        let concatenatedSequence = concatenateSequences(genSeqs.concat(section.startNotes).concat(section.endNotes))
        transformAndSaveMelody(
            section_id,
            section,
            concatenatedSequence,
            transformAction
        )
        console.log(concatenatedSequence)
        visualzeNoteSequence(concatenatedSequence, buildVisualizerCanvasId(section_id, instrument.id, 'generatedNotes'))
    })
}

// Save sequence as MIDI.
function handleDownloadNoteSequence(noteSequence, noteSequenceName) {
    if (noteSequence && noteSequence.notes) {
  const midi = core.sequenceProtoToMidi(noteSequence);
  const file = new Blob([midi], {type: 'audio/midi'});
  const file_name = noteSequenceName + '.mid'
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(file, file_name);
  } else { // Others
    const a = document.createElement('a');
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = file_name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);  
    }, 0); 
  }
  }
}

export function stopRecordingInstrument(current_instr, section_id, section, ns_type, handleChange) {
    let ns = current_instr.recorder.getNoteSequence()
    if (ns) {
        ns.id = current_instr.id
        ns = quantizeSequence(ns.notes, section.stepsPerQuarter, 70)
        console.log(ns)
        handleChange(ns_type, ns)
    }
    current_instr.recorder.reset()
}

export function startRecordingInstrument(current_instr, section_id, section, ns_type, tempo, active=false) {
    if (active) {
    current_instr.recorder.enablePlayClick(true)
    current_instr.recorder.setTempo(tempo)
    current_instr.recorder.start()
    let inputs = webmidi.inputs;
    for (const input in inputs) {
        let _input = inputs[input];
        _input.addListener('noteon', "all", function(e) {
            recordCurrentNoteOn(e, current_instr, section_id, section, ns_type);
        });
        _input.addListener('noteoff', "all", function (e) {
            recordCurrentNoteOff(e, current_instr, section_id, section, ns_type);
        });
    }
    Tone.Transport.start()
    }
}

let current_transport = null
export function startPlayingInstrument(
    instrument,
    section_id,
    ns_type,
    section,
    tempo,
    active=false) {

    Tone.Transport.scheduleRepeat(function playTick(time) {
        synth.triggerAttackRelease("C2", "4n");
    }, '2n')
    Tone.Transport.schedule(function playNoteSequence(time) {
        let section = instrument.track.sections[section_id]
        let noteSequence = section[ns_type]
        if (noteSequence && noteSequence.notes) {
            if (instrument.type == 'midi-instrument') {
                playNotes(section.startNotes.notes, instrument.player)
            }
            playNotes(noteSequence.notes, instrument.player)
        }
    }, 0)
    Tone.Transport.bpm.value = tempo
    Tone.Transport.start()
}

export function stopPlayingInstrument() {
    Tone.Transport.stop()
    Tone.Transport.position = 0;
    Tone.Transport.cancel();
}
    

export function isItemDisabled(section, item) {
    return true
}

export function isItemVisible(section, item) {
    return true
}


export function create_expansion_panel(
    panel_name,
    instrument,
    ns_type,
    section_id,
    handleRecordSectionNoteSequence,
    handlePlaySectionNoteSequence,
    handleDeleteSectionNoteSequence,
    disabled=false,
    record=true,
    recording=false,
    playing=false
    ) {
    
    console.log('Inside create_expansion_panel ...')
    return (<ExpansionPanel disabled={disabled}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id={panel_name}
                >
                    <Typography>{panel_name}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    {renderInstrumentSequence(
                        panel_name,
                        instrument,
                        section_id,
                        ns_type,
                        record,
                        handleRecordSectionNoteSequence,
                        handlePlaySectionNoteSequence,
                        handleDeleteSectionNoteSequence,
                        recording,
                        playing
                    )}
                </ExpansionPanelDetails>
            </ExpansionPanel>)
}

export function create_selector(
    selector_name,
    selected_value,
    handleOnChange,
    values=[1,2,3,4]) {

    return (<FormControl>
        <InputLabel style={{color:'white'}}>{selector_name}</InputLabel>
        <NativeSelect
            id="demo-customized-select-native"
            value={selected_value}
            onChange={(e) => {handleOnChange(e)}}
        >
            {
                values.map((measure) => {
                    return (<option value={measure}>{measure}</option>)        
                })
            }
        </NativeSelect>
    </FormControl>)
}

export function renderChordProgression(current_instr, section) {
    return (section.chordProg && current_instr 
                    && current_instr.type == 'midi-instrument'? 
                    (
                        <Grid container xs={12} spacing={3}>
                            <Grid item xs={3}>
                                <b>CHORD PROGRESSION :</b>
                            </Grid>
                            {section.chordProg.map((chord_name) => {
                                return (
                                    <Grid item xs={1}>
                                        <b>{chord_name}</b>
                                    </Grid>
                                )        
                            })}
                        </Grid>
                    ) : null)
}
export function create_switch(
    switch_name,
    value,
    handleOnChange,
    disabled = false) {
    
    return (<FormControlLabel
                disabled={disabled}
                control={<Switch size="small"
                onChange={handleOnChange}
                checked={value} />}
                label={switch_name}/>)
}

export function create_numeric_value_setter(
    name,
    current_value,
    handleChange,
    min = 0, 
    max = 16,
    step_size = 1) {
    
    return (<TextField
        id="standard-number"
        label={name}
        style={{color:'white !important'}}
        type="number"
        size="small"
        defaultValue={current_value}
        InputLabelProps={{
            shrink: true,
        }}
        onChange={(e) => { handleChange(e.target.value) }}
    />)
}

export function renderInstrumentSequence(
    title,
    instrument,
    section_id,
    ns_type,
    show_record,
    handleRecordSectionNoteSequence,
    handlePlaySectionNoteSequence,
    handleDeleteSectionNoteSequence,
    recording=false,
    playing=false
    )  {

    return (<Grid container xs={12} spacing={1}>
        <Grid item xs={3}>
            {show_record ? (
                recording == ns_type ?
                    (<IconButton onClick={(e) => handleRecordSectionNoteSequence(instrument, section_id, ns_type, 'stop', recording == ns_type)}>
                        <StopIcon />
                    </IconButton>) :
                    (<IconButton onClick={() => handleRecordSectionNoteSequence(instrument, section_id, ns_type, 'start', !recording)}>
                        <FiberManualRecordIcon />
                    </IconButton>)
            ) : null}
            {
                playing == ns_type ? 
                    (<IconButton onClick={() => handlePlaySectionNoteSequence(instrument, section_id, ns_type, 'stop', playing == ns_type)}>
                        <StopIcon />
                    </IconButton>) :
                    (<IconButton onClick={() => handlePlaySectionNoteSequence(instrument, section_id, ns_type, 'start', playing == ns_type)}>
                        <PlayCircleFilledIcon />
                    </IconButton>) 
            }
            <IconButton onClick={() => handleDeleteSectionNoteSequence(instrument, section_id, ns_type)}>
                <DeleteForeverIcon />
            </IconButton>
            <IconButton onClick={() => handleDownloadNoteSequence(instrument.track.sections[section_id][ns_type], buildVisualizerCanvasId(section_id, instrument.id, ns_type))}>
                <GetAppIcon />
            </IconButton>            
        </Grid>
        <Grid item xs={9} className="visualizerCanvas">
            <canvas id={buildVisualizerCanvasId(section_id, instrument.id, ns_type)}/>
        </Grid>
    </Grid>)
}

export function buildVisualizerCanvasId(section_id, instr_id, ns_type) {
    return 'section-' + section_id + '-' + instr_id  + '-' + ns_type
}

// -------------------------------------------------------------------------------
// RENDERING DETAILS
// -------------------------------------------------------------------------------

const buildActiveNote = (note) => {
    console.log('Within buildActiveNote ..')
}

const transformAndSaveMelody = (section_id, section, generatedSequence, handleChange) => {
    console.log('Inside transformAndSaveMelody ...')
    console.log(generatedSequence)
    let num_steps = section.stepsPerQuarter * 4 * section.numMeasures
    let generatedNotes = buildNoteSequence(generatedSequence, section.stepsPerQuarter, 70)
    console.log(generatedNotes)
    handleChange('generatedNotes', generatedNotes)
}

const visualizeRecorder = (noteSequence, canvasName, stepsPerQuarter, activeNote = null) => {
    if (noteSequence && noteSequence.notes) {
        console.log(noteSequence)
        visualzeNoteSequence(noteSequence, canvasName, activeNote)
    }
}

const recordCurrentNoteOn = (e, instr, section_id, section, ns_type) => {
    console.log('Inside recordCurrentNoteOn ...')
    console.log(ns_type)
    console.log(section_id)
    console.log(instr)
    visualizeRecorder(
        instr.recorder.getNoteSequence(),
        buildVisualizerCanvasId(section_id, instr.id, ns_type),
        section.stepsPerQuarter,
        buildActiveNote(e)
    )
}

const recordCurrentNoteOff = (e, instr, section_id, section, ns_type) => {
    console.log('Inside recordCurrentNoteOff ...')
    visualizeRecorder(
        instr.recorder.getNoteSequence(),
        buildVisualizerCanvasId(section_id, instr.id, ns_type),
        section.stepsPerQuarter,
        null
    )
}

const playNotes = (notes, player, current_time = Tone.now(), step_time = Tone.Time('16n')) => {
    for (let i in notes) {
        let note = notes[i]
        let note_duration = step_time * (note.quantizedEndStep - note.quantizedStartStep)
        let velocity = (note.velocity || 100) / 128
        player.triggerAttackRelease(
            Tone.Frequency(note.pitch, 'midi'),
            note_duration,
            current_time + step_time * note.quantizedStartStep,
            velocity
        )
    }
}
