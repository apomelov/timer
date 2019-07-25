import {connect} from "react-redux"
import {bindActionCreators} from "redux"
import "../../styles/table.pcss"
import "../../styles/contexmenu.pcss"

import fields from "../modules/fields";
import tasks from "../modules/tasks"
import Task from "./Task";
import segments from "../modules/segments";
import TaskDetailsDialog from "./TaskDetailsDialog";
import TaskDeleteDialog from "./TaskDeleteDialog";
import SettingsDialog from "./SettingsDialog";
import axios from "axios";


export const taskContextMenuId = "taskContextMenu";


const jiraApi = axios.create({
    baseURL: "http://jira.leiki.com:8800/Jira/rest/api/2",
    headers: {
        "Content-Type": "application/json"
    }
});

class TaskList extends React.Component {

    constructor(props) {
        super(props);
        this.state = { validForm: false };
    }

    componentDidMount = () => {
        this.props.refreshFields();
        this.props.refreshTasks();
        $("html").click(() => {
            $("#" + taskContextMenuId).hide();
        });
    };

    onTaskCheck = (task) =>
        task.closedAt
            ? this.props.reopenTask(task)
            : this.props.closeTask(task);

    onTaskDoubleClick = (task) =>
        task.active
            ? this.props.stopTiming(task)
            : this.props.startTiming(task);

    onNewTaskDialogOpen = (task) => {
        const modal = $("#taskDetailModal");
        modal.data("task", null);
        modal.modal("show");
    };

    start = () => {
        const task = $("#" + taskContextMenuId).data("invokedOn");
        this.props.startTiming(task);
    };

    stop = () => {
        const task = $("#" + taskContextMenuId).data("invokedOn");
        this.props.stopTiming(task);
    };

    edit = () => {
        const task = $("#" + taskContextMenuId).data("invokedOn");
        const modal = $("#taskDetailModal");
        modal.data("task", task);
        modal.modal("show");
    };

    delete = () => {
        const task = $("#" + taskContextMenuId).data("invokedOn");
        if (this.props.settings.deleteTaskImmediately) {
            this.props.deleteTask(task);
        } else {
            const modal = $("#taskDeleteModal");
            modal.data("task", task);
            modal.modal("show");
        }
    };

    search = (e) => {
        const query = $(e.target).val();
        if (query.length < 4) {
            return;
        }
        const searchUrl = `http://jira.leiki.com:8800/Jira/rest/api/2/search?fields=summary&jql=summary ~ "${query}"`;
        fetch(encodeURI(searchUrl), {
            method: "GET",
            headers: {
                Authorization: `Basic ${this.props.settings.jiraAuthHeader}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            mode: "no-cors"
        }).then((response) => {
            console.log(response.data);
        });
        // jiraApi.get("/search", {
        //     headers: {
        //         Authorization: `Basic ${this.props.settings.jiraAuthHeader}`,
        //         Accept: "application/json"
        //     },
        //     params: {
        //         fields: "summary",
        //         jql: `summary ~ "${query}"`
        //     }
        // }).then((response) => {
        //     console.log(response.data);
        // });
    };

    render = () => {

        return <div className={"panel panel-default task-panel"}>

            <SettingsDialog />

            <TaskDetailsDialog />

            <TaskDeleteDialog />

            <div className="panel-heading">
                <h3 className="panel-title">Task List</h3>
                <div className="controls">
                    <input className="form-control" placeholder="Search Jira" onChange={::this.search} />
                    <button type="button" className="btn btn-default" onClick={::this.onNewTaskDialogOpen}>
                        <span className="glyphicon glyphicon-plus" aria-hidden="true"/> New task
                    </button>
                    <button type="button" className="btn btn-default" data-toggle="modal" data-target="#settingsModal">
                        <span className="glyphicon glyphicon-cog" aria-hidden="true"/>
                    </button>
                    {/*<button type="button" className="btn btn-default">*/}
                        {/*<span className="glyphicon glyphicon-cog" aria-hidden="true"/> Customize fields*/}
                    {/*</button>*/}
                </div>
            </div>

            <ul id={taskContextMenuId} className="dropdown-menu taskContextMenu" role="menu" style={{display: "none"}}>
                <li data-condition={"(task) => !task.active"}>
                    <a tabIndex="-1" href="#" onClick={::this.start}>
                        <span className="glyphicon glyphicon-play" aria-hidden="true"/>
                        Start timing
                    </a>
                </li>
                <li data-condition={"(task) => task.active"}>
                    <a tabIndex="-1" href="#" onClick={::this.stop}>
                        <span className="glyphicon glyphicon-stop" aria-hidden="true"/>
                        Stop timing
                    </a>
                </li>
                <li>
                    <a tabIndex="-1" href="#" onClick={::this.edit}>
                        <span className="glyphicon glyphicon-pencil" aria-hidden="true"/>
                        Edit task
                    </a>
                </li>
                <li>
                    <a tabIndex="-1" href="#" onClick={::this.delete}>
                        <span className="glyphicon glyphicon-trash" aria-hidden="true"/>
                        Delete task
                    </a>
                </li>
            </ul>

            <div className="panel-body">

                <div className="panel-row task">
                    <div>Title</div>
                    <div>
                        {
                            this.props.fields.map(field =>
                                <div key={field.id} data-toggle="tooltip" data-placement="top"
                                     title={field.title}>{field.title}</div>
                            )
                        }
                    </div>
                </div>
                {
                    this.props.tasks.map(task =>
                        <Task key={task.id} task={task}
                              fields={this.props.fields}
                              onCheck={() => this.onTaskCheck(task)}
                              onDoubleClick={() => this.onTaskDoubleClick(task)}
                              onEdit={() => {this.onNewTaskDialogOpen(task);$("#taskDetailModal").modal("show");}}
                              moveSegment={(segmentId) => this.props.moveSegment(segmentId, task.id)}
                        />
                    )
                }
            </div>
        </div>;
    }
}

export default connect(
    state => ({
        fields: state.fields,
        tasks: state.tasks,
        settings: state.settings
    }),
    dispatch => bindActionCreators({
        refreshFields: fields.actions.refreshFields,
        refreshTasks: tasks.actions.refreshTasks,
        closeTask: tasks.actions.closeTask,
        reopenTask: tasks.actions.reopenTask,
        deleteTask: tasks.actions.deleteTask,
        startTiming: tasks.actions.startTiming,
        stopTiming: tasks.actions.stopTiming,

        moveSegment: segments.actions.moveSegment
    }, dispatch)
)(TaskList);
