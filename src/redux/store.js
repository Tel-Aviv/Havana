// @flow
import { createStore, combineReducers } from 'redux';
import reportDateReducer from './reducers/reportDateReducer'
import reportUpdateReducer from './reducers/reportUpdateReducer'

const rootReducer = combineReducers({reportDateReducer, 
                                        reportUpdateReducer})

export default createStore(rootReducer,
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())