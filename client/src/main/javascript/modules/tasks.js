import {put, takeLatest} from "redux-saga/effects"
import api from "./api";
import times from "./times";

/* Action types */
const LOAD_TASKS = "/tasks/load";
const CLOSE_TASK = "/tasks/close";
const REOPEN_TASK = "/tasks/reopen";
const START_TIMING = "/tasks/startTiming";
const STOP_TIMING = "/tasks/stopTiming";

const CUSTOM_FIELDS_LOADED = "/tasks/customFieldsLoaded";
const TASKS_LOADED = "/tasks/tasksLoaded";
const TASK_CLOSED = "/tasks/closed";
const TASK_REOPENED = "/tasks/reopened";



/* Action creators */
const actions = {
    loadTasks: () => ({ type: LOAD_TASKS }),
    closeTask: (task) => ({type: CLOSE_TASK, payload: task}),
    reopenTask: (task) => ({type: REOPEN_TASK, payload: task}),
    startTiming: (task) => ({type: START_TIMING, payload: task}),
    stopTiming: (task) => ({type: STOP_TIMING, payload: task})
};


/* Reducers */
const reducer = (state = { customFields: [], tasks: [] }, {type, payload}) => {
    switch (type) {
        case CUSTOM_FIELDS_LOADED:
            return {...state, customFields: payload};
        case TASKS_LOADED:
            return {...state, tasks: payload};
        case TASK_CLOSED:
        case TASK_REOPENED:
            return {...state, tasks: state.tasks.map(task => task.id === payload.id ? payload : task) };
        default:
            return state;
    }
};


/* Sagas */
function* saga() {

    yield takeLatest(LOAD_TASKS, function* () {
        yield put(api.actions.callApi("/customFields", "GET", null, CUSTOM_FIELDS_LOADED));
        yield put(api.actions.callApi("/tasks", "GET", null, TASKS_LOADED));
        yield put(times.actions.loadIntervals());
    });

    yield takeLatest(CLOSE_TASK, function* ({ payload: task }) {
        yield put(api.actions.callApi(`/tasks/${task.id}/close`, "POST", null, TASK_CLOSED));
    });

    yield takeLatest(REOPEN_TASK, function* ({ payload: task }) {
        yield put(api.actions.callApi(`/tasks/${task.id}/reopen`, "POST", null, TASK_REOPENED));
    });

    yield takeLatest(START_TIMING, function* ({ payload: task }) {
        yield put(api.actions.callApi(`/tasks/${task.id}/startTiming`, "POST", null, LOAD_TASKS));
    });

    yield takeLatest(STOP_TIMING, function* ({ payload: task }) {
        yield put(api.actions.callApi(`/tasks/${task.id}/stopTiming`, "POST", null, LOAD_TASKS));
    });

}


/* Exports */
export default {
    actions,
    reducer,
    saga
}
