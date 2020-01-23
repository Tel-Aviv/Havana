// @flow
import moment from 'moment';
import { SET_REPORT_DATE, UPDATE_ITEM } from "../actionTypes";

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

        case UPDATE_ITEM: {
            return {
                ...state,
                item: action.item
            }
        }
    }
}
