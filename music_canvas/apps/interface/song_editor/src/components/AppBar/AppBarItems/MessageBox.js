import React from 'react';
import Typography from '@material-ui/core/Typography';
import './AppBarItems.css';

function MessageBox(props) {
   return (
        <div className='app_message'>
            <Typography variant="subtitle1" className='title'>
                {props.app_message}
            </Typography>
        </div>
    );
}

export default MessageBox;