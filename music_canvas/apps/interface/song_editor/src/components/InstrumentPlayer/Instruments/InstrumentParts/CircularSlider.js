import React from 'react';
import { CircleSlider } from "react-circle-slider";

function CircularSlider(props) {
    
    const handleChange = value => {
        props.handleChangeContext(props.name_key, value, props.instrument_id);
    };
    return(
        <span>
        <CircleSlider
            value={props.value}
            onChange={handleChange}
            size={45}
            knobRadius={4}
            progressWidth={5}
            circleWidth={7}/>
            {props.name}
        </span>
    );
}

export default CircularSlider;