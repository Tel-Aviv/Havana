// @flow
import moment from 'moment';
import { SET_NOTIFICATIONS_COUNT, DECREASE_NOTIFICATIONS_COUNT } from "../actionTypes";

type State = {
    notificationsCount: number
}

const initialState = {
  notificationsCount: 0,
};

type Action = {
    type: string,
    data: number
}

export default function(state: State = initialState, action: Action): State {
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