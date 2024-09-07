const SET_FULLSCREEN_STATE = "SET_FULLSCREEN_STATE";

export const toggleFullscreen = (fullscreenState) => {
    return async (dispatch) => {
        dispatch({
            type: SET_FULLSCREEN_STATE,
            payload: fullscreenState
        });
    };
};

const fullscreenReducer = (state = false, action) => {
    switch (action.type) {
        case SET_FULLSCREEN_STATE:
            return action.payload;
        default:
            return state;
    }
}

export default fullscreenReducer;