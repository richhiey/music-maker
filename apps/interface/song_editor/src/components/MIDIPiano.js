import React from 'react';
import Piano from './Piano/Piano';
import KeyboardShortcuts from './Piano/KeyboardShortcuts';
import MidiNumbers from './Piano/MidiNumbers';
import SoundfontProvider from './Piano/SoundfontProvider'
import { InstrumentContext } from '../store';

// CONSTANTS
//---------------------------------------------------------------------------------
const DURATION_UNIT = 0.2;
const DEFAULT_NOTE_DURATION = DURATION_UNIT;

const noteRange = {
  first: MidiNumbers.fromNote('c3'),
  last: MidiNumbers.fromNote('c7'),
};
const _keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: noteRange.first,
  lastNote: noteRange.last,
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

//---------------------------------------------------------------------------------

// MIDIPiano Component
//---------------------------------------------------------------------------------
class MIDIPiano extends React.Component {
    static contextType = InstrumentContext;

    constructor(props) {
        super(props);
        const instruments = this.context;
        this.instruments = instruments;
        this.state = {
            noteDuration: DEFAULT_NOTE_DURATION,
            firstNote: noteRange.first,
            lastNote: noteRange.last,
            transpose: 0,
            musical_key: 'C',
            keyboardShortcuts: _keyboardShortcuts,
            currentEvents: [],
            //player: new core.SoundFontPlayer(SOUNDFONT_URL),
            disabled: false
        }
    }

    // REACT COMPONENT LIFECYCLE METHODS
    //---------------------------------------------------------------------------------
    componentDidMount() {
        //this.loadPianoSoundfont();
        this.setState({active: true});
    }

    render() {
        const currentEvents = this.state.currentEvents;
        currentEvents.map(event => event.midiNumber);

        return (
            <SoundfontProvider
                instruments = {this.instruments}
                render={({ isLoading, playNote, stopNote }) => (
                    <Piano
                        noteRange={noteRange}
                        width={300}
                        playNote={playNote}
                        stopNote={stopNote}
                        disabled={isLoading}
                        keyboardShortcuts={_keyboardShortcuts}
                    />
                )}
            />
        );
    }
    //---------------------------------------------------------------------------------

    // HELPER FUNCTIONS
    //---------------------------------------------------------------------------------
    loadPianoSoundfont() {
        console.log('Started loading soundfont for piano ..');
        this.state.player.loadAllSamples();
        console.log('Piano is ready!');
    }

    onPlayNoteInput = midiNumber => {
        this.setState({
            notesRecorded: false,
        });
    };

    onStopNoteInput = (midiNumber, { prevActiveNotes }) => {
        if (this.state.notesRecorded === false) {
            this.recordNotes(prevActiveNotes, this.state.noteDuration);
            this.setState({
                notesRecorded: true,
                noteDuration: DEFAULT_NOTE_DURATION,
            });
        }
    };

    recordNotes = (midiNumbers, duration) => {
        if (this.state.mode !== 'RECORDING') {
            return;
        }
        const newEvents = midiNumbers.map(midiNumber => {
            return {
                midiNumber,
                time: this.state.currentTime,
                duration: duration,
            };
        });
        
        this.state.events = this.state.events.concat(newEvents);
        this.state.currentTime = this.state.currentTime + duration;
    };

    _playNote = (note) => {
        //this.player.playNote(note);
        console.log('PLAYED NOTE!');
    }

    _stopNote = (note) => {
        //this.state.player.playNoteUp(note);
        console.log('STOPPED NOTE!');
    }
    //---------------------------------------------------------------------------------
}


export default MIDIPiano;