import React from 'react';
import webmidi from 'webmidi'
import Grid from '@material-ui/core/Grid';

import {InstrumentSwitch} from './InstrumentParts';
import {Selector} from './InstrumentParts';
import {CircularSlider} from './InstrumentParts';
import {InstrumentToolbar} from './InstrumentParts';
import {InstrumentTrack} from './InstrumentParts';

import './Instrument.css';


function Instrument(props) {

    const _available_controllers = (only_names = false) => {
        const inputs = webmidi.inputs;
        let controllers = [];
        for (let input in inputs) {
            if (only_names) {
                controllers.push(
                    {info: {name: inputs[input].name, value: inputs[input].name}}
                )    
            } else {
                controllers.push(
                    {info: {name: inputs[input].name, value: inputs[input]}}
                )
            }
        }
        return controllers;
    }

    const handleChangeController = (event) => {
        console.log(event)
        props.instr_dispatch({
            type: 'CHANGE_CONTROLLER',
            info: {
                name: event.target.value,
                instr_id: props.instrument.id
            },
        });
    }

    const handleSoundConfigContext = (key, value, id) => {
        props.instr_dispatch({
            type: 'CHANGE_SOUND_CONFIG',
            info: {
                instr_id: id,
                name: key,
                value: value, 
            },
        });
    };


    let sound_config_sliders = []
    for (let i in props.instrument.sound_configs) {
        let config_value = props.instrument.sound_configs[i]
        sound_config_sliders = sound_config_sliders.concat(
            <CircularSlider
            name = {config_value.title}
            name_key = {config_value.key}
            value = {config_value.value}
            handleChangeContext = {handleSoundConfigContext}
            instrument_id = {props.instrument.id}
            />
        )
    };

    let selected_controller = props.instrument.controller
    if (selected_controller) { selected_controller = selected_controller.name }
    return (
        <div className='Instrument'>
            <Grid container spacing={3}> 
                <Grid item lg={1}>
                    <InstrumentSwitch
                        instrument = {props.instrument}
                        instr_dispatch = {props.instr_dispatch}
                    />
                </Grid>
                
                <Grid item lg={2}>
                    <Selector
                        selected = {props.instrument.info.controller_name}
                        available_values = {_available_controllers(true)}
                        name = 'MIDI Controller'
                        handleChange = { handleChangeController }
                        placeholder = 'MIDI Controller'
                        instrument_id = {props.instrument.id}
                        className = 'selector_text'
                    />
                </Grid>
                <Grid item lg={2}>
                </Grid>
                <Grid item lg={4}>
                    {sound_config_sliders}
                </Grid>

                <Grid item lg={3}>
                    <InstrumentToolbar
                        instrument_id = {props.instrument.id}
                    />
                </Grid>
            </Grid>
            
            <Grid container spacing={1}>
                <Grid item lg={12}>
                    <InstrumentTrack 
                        track = {props.instrument.track}
                        instr_dispatch = {props.instr_dispatch}
                        instrument_id = {props.instrument.id}
                    />
                </Grid>
            </Grid>
        </div>
    );
}

export default Instrument;