import api from "./api"
import {FIELDS_CHANGED} from "./notifications";


/* Action creators */
const actions = {
    refreshFields: () => api.actions.callApi("/fields/refresh", "POST")
};


/* Reducers */
const reducer = (state = [ ], {type, payload}) => (type === FIELDS_CHANGED) ? payload : state;


/* Sagas */
function* saga() {

}


/* Exports */
export default {
    actions,
    reducer,
    saga
}
