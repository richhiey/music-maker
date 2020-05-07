import React from 'react';
import _ from 'lodash'
// Material UI
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import UpdateIcon from '@material-ui/icons/Update';
// Context and constants
import {InstrumentContext} from '../../../../store'
import {PlayerContext} from '../../../../store'
import {DEFAULT_STEPS_PER_QUARTER} from '../../../Constants'
import {DEFAULT_CHORD_SEQ} from '../../../Constants'
import {MAX_TEMPERATURE} from '../../../Constants'
// Helper functions
import {interpolateMelodies} from './TrackSectionHelper'
import {buildNoteSequence} from './TrackSectionHelper'
import {visualzeNoteSequence} from './TrackSectionHelper'
import {deleteNoteSequence} from './TrackSectionHelper'
import {generateDrumsVAE} from './TrackSectionHelper'
import {generateDrumsRNN} from './TrackSectionHelper'
import {generateMelodyVAE} from './TrackSectionHelper'
import {generateMelodyRNN} from './TrackSectionHelper'
import {startRecordingInstrument} from './TrackSectionHelper'
import {stopRecordingInstrument} from './TrackSectionHelper'
import {startPlayingInstrument} from './TrackSectionHelper'
import {stopPlayingInstrument} from './TrackSectionHelper'
import {create_switch} from './TrackSectionHelper'
import {create_selector} from './TrackSectionHelper'
import {create_numeric_value_setter} from './TrackSectionHelper'
import {create_expansion_panel} from './TrackSectionHelper'
import {isItemDisabled} from './TrackSectionHelper'
import {isItemVisible} from './TrackSectionHelper'
import {renderChordProgression} from './TrackSectionHelper'
import {buildVisualizerCanvasId} from './TrackSectionHelper'
import {processValueForKey} from './TrackSectionHelper'

import '../Instrument.css'
const core = require('@magenta/music/node/core');
const Tone = core.Player.tone;


