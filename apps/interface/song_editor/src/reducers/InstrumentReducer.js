import {SALAMANDER_GRAND_PIANO} from '../components/Constants'
import {SGM_PLUS} from '../components/Constants'
import {JAZZ_KIT} from '../components/Constants'
import {SGM_INSTRUMENT_NUMBERS} from '../components/Constants'
import {REQUIRED_NOTES} from '../components/Constants'
import {parse, stringify} from 'flatted/esm';
import _ from 'lodash'

const InstrumentReducer = (state, action) => {
    let instruments = state.instruments
    let new_state = null
    switch (action.type) {
        case 'ADD_INSTRUMENT':
            console.log('ADD_INSTRUMENT - Dispatched to reducer!');
            new_state = {
                instruments: instruments.concat(action.new_instrument)
            };
            localStorage.setItem('instruments', stringify(new_state))
            return new_state

        case 'REMOVE_INSTRUMENT':
            console.log('REMOVE_INSTRUMENT - Dispatched to reducer!');
            let new_instruments = instruments.filter((item) => {
                return item.id !== action.id;
            });
            for (let i in new_instruments) {
                new_instruments[i].id = i
            }
            new_state = {
                instruments: new_instruments
            };
            localStorage.setItem('instruments', stringify(new_state))
            return new_state

        case 'CHANGE_INSTRUMENT':
            console.log('CHANGE_INSTRUMENT - Dispatched to reducer');
            let _instr = instruments[action.info.instr_id];
            _instr.info.sgm_instr_id = action.info.value
            instruments[action.info.instr_id] = _instr
            new_state = {
                instruments: instruments
            };
            localStorage.setItem('instruments', stringify(new_state))
            return new_state

        case 'CHANGE_CONTROLLER':
            console.log('CHANGE_CONTROLLER - Dispatched to reducer');
            let instrs = instruments;
            instrs[action.info.instr_id].info.controller_name = action.info.name
            new_state = {
                instruments: instrs
            };
            localStorage.setItem('instruments', stringify(new_state))
            return new_state

        case 'CHANGE_PLAYER_MODEL':
            console.log('CHANGE_C_MODEL - Dispatched to reducer');
            let pinstr = instruments[action.info.instr_id]
            pinstr.info.player_model_name = action.info.value
            instruments[action.info.instr_id] = pinstr
            new_state = {
                instruments: instruments
            };
            localStorage.setItem('instruments', stringify(new_state))
            return new_state

        case 'DELETE_ALL_INSTRUMENTS':
            console.log('DELETE_ALL_INSTRUMENTS - Dispatched to reducer');
            new_state = {
                instruments: []
            };
            localStorage.setItem('instruments', stringify(new_state))
            return new_state

        case 'RECORD_NOTE_EVENT':
            console.log('RECORD_INSTRUMENT - Dispatched to reducer');
            let instrument = instruments[action.info.instr_id];
            if (action.info.record) {
                instrument.recorded_notes = instrument.recorded_notes.concat(action.info.value);
            } else {
                instrument.temp_note_store = instrument.temp_note_store.concat(action.info.value);
            }
            instruments[action.info.instr_id] = instrument;
            new_state = state;
            localStorage.setItem('instruments', stringify(new_state))
            return new_state

        case 'CHANGE_SOUND_CONFIG':
            console.log('CHANGE_SOUND_CONFIG - Dispatched to reducer');
            let _v_instrs = instruments;
            let sound_config_name = action.info.name;
            let sound_config_val = action.info.value;
            let instr_id = action.info.instr_id;
            for (let i in _v_instrs[instr_id].sound_configs) {
                let config = _v_instrs[instr_id].sound_configs[i]
                if (config.key == sound_config_name) {
                    _v_instrs[instr_id].sound_configs[i].value = sound_config_val
                }
            }
            new_state = {
                instruments: _v_instrs
            };
            localStorage.setItem('instruments', stringify(new_state))
            return new_state

        case 'TOGGLE_ACTIVE':
            console.log('TOGGLE_ACTIVE - Dispatched to reducer');
            let ta_instrs = instruments;
            let ta_instr = ta_instrs[action.instr_id]
            if (action.value) {
                ta_instr.solo = false
            }
            ta_instr.active = action.value
            ta_instrs[action.instr_id] = ta_instr
            new_state = {
                instruments: ta_instrs
            };
            localStorage.setItem('instruments', stringify(new_state))
            return new_state

        case 'TOGGLE_SOLO':
            console.log('TOGGLE_SOLO - Dispatched to reducer');
            let ts_instrs = instruments;
            for (let i in ts_instrs) {
                let instr = ts_instrs[i]
                instr.active = !action.value
                if (action.value) { instr.solo = !action.value }
            }
            ts_instrs[action.instr_id].solo = action.value
            new_state = {
                instruments: ts_instrs
            };
            localStorage.setItem('instruments', stringify(new_state))
            return new_state

        case 'UPDATE_TRACK_BAR':
            console.log('UPDATE_TRACK_BAR - Dispatched to reducer');
            let u_instr = instruments[action.info.instr_id]
            u_instr.track.sections[action.info.section_id][action.info.name] = action.info.value
            instruments[action.info.instr_id] = u_instr
            new_state = {
                instruments: instruments
            };
            localStorage.setItem('instruments', stringify(new_state))
            return new_state

        case 'ADD_TRACK_SECTION':
            console.log('ADD_TRACK_SECTION - Dispatched to reducer');
            let instr = instruments[action.info.instr_id]
            instr.track.sections.push(action.info.new_section)
            instruments[action.info.instr_id] = instr
            new_state = {
                instruments: instruments
            };
            localStorage.setItem('instruments', stringify(new_state))
            return new_state

        case 'REMOVE_TRACK_SECTION':
            console.log('REMOVE_TRACK_SECTION - Dispatched to reducer');
            if (action.info.section_id) {
                instruments[action.info.instr_id].track.splice(action.info.section_id, 1) 
            } else {
                instruments[action.info.instr_id].track.sections = []
            }
            new_state = {
                instruments: instruments
            };
            localStorage.setItem('instruments', stringify(new_state))
            return new_state

    }
};

export default InstrumentReducer;