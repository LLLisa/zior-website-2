import axios from "axios";

const LOAD_JFT = "LOAD_JFT";

export const loadJFT = () => {
    return async (dispatch) => {
        const response = await axios.get("jft");
        console.log('LOADING JFT');
        dispatch({
            type: LOAD_JFT,
            payload: response.data
        });
    };
};

const jftReducer = (state = "", action) => {
    switch (action.type) {
        case LOAD_JFT:
            return action.payload;
        default:
            return state;
    }
}

export default jftReducer;