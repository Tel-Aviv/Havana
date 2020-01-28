import { UPDATE_ITEM } from "../actionTypes";

const initialState = {
  updatedData: [],
  lastUpdatedItem: null
};

export default function(state = initialState, action) {
    switch (action.type) {
        
        case UPDATE_ITEM: {
            return {
                ...state,
                updatedData: [ 
                    ...state.updatedData,
                    action.item
                ],
                lastUpdatedItem: action.item
            }
        }

        default:
            return state;    
    }
}