import { combineReducers } from "redux"
import { fork, all } from "redux-saga/effects"
import { mapNotNull } from "../utils"

import api from "./api"
import tasks from "./tasks"
import times from "./times"

export const modules = {
    api,
    tasks,
    times
};

export const rootReducer = combineReducers(
    mapNotNull(modules, module => module.reducer)
);

export function* rootSaga() {
    yield all(Object.values(
        mapNotNull(mapNotNull(modules, module => module.saga), saga => fork(saga))
    ));
}
