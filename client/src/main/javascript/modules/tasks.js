import api from "./api";
import {TASKS_CHANGED} from "./notifications";


/* Action creators */
const actions = {
    refreshTasks: () => api.actions.post("/tasks/refresh"),
    createTask: (title, fields) => api.actions.post("/tasks", { title, fields }),
    updateTask: (id, title, fields) => api.actions.post(`/tasks/${id}/update`, { title, fields }),
    closeTask: (task) => api.actions.post(`/tasks/${task.id}/close`),
    reopenTask: (task) => api.actions.post(`/tasks/${task.id}/reopen`),
    deleteTask: (task) => api.actions.post(`/tasks/${task.id}/delete`),
    startTiming: (task) => api.actions.post(`/tasks/${task.id}/start`),
    stopTiming: (task) => api.actions.post(`/tasks/${task.id}/stop`)
};


/* Reducers */
const reducer = (state = [ ], {type, payload}) => (type === TASKS_CHANGED) ? payload : state;


/* Sagas */
function* saga() {

}


/* Exports */
export default {
    actions,
    reducer,
    saga
}
