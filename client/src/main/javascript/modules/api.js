import {call, put, takeEvery} from "redux-saga/effects"
import {retrocycle} from "../utils"
import axios from "axios"


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


/* Reducers */
// No reducers here


/* Sagas */
function* saga() {
    yield takeEvery(REST_API_CALL, apiCallWorker)
}


/* Export */
export default {
    actions: {
        callApi
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
        yield put({type: success, payload: result});
    } catch (error) {
        if (!failure) {
            console.error(error);
        } else {
            yield put({type: failure, payload: error});
        }
    }
}
