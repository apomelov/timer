import {connect} from "react-redux"
import {bindActionCreators} from "redux"
import {Button} from "react-bootstrap"
import "../../styles/table.pcss"

import tasks from "../modules/tasks"
import Task from "./Task";

class TaskList extends React.Component {

    componentDidMount = () => this.props.loadTasks();
    onCheck = (task) => task.closedAt ? this.props.reopenTask(task) : this.props.closeTask(task);
    onDoubleClick = (task) => task.active ? this.props.stopTiming(task) : this.props.startTiming(task);

    render = () => <div className={"panel panel-default task-panel"}>
        <div className="panel-heading" style={{justifyContent: "space-between"}}>
            <h3 className="panel-title">Task List</h3>
            <Button>Create new</Button>
        </div>
        <div className="panel-body">
            <div className="panel-row task">
                <div>Title</div>
                <div>Time</div>
                <div>
                    {
                        this.props.customFields.map(field =>
                            <div key={field.id} data-toggle="tooltip" data-placement="top" title={field.title}>{field.title}</div>
                        )
                    }
                </div>
            </div>
            {
                this.props.tasks.map(task =>
                    <Task key={task.id} task={task}
                          customFields={this.props.customFields}
                          onCheck={() => this.onCheck(task)}
                          onDoubleClick={() => this.onDoubleClick(task)}
                    />
                )
            }
        </div>
    </div>;

}

export default connect(
    state => ({
        customFields: state.tasks.customFields,
        tasks: state.tasks.tasks
    }),
    dispatch => bindActionCreators({
        loadTasks: tasks.actions.loadTasks,
        closeTask: tasks.actions.closeTask,
        reopenTask: tasks.actions.reopenTask,
        startTiming: tasks.actions.startTiming,
        stopTiming: tasks.actions.stopTiming
    }, dispatch)
)(TaskList);
