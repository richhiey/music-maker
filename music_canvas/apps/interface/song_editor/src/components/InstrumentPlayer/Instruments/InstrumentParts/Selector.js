import React from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

function Selector(props) {
    let render_options = props.available_values.map((item, key) => {
        return <MenuItem key={key} value={item.info.value} active={item.info.name == props.selected}>{item.info.name}</MenuItem>
    });
    return (
        <FormControl style={{color: 'black',minWidth: 140}} className={props.name+'Selector'}>
            <InputLabel id={props.name + "-select-helper-label"}> {props.placeholder} </InputLabel>
            <Select
                labelId={props.name + "-select-helper-label"}
                id= {props.name + "-select-helper"}
                value={props.selected}
                onChange={(event) => props.handleChange(event, props.instrument_id)}
                placeholder={props.placeholder}
                variant='filled'
                color='inherit'
            >
                {render_options}
            </Select>
        </FormControl>
    );
}

export default Selector;