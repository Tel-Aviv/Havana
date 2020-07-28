// @flow
import { SET_DIRECT_MANAGER } from '../actionTypes';

type State = {
    directManager: string
}

const initialState = {
    directManager: {
        userId: 'direct'
    },
  };

type Action = {
    type: string,
    data: object
}

export default function(state: State = initialState, action: Action) : State {
    switch( action.type ) {
        case SET_DIRECT_MANAGER:
            return {
                ...state,
                directManager: action.data
            }

        default:
            return state;    
    }
}