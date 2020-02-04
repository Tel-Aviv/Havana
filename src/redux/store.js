// @flow
import { createStore, combineReducers } from 'redux';
import reportDateReducer from './reducers/reportDateReducer'
import reportUpdateReducer from './reducers/reportUpdateReducer'
import notificationsCountReducer from './reducers/notificationsCount';

const rootReducer = combineReducers({reportDateReducer, 
                                     reportUpdateReducer,
                                     notificationsCountReducer
                                     })

export default createStore(rootReducer,
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())