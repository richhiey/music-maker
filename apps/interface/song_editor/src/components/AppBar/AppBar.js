import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import StopIcon from '@material-ui/icons/Stop';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import MenuIcon from '@material-ui/icons/Menu';
import LoopIcon from '@material-ui/icons/Loop';
import Drawer from '@material-ui/core/Drawer';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {InstrumentContext} from '../../store'
import {PlayerContext} from '../../store'
import {AppContext} from '../../store'
import Grid from '@material-ui/core/Grid';
import {AppName}  from './AppBarItems'
import {MessageBox}  from './AppBarItems'
import {PlayerControls}  from './AppBarItems'
import {Settings}  from './AppBarItems'

const core = require('@magenta/music/node/core');

// ---------------------------------------------------------------------------------
// HEADER Component - This is the parent component for the interface
// ---------------------------------------------------------------------------------
function Header() {
    // ---------------------------------------------------------------------------------
    // Component Lifecycle functions
    // ---------------------------------------------------------------------------------
    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Grid container spacing={1}>
                        <Grid container item xs={2}>
                            <AppName/>
                        </Grid>
                        <Grid container item xs={4}>
                            <MessageBox app_message='Start using message box ...'/>
                        </Grid>
                        <Grid container item xs={6}>
                            <PlayerControls/>
                            <Settings/>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>

        </div>
    );
}

export default Header;