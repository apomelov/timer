import { put, take, takeEvery } from "redux-saga/effects";

import api from "../modules/api";


/* Action types */
const DATA_REQUEST = "/data/request";
const DATA_REQUESTED = "/data/requested";
const DATA_RECEIVED = "/data/received";
const DATA_FAILED = "/data/failed";


/* Action creators */
const requestData = () => ({ type: DATA_REQUEST });


/* Reducers */
const reducer = (state = { payload: "No data yet...", requested: false }, {type, payload}) => {
    switch (type) {
        case DATA_REQUESTED:
            return {...state, requested: true};
        case DATA_RECEIVED:
            return {...state, requested: false, payload: payload};
        case DATA_FAILED:
            return {...state, requested: false, payload: "Failed to receive data"};
        default:
            return state;
    }
};


/* Sagas */
function* saga() {
    while (true) {
        yield take(DATA_REQUEST);
        yield put({type: DATA_REQUESTED});
        yield put(api.actions.callApi("/data", "GET", {}, DATA_RECEIVED, DATA_FAILED));
    }
}


export default {
    actions: {
        requestData
    },
    reducer,
    saga
}
