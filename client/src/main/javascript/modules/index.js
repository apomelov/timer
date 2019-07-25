import {combineReducers} from "redux"
import {all, fork} from "redux-saga/effects"
import {mapNotNull} from "../utils"

import api from "./api"
import fields from "./fields"
import notifications from "./notifications"
import segments from "./segments"
import settings from "./settings"
import tasks from "./tasks"
import times from "./times"
import websocket from "./websocket"


export const modules = {
    api,
    fields,
    notifications,
    segments,
    settings,
    tasks,
    times,
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
