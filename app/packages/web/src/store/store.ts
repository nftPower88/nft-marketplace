import { createStore } from "redux";
import mainReducer from "./reducer";
import { composeWithDevTools } from "redux-devtools-extension";

export const store = createStore(mainReducer, composeWithDevTools());

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
