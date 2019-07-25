import {put, takeEvery} from "redux-saga/effects"
import moment from "moment";

/* Action types */
const SET_INTERVAL = "/times/setInterval";
const TICK = "/times/tick";


/* Action creators */
const actions = {
    setInterval: (start, end) => ({ type: SET_INTERVAL, payload: { start, end} }),
};


/* Reducers */
const reducer = (state = { start: moment(), end: moment() }, {type, payload}) => {
    switch (type) {
        case SET_INTERVAL:
            const { start, end } = payload;
            return {...state, start, end};
        case TICK:
            return {...state, now: payload.valueOf()};
        default:
            return state;
    }
};


/* Sagas */
const delay = (ms) => new Promise(res => setTimeout(res, ms));
function* saga() {

    yield takeEvery(TICK, function* () {
        yield delay(1000);
        yield put({ type: TICK, payload: moment() })
    });

    yield put({ type: TICK, payload: moment() });

}


export default {
    actions,
    reducer,
    saga
}