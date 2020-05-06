import ls from 'local-storage'
import {parse, stringify} from 'flatted/esm';

const AppReducer = (state, action) => {
    localStorage.setItem('appInitial', stringify(state))
    switch (action.type) {
        case 'PLAY':
            return state;
        case 'STOP':
            return state;
        case 'RECORD':
            return state;
        case 'SAVE':
            return state;
    }
};

export default AppReducer;