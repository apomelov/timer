import api from "./api"
import {SEGMENTS_CHANGED} from "./notifications";


/* Action creators */
const actions = {
    refreshSegments: (start, end) => api.actions.post("/segments/refresh", { start: start.startOf("d").valueOf(), end: end.endOf("d").valueOf() }),
    moveSegment: (segmentId, target) => api.actions.post(`/segments/${segmentId}/move`, target)
};


/* Reducers */
const reducer = (state = [ ], {type, payload}) => (type === SEGMENTS_CHANGED) ? payload : state;


/* Sagas */
function* saga() {

}


/* Exports */
export default {
    actions,
    reducer,
    saga
}
