import { combineReducers } from "redux"
import { fork, all } from "redux-saga/effects"
import { mapNotNull } from "../utils"

import api from "./api"
import fields from "./fields"
import segments from "./segments"
import tasks from "./tasks"
import times from "./times"
import notifications from "./notifications"
import websocket from "./websocket"


export const modules = {
    api,
    fields,
    segments,
    tasks,
    times,
    notifications,
    websocket
};

export const rootReducer = combineReducers(
    mapNotNull(modules, module => module.reducer)
);

export function* rootSaga() {
    yield all(Object.values(
        mapNotNull(mapNotNull(modules, module => module.saga), saga => fork(saga))
    ));
}
