import {createStore, applyMiddleware, combineReducers} from "redux";
import thunk from "redux-thunk";
import jftReducer from "./jftReducer";

const rootReducer = combineReducers({jft: jftReducer});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;