function MelodyTrackSection(props) {

    // CONTEXT AND VARIABLE INITIALIZATION
    // ==================================================================================
    const classes = useStyles();
    const [instruments, instr_dispatch] = React.useContext(InstrumentContext)
    const [player, player_dispatch] = React.useContext(PlayerContext)
    const [recording, setRecording] = React.useState(false)
    const [playing, setPlaying] = React.useState(false)
    const [playerTransport, setPlayerTransport] = React.useState(false)

    let num_measures = 1
    if (props.section_meta) { num_measures = props.section_meta.numMeasures }
    let width = (props.section_meta.numMeasures) * 60 * (props.section_meta.repeat)
    let checked = true
    let current_instr = instruments.instruments[props.instr_id]

    let section_color = null
    if (props.section_meta.active) { section_color = 'green' }
    else { section_color = 'grey' }

    React.useEffect(() => {
        for (let i in instruments.instruments) {
            let instrument = instruments.instruments[i]
            for (let s in instrument.track.sections) {
                let section = instrument.track.sections[s]
                let reqd_canvas = ['generatedNotes', 'startNotes', 'endNotes']
                for (let r in reqd_canvas) {
                    let ns_type = reqd_canvas[r]
                    let canvasName = buildVisualizerCanvasId(props.section_id, instrument.id, ns_type)
                    visualzeNoteSequence(section[ns_type], canvasName)
                }
            }
        }
    }, instruments)
    // -------------------------------------------------------------------------------

    // EVENT HANDLERS 
    // ===============================================================================
    const handleValueChange = (key, value) => {
        console.log('Inside handleValueChange ... (' + key + ' - ' + value + ')')
        props.handleChange(props.section_id, key, processValueForKey(key, value))
    }

    const handleDisplayItem = (section, item) => {
        return isItemVisible(section, item)
    }

    const handleDisableItem = (section, item) => {
        return isItemDisabled(section, item)
    }

    const handleDeleteSectionNoteSequence = (instrument, section_id, ns_type) => {
        console.log('Inside handleDeleteSectionNoteSequence ...')
        let canvas_name = buildVisualizerCanvasId(section_id, instrument.id, ns_type)
        const context = document.getElementById(canvas_name).getContext('2d');
        context.canvas.width = context.canvas.width
        context.canvas.height = context.canvas.height
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        props.handleChange(section_id, ns_type, null)
    }

    const handleGeneration = (instrument, transform_action = null) => {
        console.log('Inside handleGeneration ..')
        const is_musicrnn = instrument.info.player_model_type == 'musicrnn'
        const is_drum_instrument = instrument.type == 'drum-instrument' 
        if (is_drum_instrument) {
            console.log('Deal with drum generation!!')
            if (is_musicrnn) { generateDrumsRNN() }
            else { generateDrumsVAE() }
        } else {
            if (is_musicrnn) { generateMelodyRNN(props.section_id, props.section_meta, instrument, handleValueChange) }
            else { generateMelodyVAE(props.section_id, props.section_meta, instrument, handleValueChange) }
        }
    }

    const handleRecordSectionNoteSequence = (instrument, section_id, ns_type, action, current) => {
        console.log('Inside handleRecordSectionNoteSequence ...')
        console.log(section_id)
        console.log(recording)
        console.log(ns_type)
        console.log(playing)
        console.log(current)
        if (action == 'start') { 
            setRecording(ns_type)
            startRecordingInstrument(
                instrument,
                section_id,
                props.section_meta,
                ns_type,
                player.tempo,
                current
            )
        } else {
            setRecording(false)
            stopRecordingInstrument(
                instrument,
                section_id,
                props.section_meta,
                ns_type,
                handleValueChange,
            )
        }
    }

    const handlePlaySectionNoteSequence = (instrument, section_id, ns_type, action, current=false) => {
        console.log('Inside handlePlaySectionNoteSequence ...')
        console.log(current)
        if (action == 'start') { 
            startPlayingInstrument(
                instrument, 
                section_id,
                ns_type,
                props.section_meta,
                player.tempo,
                current
            )
            setPlaying(ns_type)
        }
        else {
            stopPlayingInstrument(instrument, ns_type)
            setPlaying(false)
        }
    }
    
    const create_grid = (size, content) => {
        return (
            <Grid item xs={size}>
                {content}
            </Grid>)
    }

    const createNoteSequencePanel = (title, instrument, ns_type, recording, playing, disabled=false, show_record=true) => {
        return create_expansion_panel(
                        title,
                        current_instr,
                        ns_type,
                        props.section_id,
                        handleRecordSectionNoteSequence,
                        handlePlaySectionNoteSequence,
                        handleDeleteSectionNoteSequence,
                        disabled,
                        show_record,
                        recording,
                        playing
                    )
    }
    // ----------------------------------------------------------------------------------------
    
    // RENDER FUNCTION 
    // ========================================================================================
    return (
        <div className='trackSection' style={{width: width + 'px', height: '30px', 'background-color': section_color}}>
            <Container className='melodyTrackSection trackSectionForm' style={{width: '60vw'}}>
                <Grid container xs={12} spacing={1}>
                    { 
                        create_grid(2, create_switch(
                            'Active',
                            props.section_meta.active,
                            (e) => { handleValueChange('active', !props.section_meta.active) }
                        )
                    )}
                    {
                        create_grid(2, create_selector(
                            'Measures',
                            props.section_meta.numMeasures,
                            (e) => { handleValueChange('numMeasures', e.target.value)}
                        ))
                    }
                    {
                        create_grid(2, create_selector(
                            'Repeat',
                            props.section_meta.repeat,
                            (e) => { handleValueChange('repeat', e.target.value) }
                        ))
                    }
                    { props.section_meta.active ?
                        (
                            create_grid(2, create_numeric_value_setter(
                                'Temperature',
                                props.section_meta.temperature,
                                (value) => { handleValueChange('temperature', value) }
                            ))
                        ) : null
                    }
                    { props.section_meta.active ?
                        (
                            create_grid(2, create_numeric_value_setter(
                                'Steps per Quarter',
                                props.section_meta.stepsPerQuarter,
                                (value) => { handleValueChange('stepsPerQuarter', value) }
                            ))
                        ) : null
                    }
                </Grid>
                {current_instr && props.section_meta.active ?
                    (
                    <Grid container xs={12} spacing={3}>
                        {(current_instr.type == 'ai-instrument') ?
                            (
                                create_grid(3,create_switch(
                                    'Interpolate',
                                    props.section_meta.interpolate,
                                    (e) => handleValueChange('interpolate', !props.section_meta.interpolate)
                                ))
                            ):
                            (
                                create_grid(3,create_switch(
                                    'Generate Melody',
                                    props.section_meta.melody,
                                    (e) => handleValueChange('melody', !props.section_meta.melody)
                                ))
                            )
                        }
                        {create_grid(2, (<Button 
                            onClick={(e) => handleGeneration(current_instr)}
                            color='primary'
                            variant='contained'
                            aria-label="menu">
                                {
                                    current_instr.type == 'midi-instrument' ?
                                    (
                                        props.section_meta.melody ? 
                                        ('Generate Melody') : ('Arpeggiate') 
                                    ) : (
                                        props.section_meta.interpolate ?
                                        ('Interpolate') : ('Continue Sequence')
                                    )
                                }

                            </Button>                        
                        ))}
                    </Grid>
                    ) : null
                }
                {props.section_meta.generatedNotes ? (
                    createNoteSequencePanel('Generated Sequence', current_instr, 'generatedNotes', recording ,playing)
                ): null}
                {(props.section_meta.startNotes || props.section_meta.active) ? (
                    createNoteSequencePanel('Start Sequence', current_instr, 'startNotes', recording, playing)
                ): null}
                {props.section_meta.interpolate ? (
                    createNoteSequencePanel('End Sequence', current_instr, 'endNotes', recording, playing)
                ): null}
            </Container>
        </div>
    );
}


const green_button= {
    'background-color': 'green',
    'border': '1px solid black'
}
const grey_button = {
    'background-color': 'grey',
    'border': '1px solid black'
}
const useStyles = makeStyles(theme => ({
    green_button: {
        'background-color': 'green',
        'min-width': '30px',
        'min-height': '30px',
        'border': '1px solid black'
    },
    red_button: {
        'background-color': 'orange',
        'min-width': '30px',
        'min-height': '30px',
        'border': '1px solid black'
    },
    grey_button: {
        'background-color': 'grey',
        'min-width': '30px',
        'min-height': '30px',
        'border': '1px solid black'
    },
    blue_button: {
        'background-color': '#b2eff5',
        'min-width': '30px',
        'min-height': '30px',
        'border': '1px solid black'        
    }
}));


export default MelodyTrackSection;