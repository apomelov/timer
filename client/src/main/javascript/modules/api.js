import {call, put, take, takeEvery, race} from "redux-saga/effects"
import {retrocycle} from "../utils"
import axios from "axios"
import {SOCKET_OPENED} from "./websocket";


/* Action types */
const REST_API_CALL = "/api/call";


/* Action creators */
const callApi = (url, method, data, success, failure) => ({
    type: REST_API_CALL,
    payload: {
        api: { url, method, data },
        success,
        failure
    }
});


/* Sagas */
function* saga() {
    const apiCalls = [];
    while (true) {
        const { api } = yield race({
            socket: take(SOCKET_OPENED),
            api: take(REST_API_CALL)
        });
        if (api) {
            apiCalls.push(api)
        } else {
            break;
        }
    }
    yield takeEvery(REST_API_CALL, apiCallWorker);
    for (let i in apiCalls) {
        yield call(apiCallWorker, apiCalls[i]);
    }
}


/* Export */
export default {
    actions: {
        callApi,
        get: (url, data, success, failure) => callApi(url, "GET", data, success, failure),
        post: (url, data, success, failure) => callApi(url, "POST", data, success, failure)
    },
    saga
}


/* Implementation */

const api = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json"
    }
});

function apiCall({url, method, data}) {
    return api.request({url, method, data})
        .then(result => retrocycle(result.data))
        .catch(error => {
            throw error;
        });
}

function* apiCallWorker({payload}) {
    const {api, success, failure} = payload;
    try {
        const result = yield call(apiCall, api);
        if (success) {
            yield put({type: success, payload: result});
        }
    } catch (error) {
        if (failure) {
            yield put({type: failure, payload: error});
        } else {
            console.error(error);
        }
    }
}
