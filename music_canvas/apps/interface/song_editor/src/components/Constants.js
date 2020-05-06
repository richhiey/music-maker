import * as Note from "tonal-note"
const core = require('@magenta/music/node/core');
const Tone = core.Player.tone;

let start = 21
let num_notes = 106
let required_notes = Array.from({length: num_notes}, (x,i) => start + i)

let temp = []
for (let n in required_notes) {
    let note = required_notes[n]
    let file_name = 'p' + note + '_' + 'v127' + '.mp3'
    temp = temp.concat({file_name: file_name, midi_note_num: note})
}

export const REQUIRED_NOTES = temp

export const DEFAULT_TRACK_NUMBER = 30

export const MAX_TEMPERATURE = 1.5

export const DEFAULT_STEPS_PER_QUARTER = 4

export const DEFAULT_CHORD_SEQ = ['Dm', 'Am', 'F', 'G']

export const SALAMANDER_GRAND_PIANO = {
    base_url: 'https://storage.googleapis.com/magentadata/js/soundfonts/salamander',
    sf_instruments: [
        {info: {value: 0, name: 'acoustic_grand_piano'}}
    ]
}

export const JAZZ_KIT = {
    base_url: 'https://storage.googleapis.com/magentadata/js/soundfonts/jazz_kit',
    sf_instruments: [
        {info: {value: 0, name: 'jazz_kit'}}
    ]
}

export const AVAILABLE_PLAYER_MODELS = [
    {info: { name: 'Music-RNN', value: 'chord_pitches_improv' }},
    {info: { name: 'Music-VAE', value: 'mel_chords' }}
];

export const AVAILABLE_DRUMMER_MODELS = [
    {info: { name: 'DrumKit-RNN', value: 'drum_kit_rnn' }},
];

export const SGM_INSTRUMENT_NUMBERS = [
    {info: {value: 0, name: "acoustic_grand_piano"}},
    {info: {value: 2, name: "electric_grand_piano"}},
    {info: {value: 13, name: "xylophone"}},
    {info: {value: 24, name: "acoustic_guitar_nylon"}},
    {info: {value: 25, name: "acoustic_guitar_steel"}},
    {info: {value: 28, name: "electric_guitar_muted"}},
    {info: {value: 29, name: "overdriven_guitar"}},
    {info: {value: 30, name: "distortion_guitar"}},
    {info: {value: 31, name: "guitar_harmonics"}},
    {info: {value: 32, name: "acoustic_bass"}},
    {info: {value: 33, name: "electric_bass_finger"}},
    {info: {value: 34, name: "electric_bass_pick"}},
    {info: {value: 35, name: "fretless_bass"}},
    {info: {value: 36, name: "slap_bass_1"}},
    {info: {value: 37, name: "slap_bass_2"}},
    {info: {value: 38, name: "synth_bass_1"}},
    {info: {value: 39, name: "synth_bass_2"}},
    {info: {value: 40, name: "violin"}},
    {info: {value: 42, name: "cello"}},
    {info: {value: 48, name: "string_ensemble_1"}},
    {info: {value: 49, name: "string_ensemble_2"}},
    {info: {value: 50, name: "synthstrings_1"}},
    {info: {value: 51, name: "synthstrings_2"}},
    {info: {value: 52, name: "choir_aahs"}},
    {info: {value: 53, name: "voice_oohs"}},
    {info: {value: 54, name: "synth_voice"}},
];

export const SGM_PLUS = {
    base_url: 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus',
    sf_instruments: SGM_INSTRUMENT_NUMBERS
}

export const MODEL_CHECKPOINTS = {
    "chord_pitches_improv": {
        model_type: 'musicrnn',
        url: 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv' 
    },
    "drum_kit_rnn": {
        model_type: 'musicrnn',
        url: "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/drum_kit_rnn"
    },
    "mel_chords": {
        model_type: 'musicvae', 
        url: "https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_chords"
    },
    "tap2drum_1bar": {
        model_type: 'musicvae',
        url: "https://storage.googleapis.com/magentadata/js/checkpoints/groovae/tap2drum_1bar"
    },
    "tap2drum_2bar": {
        model_type: 'musicvae',
        url: "https://storage.googleapis.com/magentadata/js/checkpoints/groovae/tap2drum_2bar"
    },
    "tap2drum_3bar": {
        model_type: 'musicvae',
        url: "https://storage.googleapis.com/magentadata/js/checkpoints/groovae/tap2drum_3bar"
    },
    "tap2drum_4bar": {
        model_type: 'musicvae', 
        url: "https://storage.googleapis.com/magentadata/js/checkpoints/groovae/tap2drum_4bar"
    },
    "groovae_4bar": {
        model_type: 'musicvae',
        url: "https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/groovae_4bar"
    },
}

export const DEFAULT_SOUND_CONFIG = [
    { title: 'Echo', key: 'echo', value: 30 },
    { title: 'Reverb', key: 'reverb', value: 30 },
    { title: 'Delay', key: 'delay', value: 30 },
    { title: 'Volume', key: 'volume', value: 30 }
]

export const DRUM_CLASSES = [
  'Kick',
  'Snare',
  'Hi-hat closed',
  'Hi-hat open',
  'Tom low',
  'Tom mid',
  'Tom high',
  'Clap',
  'Crash'
];