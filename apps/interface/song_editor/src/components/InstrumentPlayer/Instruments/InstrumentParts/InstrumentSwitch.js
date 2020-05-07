import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import {InstrumentContext} from '../../../../store';

const useStyles = makeStyles(theme => ({
    green_button: {
        'background-color': 'green',
        'min-width': '30px',
        'min-height': '20px',
        'margin': '5px',
    },
    red_button: {
        'background-color': 'orange',
        'min-width': '30px',
        'min-height': '20px',
        'margin': '5px',
    },
    grey_button: {
        'background-color': 'grey',
        'min-width': '30px',
        'min-height': '20px',
        'margin': '5px',
    }
}));

function InstrumentSwitch(props) {
    const classes = useStyles();

    const handleActiveClick = (value) => { 
        props.instr_dispatch({
            type: 'TOGGLE_ACTIVE',
            value: value,
            instr_id: props.instrument.id
        });
    }

    const handleSoloClick = (value) => {    
        props.instr_dispatch({
            type: 'TOGGLE_SOLO',
            value: value,
            instr_id: props.instrument.id
        });

    }

    let active = props.instrument.active
    let solo = props.instrument.solo

    return (
        <div className='instrumentSwitch'>
                <Button 
                    classes={
                        {
                            root: active ? 
                                (classes.green_button) : (classes.grey_button)
                        }
                    }
                    active = {active}
                    onClick = {(e) => handleActiveClick(!active)}
                />
                <Button 
                    classes={
                        {
                            root: solo ?
                                (classes.red_button) : (classes.grey_button)
                        }
                    }
                    onClick = {(e) => handleSoloClick(!solo)}
                />
        </div>
    );
}

export default InstrumentSwitch;