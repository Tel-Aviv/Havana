import { ADD_ITEM, UPDATE_ITEM } from "../actionTypes";

const initialState = {
  updatedData: [],
  addedData: null,
  lastUpdatedItem: null,
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

        case ADD_ITEM: {
            return {
                ...state,
                addedData: {
                    index: action.addIndex,
                    item: action.addItem
                }
            }
        }

        default:
            return state;    
    }
}