// @flow
import moment from 'moment';
import { SET_REPORT_DATE } from "../actionTypes";

type State = {
    reportDate: moment
}

const initialState = {
  reportDate: moment(),
};

type Action = {
    type: string,
    data: moment
}

export default function(state: State = initialState, action: Action) : State {
    switch (action.type) {
        case SET_REPORT_DATE: {
            return {
                ...state,
                reportDate: action.data
            }
        }

        default:
            return state;    

    }
}
