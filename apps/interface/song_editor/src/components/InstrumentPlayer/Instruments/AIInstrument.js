import React from 'react';
import Grid from '@material-ui/core/Grid';

import {InstrumentSwitch} from './InstrumentParts';
import {Selector} from './InstrumentParts';
import {CircularSlider} from './InstrumentParts';
import {InstrumentToolbar} from './InstrumentParts';
import {InstrumentTrack} from './InstrumentParts';
import {SGM_INSTRUMENT_NUMBERS} from '../../Constants'
import {AVAILABLE_PLAYER_MODELS} from '../../Constants'



function AIInstrument(props) {

    const handleSoundConfigContext = (key, value, instr_id) => {
        props.instr_dispatch({
            type: 'CHANGE_SOUND_CONFIG',
            info: {
                instr_id: instr_id,
                name: key,
                value: value,
            },
        });
    };

    const handleUpdateTrack = (instr_id, section_id, key, value) => {
        props.instr_dispatch({
            type: 'UPDATE_INSTRUMENT_TRACK',
            info: {
                instr_id: instr_id,
                instr_type: props.instrument.type,
                section_info: {
                    name: key,
                    value: value,
                    section_id: section_id
                } 
            },
        });
    }

    const handleChangePlayerModel = (event) => {
        props.instr_dispatch({
            type: 'CHANGE_PLAYER_MODEL',
            info: {
                instr_id: props.instrument.id,
                value: event.target.value
            }
        });
    };
    
    const handleChangeInstrument = (event) => {
        props.instr_dispatch({
            type: 'CHANGE_INSTRUMENT',
            info: {
                instr_id: props.instrument.id,
                value: event.target.value,
            },
        });
    };

    let sound_config_sliders = []
    for (let i in props.instrument.sound_configs) {
        let config_value = props.instrument.sound_configs[i]
        sound_config_sliders = sound_config_sliders.concat(<CircularSlider 
            name = {config_value.title}
            name_key = {config_value.key}
            value = {config_value.value}
            handleChangeContext = {handleSoundConfigContext}
            instrument_id = {props.instrument.id}
        />)
    };


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
                        name = 'Player Model'
                        instrument_id = {props.instrument.id}
                        available_values={AVAILABLE_PLAYER_MODELS}
                        selected={props.instrument.info.player_model_name}
                        handleChange={ handleChangePlayerModel }
                        placeholder='Player Model'
                    />
                </Grid>

                <Grid item lg={2}>
                    <Selector
                        name = 'Instrument'
                        instrument_id = {props.instrument.id}
                        available_values={SGM_INSTRUMENT_NUMBERS}
                        selected={props.instrument.info.sgm_instr_id}
                        handleChange={ handleChangeInstrument }
                        placeholder='Instrument'
                    />
                </Grid>

                <Grid item lg={4}>
                    {sound_config_sliders}
                </Grid>

                <Grid item lg={3}>
                    <InstrumentToolbar
                        instrument_id={props.instrument.id}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
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

export default AIInstrument;