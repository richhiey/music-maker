import React from 'react';
import Typography from '@material-ui/core/Typography';
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
import './AppBarItems.css';


function MessageBox(props) {
    const [sidebar_open, setSidebarOpen] = React.useState(false);


    // ---------------------------------------------------------------------------------
    // Helper functions
    // ---------------------------------------------------------------------------------
    const handleDrawerOpen = () => {
        setSidebarOpen(true);
    };

    const handleDrawerClose = () => {
        setSidebarOpen(false);
    };
    return (
        <div className='settings_button'>
            <IconButton onClick={handleDrawerOpen} className='menuButton' color="inherit" aria-label="menu">
                <MenuIcon />
            </IconButton>
            <Drawer
                className='settingsDrawer'
                anchor="right"
                open={sidebar_open}>
                <div className='settingsBar'>
                    <IconButton onClick={handleDrawerClose}>
                        <ChevronRightIcon />
                    </IconButton>
                </div>
            </Drawer>
        </div>
    );
}

export default MessageBox;

