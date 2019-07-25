import {connect} from "react-redux"
import {bindActionCreators} from "redux"
import "../../styles/table.pcss"

import fields from "../modules/fields";
import tasks from "../modules/tasks"
import Task from "./Task";
import segments from "../modules/segments";

class TaskList extends React.Component {

    constructor(props) {
        super(props);
        this.state = { validForm: false };
    }

    componentDidMount = () => {
        $(this.refs.newTaskForm).submit(false);
        this.props.refreshFields();
        this.props.refreshTasks();
    };

    onTaskCheck = (task) =>
        task.closedAt
            ? this.props.reopenTask(task)
            : this.props.closeTask(task);

    onTaskDoubleClick = (task) =>
        task.active
            ? this.props.stopTiming(task)
            : this.props.startTiming(task);

    onNewTaskDialogOpen = () => {
        $(this.refs.newTaskTitle).val("");
        this.props.fields.forEach(field => {
            $(this.refs[`newTaskField_${field.id}`]).val("");
        });
        this.setState({ validForm: false });
    };

    onTaskTitleChange = () => {
        this.setState({ validForm: !!$(this.refs.newTaskTitle).val() });
    };

    onTaskCreate = () => {
        if (this.state.validForm) {
            const title = $(this.refs.newTaskTitle).val();
            const fields = { };
            this.props.fields.forEach(field => {
                fields[field.id] = $(this.refs[`newTaskField_${field.id}`]).val();
            });
            this.props.createTask(title, fields);
        }
    };


    render = () => <div className={"panel panel-default task-panel"}>

        <div className="modal fade" id="createTaskModal" tabIndex="-1" role="dialog" aria-labelledby="createTaskModalLabel">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span
                            aria-hidden="true">&times;</span></button>
                        <h4 className="modal-title" id="createTaskModalLabel">Create a new task</h4>
                    </div>
                    <div className="modal-body">
                        <form ref="newTaskForm">
                            <div className="form-group">
                                <label htmlFor="newTaskTitle">Task title <span style={{color: "red"}}>*</span></label>
                                <input ref="newTaskTitle" onChange={::this.onTaskTitleChange} className="form-control" id="newTaskTitle" placeholder="Title" />
                            </div>
                            {
                                this.props.fields.map(field =>
                                    <div key={field.id} className="form-group">
                                        <label htmlFor={`newTaskField_${field.id}`}>{field.title}</label>
                                        <input className="form-control" id={`newTaskField_${field.id}`} ref={`newTaskField_${field.id}`} placeholder={field.title} />
                                    </div>
                                )
                            }
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
                        <button type="button" className={"btn btn-primary" + (this.state.validForm ? "" : " disabled")} onClick={::this.onTaskCreate} data-dismiss="modal">Create</button>
                    </div>
                </div>
            </div>
        </div>

        <div className="panel-heading">
            <h3 className="panel-title">Task List</h3>
            <div className="controls">
                <button type="button" className="btn btn-default" data-toggle="modal" data-target="#createTaskModal" onClick={::this.onNewTaskDialogOpen}>
                    <span className="glyphicon glyphicon-plus" aria-hidden="true" /> New task
                </button>
                <button type="button" className="btn btn-default">
                    <span className="glyphicon glyphicon-cog" aria-hidden="true" /> Customize fields
                </button>
            </div>
        </div>
        <div className="panel-body">
            <div className="panel-row task">
                <div>Title</div>
                <div>Time</div>
                <div>
                    {
                        this.props.fields.map(field =>
                            <div key={field.id} data-toggle="tooltip" data-placement="top" title={field.title}>{field.title}</div>
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
                          moveSegment={(segmentId) => this.props.moveSegment(segmentId, task.id)}
                    />
                )
            }
        </div>
    </div>;

}

export default connect(
    state => ({
        fields: state.fields,
        tasks: state.tasks
    }),
    dispatch => bindActionCreators({
        refreshFields: fields.actions.refreshFields,
        refreshTasks: tasks.actions.refreshTasks,

        createTask: tasks.actions.createTask,

        closeTask: tasks.actions.closeTask,
        reopenTask: tasks.actions.reopenTask,
        startTiming: tasks.actions.startTiming,
        stopTiming: tasks.actions.stopTiming,

        moveSegment: segments.actions.moveSegment
    }, dispatch)
)(TaskList);
