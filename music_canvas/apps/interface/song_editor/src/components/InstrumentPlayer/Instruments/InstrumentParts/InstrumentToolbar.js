import React from 'react';
import { IconButton } from '@material-ui/core';
import { Icon } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import {InstrumentContext} from '../../../../store';
import './InstrumentParts.css';

function InstrumentToolbar(props) {
    const [instruments, instr_dispatch] = React.useContext(InstrumentContext);

    const handleCloseThisInstrument = (id) => {
        console.log('Handler for closing instrument track!');
        console.log(props);
        instr_dispatch({
            type: 'REMOVE_INSTRUMENT',
            id: id,
        });
    };

    const handleResetInstrumentTrack = (id) => {
        console.log('Handler for closing instrument track!');
        console.log(props);
        instr_dispatch({
            type: 'REMOVE_TRACK_SECTION',
            info: {
                instr_id: id,
            },
        });
    };


    return (
        <div>
        <IconButton className='instrumentButton' onClick={() => handleResetInstrumentTrack(props.instrument_id)}>
            <DeleteIcon/>
        </IconButton>
        <IconButton className='instrumentButton' onClick={() => handleCloseThisInstrument(props.instrument_id)} color="inherit">
            <CloseIcon/>
        </IconButton>
        </div>
    );
}

export default InstrumentToolbar;