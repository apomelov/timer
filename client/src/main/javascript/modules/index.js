import { combineReducers } from "redux"
import { fork, all } from "redux-saga/effects"
import { mapNotNull } from "../utils";

import api from "./api"
import data from "./data"

export const modules = {
    api,
    data,
};

export const rootReducer = combineReducers(
    mapNotNull(modules, module => module.reducer)
);

export function* rootSaga() {
    yield all(Object.values(
        mapNotNull(modules, module => fork(module.saga))
    ));
}
