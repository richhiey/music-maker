import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import {InstrumentContext} from '../../../../store'
import TrackSection from './TrackSection'
import AddBoxIcon from '@material-ui/icons/AddBox';
import IconButton from '@material-ui/core/IconButton';
import {DEFAULT_SEQ_LEN} from '../../../Constants'

function InstrumentTrack(props) {

    const handleUpdateSection = (section_id, key, value) => {
        console.log(`Changed value ${value}`);
        props.instr_dispatch({
            type: 'UPDATE_TRACK_BAR',
            info: {
                instr_id: props.instrument_id,
                name: key,
                value: value,
                section_id: section_id
            },
        });
    }

    const handleAddSection = () => {
        console.log('Adding new section to track!')
        let new_section = {
            numMeasures: 1,
            repeat: 1,
            active: false,
            temperature: 70,
            stepsPerQuarter: 8,
            autoArpeggiate: false,
            interpolate: false,
            usePrev: false,
            concatInput: false,
            chordProg: ['Dm', 'Am', 'F', 'G'], 
            generatedNotes: null,
            startNotes: null,
            endNotes: null
        }
        props.instr_dispatch({
            type: 'ADD_TRACK_SECTION',
            info: {
                instr_id: props.instrument_id,
                new_section: new_section 
            },
        });
    }

    const handleRemoveSection = (section_id) => {
        console.log('Adding new section to track!')
        props.instr_dispatch({
            type: 'REMOVE_TRACK_SECTION',
            info: {
                instr_id: props.instr_id,
                info: { value: section_id } 
            },
        });
    }

    const render_track = props.track.sections.map((item, key) => {
        return <TrackSection
                    handleChange = {handleUpdateSection}
                    handleRemove = {handleRemoveSection}
                    section_id = {key}
                    section_meta = {item}
                    instr_id = {props.instrument_id}
                />
    });

    return (
        <div className='trackButton'>
            {render_track}
            <div className='addSection'>
                <IconButton onClick={handleAddSection}>
                    <AddBoxIcon />
                </IconButton>
            </div>
        </div>
    );
}

export default InstrumentTrack;