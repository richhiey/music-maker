import React from 'react';
import {Instrument} from "./Instruments";
import {AIInstrument} from "./Instruments";
import Icon from '@material-ui/core/Icon';
import {InstrumentContext} from '../../store';
const core = require('@magenta/music/node/core');

const MAGENTA_CHECKPOINTS_META_URL = 'https://raw.githubusercontent.com/tensorflow/magenta-js/master/music/checkpoints/checkpoints.json';
const SGM_SOUNDFONT_META_URL = 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus/soundfont.json';

const INITIAL_TEMPO = 70;

// InstrumentPlayer Component - This is the parent component for the interface
//---------------------------------------------------------------------------------

function InstrumentPlayer() {
    // REACT COMPONENT LIFECYCLE METHODS
    //---------------------------------------------------------------------------------
        const [state, dispatch] = React.useContext(InstrumentContext);

        let instruments = state.instruments.map(function(instrument, index){
            if (instrument.type == 'midi-instrument') {
                return <Instrument
                            instrument={instrument}
                            instr_dispatch={dispatch}
                        />;
            } else if (instrument.type == 'ai-instrument') {
                return <AIInstrument
                            instrument={instrument}
                            instr_dispatch={dispatch}
                        />;
            }
            
        });
		return(
			<div className="InstrumentPlayer">
                <div className = "Instruments">
    				{instruments}
    			</div>
    		</div>
    	)
    }
    //---------------------------------------------------------------------------------


export default InstrumentPlayer;