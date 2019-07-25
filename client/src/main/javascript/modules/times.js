import { put, select, takeLatest, takeEvery } from "redux-saga/effects"

import api from "../modules/api"
import moment from "moment";

/* Action types */
const SET_INTERVAL = "/times/setInterval";
const LOAD_INTERVALS = "/times/loadIntervals";
const INTERVALS_LOADED = "/times/intervalsLoaded";
const TICK = "/times/tick";


/* Action creators */
const actions = {
    setInterval: (start, end) => ({ type: SET_INTERVAL, payload: { start: start, end: end} }),
    loadIntervals: () => ({ type: LOAD_INTERVALS }),
};


/* Reducers */
const reducer = (state = { intervals: [], openInterval: null, start: moment(), end: moment() }, {type, payload}) => {
    switch (type) {
        case SET_INTERVAL:
            const { start, end} = payload;
            return {...state, start, end};
        case INTERVALS_LOADED:
            return {...state, intervals: payload.reverse()};
        case TICK:
            return {...state, now: payload.valueOf()};
        default:
            return state;
    }
};


/* Sagas */
const delay = (ms) => new Promise(res => setTimeout(res, ms));
function* saga() {

    yield takeLatest(LOAD_INTERVALS, function* () {
        const start = (yield select(store => store.times.start)).startOf("day").valueOf();
        const end = (yield select(store => store.times.end)).endOf("day").valueOf();
        yield put(api.actions.callApi(`/timeSegments?start=${start}&end=${end}`, "GET", null, INTERVALS_LOADED))
    });

    yield takeLatest(SET_INTERVAL, function* () {
        yield put(actions.loadIntervals());
    });

    yield takeEvery(TICK, function* () {
        yield delay(1000);
        yield put({ type: TICK, payload: moment() })
    });

    yield put({ type: TICK, payload: moment() })
}


export default {
    actions,
    reducer,
    saga
}