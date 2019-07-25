import ReconnectingWebSocket from "reconnecting-websocket";
import {call, fork, take, put, takeEvery} from "redux-saga/effects";
import {eventChannel} from "redux-saga";
import {retrocycle} from "../utils";
import {STATE_CHANGED} from "./notifications";


const socketUrl = (l => `ws${l.protocol.slice(4)}/${l.host}/socket`)(window.location);
const ws = new ReconnectingWebSocket(socketUrl);

const initWebSocket = () => eventChannel(emitter => {
    ws.onopen = () => {
        return emitter({ type: SOCKET_OPENED });
    };
    ws.onmessage = (msg) => {
        return emitter({ type: STATE_CHANGED, payload: retrocycle(JSON.parse(msg.data)) });
    };
    return () => console.log('Socket off');
});


/* Action types */
export const SOCKET_OPENED = "/websocket/opened";
const SEND_TO_SERVER = "/websocket/sendToServer";


/* Action creators  */
const actions = {
    sendToServer: (payload) => ({ type: SEND_TO_SERVER, payload })
};

/* Sagas */
function* saga() {
    yield fork(watchSocket);
    yield takeEvery(SEND_TO_SERVER, function* ({ _, payload }) {
        ws.send(JSON.stringify(payload))
    });
}

function* watchSocket() {
    const inboundMessages = yield call(initWebSocket);
    while (true) {
        yield put(yield take(inboundMessages));
    }
}


/* Exports */
export default {
    actions,
    saga
}
