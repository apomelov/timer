import ReconnectingWebSocket from "reconnecting-websocket";
import {call, fork, put, take, takeLatest} from "redux-saga/effects";
import tasks from "./tasks";
import {eventChannel} from "redux-saga";


const socketUrl = window.location.protocol.replace("http", "ws")
    + "/" + window.location.host
    + "/socket";

const ws = new ReconnectingWebSocket(socketUrl);

const initWebSocket = () => eventChannel(emitter => {
    ws.onmessage = () => {
        return emitter({ type: NOTIFICATION_RECEIVED });
    };
    return () => console.log('Socket off');
});


/* Action types */
const NOTIFICATION_RECEIVED = "/notifications/received";


/* Action creators */
const actions = {

};


/* Sagas */
function* saga() {

    yield fork(watchIncomingMessages);

    yield takeLatest(NOTIFICATION_RECEIVED, function* () {
        yield put(tasks.actions.loadTasks())
    });
}

function* watchIncomingMessages() {
    const channel = yield call(initWebSocket);
    while (true) {
        const action = yield take(channel);
        yield put(action)
    }
}


/* Exports */
export default {
    actions,
    saga
}
