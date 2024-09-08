const SET_FULLSCREEN_STATE = "SET_FULLSCREEN_STATE";
const SET_FULLSCREEN_HANDLE = "SET_FULLSCREEN_HANDLE";

const initialState = { isFullscreen: false, fullscreenHandle: null };

export const toggleFullscreen = (fullscreenState) => {
    return async (dispatch) => {
        dispatch({
            type: SET_FULLSCREEN_STATE,
            payload: fullscreenState
        });
    };
};

export const setFullScreenHandle = (handle) => {
    return async (dispatch) => {
        dispatch({
            type: SET_FULLSCREEN_HANDLE,
            payload: handle
        });
    };
};

const fullscreenReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_FULLSCREEN_STATE:
            return { ...state, isFullscreen: action.payload};
        case SET_FULLSCREEN_HANDLE:
            return { ...state, fullscreenHandle: action.payload};
        default:
            return state;
    }
}

export default fullscreenReducer;