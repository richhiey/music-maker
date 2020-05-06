import React from 'react';
import { InstrumentPlayer } from './InstrumentPlayer';
import { makeStyles } from '@material-ui/core/styles';
import Box from "@material-ui/core/Box";

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        'padding-top': "10px",
        'background-color': 'white',
        'height': '67vh',
        'width': '98vw',
        'overflow-y': 'auto',
        'overflow-x': 'auto',
    },
}));

// Canvas Component
//---------------------------------------------------------------------------------
function Canvas() {
    const classes = useStyles();

    // REACT COMPONENT LIFECYCLE METHODS
    //---------------------------------------------------------------------------------
    return(
        <Box className={classes.root}>
            <InstrumentPlayer/>
        </Box>
    );
    //---------------------------------------------------------------------------------
}

export default Canvas;
