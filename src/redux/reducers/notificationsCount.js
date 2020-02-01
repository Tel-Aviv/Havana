// @flow
import moment from 'moment';
import { SET_NOTIFICATIONS_COUNT, DECREASE_NOTIFICATIONS_COUNT } from "../actionTypes";

const initialState = {
  notificationsCount: 0,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case SET_NOTIFICATIONS_COUNT: {
            return {
                ...state,
                notificationsCount: action.data
            }
        }

        case DECREASE_NOTIFICATIONS_COUNT: {
            return {
                ...state,
                notificationsCount: state.notificationsCount - 1
            }
        }

        default:
            return state;    

    }
}