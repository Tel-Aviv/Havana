// @flow
import moment from 'moment';
import { SET_REPORT_DATE } from "../actionTypes";

const initialState = {
  reportDate: moment()
};

export default function(state = initialState, action) {
    switch (action.type) {
        case SET_REPORT_DATE: {
            return {
                ...state,
                reportDate: action.data
            }
        }
    }
}
