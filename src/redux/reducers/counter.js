// @flow
import { ADD_TODO, TOGGLE_TODO } from "../actionTypes";

const initialState = {
  counter: 1
};

export default function(state = initialState, action) {
    switch (action.type) {
       case ADD_TODO: {
            return {
                ...state,
                counter: state.counter + 1
            }
        }
         
    }
}