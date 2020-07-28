// @flow
import { createStore, combineReducers } from 'redux';
import reportDateReducer from './reducers/reportDateReducer'
import reportUpdateReducer from './reducers/reportUpdateReducer'
import notificationsCountReducer from './reducers/notificationsCount';
import directManagerReducer from './reducers/directManagerReducer';

const rootReducer = combineReducers({reportDateReducer, 
                                     reportUpdateReducer,
                                     notificationsCountReducer,
                                     directManagerReducer
                                     })

export default createStore(rootReducer,
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())