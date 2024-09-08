import {createStore, applyMiddleware, combineReducers} from "redux";
import thunk from "redux-thunk";
import jftReducer from "./jftReducer";
import fullscreenReducer from "./fullscreenReducer";

const rootReducer = combineReducers({
  jft: jftReducer,
  fullscreen: fullscreenReducer
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;