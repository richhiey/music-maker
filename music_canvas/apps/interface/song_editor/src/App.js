import React from 'react';

import Typography from '@material-ui/core/Typography';
import Canvas from './components/Canvas';
import Header from './components/Header';
import MIDIPiano from './components/MIDIPiano';
import {AppContext} from './store';
import {InstrumentContext} from './store';
import {PlayerContext} from './store';
import {AppReducer} from './reducers';
import {PlayerReducer} from './reducers';
import {InstrumentReducer} from './reducers';
import {parse, stringify} from 'flatted/esm';
import webmidi from 'webmidi'
import _ from 'lodash'
import {REQUIRED_NOTES} from './components/Constants'
import {SALAMANDER_GRAND_PIANO} from './components/Constants'
import {SGM_PLUS} from './components/Constants'
import {JAZZ_KIT} from './components/Constants'
import {MODEL_CHECKPOINTS} from './components/Constants'
const core = require('@magenta/music/node/core');
const Tone = core.Player.tone;
const musicvae = require('@magenta/music/node/music_vae');
const musicrnn = require('@magenta/music/node/music_rnn');

const initializeInstruments = (state) => {
    console.log('Initializing instruments from localStorage!')
    let instruments = state.instruments
    console.log(instruments)
    for (let i in instruments) {
        let instr = instruments[i]
        instr.id = i
        if (instr.type == 'midi-instrument') {            
            if (!instr.controller && instr.info.controller_name) {
                webmidi.enable(function (err) {
                    instr.controller = webmidi.getInputByName(instr.info.controller_name)
                })
            }
        }            
        if (instr.info.player_model_name) {
            let player_model = initializePlayerModel(instr.info.player_model_name)
            player_model.initialize().then(function(value) {
                instr.player_model = player_model
            })
            instr.info.player_model_type = MODEL_CHECKPOINTS[instr.info.player_model_name].model_type
        }
        let recorder = new core.Recorder()
        recorder.initialize().then(function(value) {
            instr.recorder = recorder
        })

        instr.player = initializePlayer(instr.type, instr.info.sgm_instr_id)
        instruments[i] = instr
    }
    return {instruments: instruments}
}

const cached_instruments = localStorage.getItem('instruments') ? 
            initializeInstruments(parse(localStorage.getItem('instruments'))) : null

const initializeApp = (state) => {
    console.log('Initializing app from localStorage!')
    navigator.requestMIDIAccess({sysex: true})
    return state
}

const cached_app_state = localStorage.getItem('appInitial') ? 
            initializeApp(parse(localStorage.getItem('appInitial'))) : null

const initializeTrackPlayer = (state) => {
    console.log('Initializing trackPlayer from localStorage!')
    return state
}

const cached_track_player = localStorage.getItem('playInitial') ? 
            initializeTrackPlayer(parse(localStorage.getItem('playInitial'))) : null

function createInstrument(soundfont, instr_sf_id) {
    let sampler = null
    let masterGain = new Tone.Gain(0.1).toMaster();
    let reverb = new Tone.Convolver(
        'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/hm2_000_ortf_48k.mp3'
    ).connect(masterGain);
    reverb.wet.value = 0.2;
    let echo = new Tone.FeedbackDelay('8n.', 0.2).connect(
        new Tone.Gain(0.3).connect(reverb)
    );
    let lowPass = new Tone.Filter(5000).connect(echo).connect(reverb);
    sampler = new Tone.Sampler(
        get_samples_files_for_instr(
            soundfont,
            instr_sf_id
        )
    ).connect(lowPass).toMaster()
    return sampler
}

function initializePlayer(type, instr_sf_id = null) {
    if (type == 'midi-instrument') {
        return createInstrument(SALAMANDER_GRAND_PIANO, 0)
    } else if (type == 'ai-instrument' && instr_sf_id) {
        return createInstrument(SGM_PLUS, instr_sf_id)
    } else if (type == 'drum-instrument') {
        return createInstrument(JAZZ_KIT, 'drums')
    }
}

function initializePlayerModel(model_name) {
    let magenta_player = null;
    let ckpt_info = MODEL_CHECKPOINTS[model_name];
    if (ckpt_info.model_type == 'musicvae') {
        magenta_player = new musicvae.MusicVAE(ckpt_info.url);
    } else if (ckpt_info.model_type == 'musicrnn') {
        magenta_player = new musicrnn.MusicRNN(ckpt_info.url);
    }
    return magenta_player
}

function get_samples_files_for_instr(soundfont, value) {
    let base = soundfont.base_url
    let samples = {}
    for (let i in soundfont.sf_instruments) {
        let instr = soundfont.sf_instruments[i]
        if (instr.info.value == value) {
            for (let n in REQUIRED_NOTES) {
                let note = REQUIRED_NOTES[n]
                let sample_file = base + '/' + instr.info.name + '/' + note.file_name
                samples[note.midi_note_num] = sample_file
            }
        }
    }
    return samples
}

// APP Component - This is the parent component for the interface
//---------------------------------------------------------------------------------
function App() {
    // REACT COMPONENT LIFECYCLE METHODS
    // ----------------------------------------------------------------------------- 
    const appInitial = cached_app_state || {}
    const instrumentInitial = cached_instruments || { instruments: [] }
    const playInitial = cached_track_player || { tempo: 70 }

    return (
        <div id='MainApp'>
            <AppContext.Provider value={React.useReducer(AppReducer, appInitial)}>
                <InstrumentContext.Provider value={React.useReducer(InstrumentReducer, instrumentInitial)}>
                    <PlayerContext.Provider value={React.useReducer(PlayerReducer, initializeTrackPlayer(playInitial))}>
                        <Header/>
                        <Canvas/>
                        <div id='piano'>
                            <MIDIPiano/>
                        </div>
                    </PlayerContext.Provider>
                </InstrumentContext.Provider>
            </AppContext.Provider>
        </div>
    );
}

export default App;
