import api from "./api"
import {SETTINGS_CHANGED} from "./notifications";


/* Action creators */
const actions = {
    refreshSettings: () => api.actions.post("/settings/refresh"),
    updateSettings: (settings) => api.actions.post("/settings/update", settings)
};


/* Reducers */
const reducer = (state = { }, {type, payload}) => (type === SETTINGS_CHANGED) ? payload : state;


/* Sagas */
function* saga() {

}


/* Exports */
export default {
    actions,
    reducer,
    saga
}
