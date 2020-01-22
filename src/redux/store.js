// @flow
import { createStore } from 'redux';
import reportDate from './reducers/reportDateReducer'

export default createStore(reportDate,
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())