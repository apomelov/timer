import {put, takeEvery, select} from "redux-saga/effects";
import {applyPatch} from "../utils";


/* Action types */
export const STATE_CHANGED = "/notifications/stateChanged";
export const FIELDS_CHANGED = "/notifications/fieldsChanged";
export const TASKS_CHANGED = "/notifications/tasksChanged";
export const SEGMENTS_CHANGED = "/notifications/segmentsChanged";


/* Sagas */
function* saga() {
    yield takeEvery(STATE_CHANGED, function* ({_, payload}) {
        const state = applyPatch(yield select(state => state), payload);
        yield put({ type: FIELDS_CHANGED, payload: state.fields });
        yield put({ type: TASKS_CHANGED, payload: state.tasks });
        yield put({ type: SEGMENTS_CHANGED, payload: state.segments });
    });
}


/* Exports */
export default {
    saga
}
