import {connect} from "react-redux"
import {bindActionCreators} from "redux"

import "../../styles/table.css"

import tasks from "../modules/tasks"

class TaskList extends React.Component {

    componentDidMount = () => this.props.loadTasks();
    onTaskCheck = (task) => task.closedAt ? this.props.reopenTask(task) : this.props.closeTask(task);
    handleClick = (task) => task.active ? this.props.stopTiming(task) : this.props.startTiming(task);

    render() {
        const baseStyle = {height: "100%", display: "flex", flexFlow: "column"};
        const style = {...baseStyle, ...(this.props.style || { })};
        return <div className={"panel panel-default"} style={style}>
            <div className="panel-heading" style={{flex: "0 1 auto"}}>
                <h3 className="panel-title">Task List</h3>
            </div>
            <div className="panel-body" style={{padding: "0", flex: "1 1 0", overflowY: "scroll"}}>
                <table className="table table-striped table-hover task-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Time</th>
                            {
                                this.props.customFields.map(field =>
                                    <th key={field.id}>{field.title}</th>
                                )
                            }
                            <th>{/*stretch*/}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.tasks.map(task => {
                                const closed = !!task.closedAt;
                                return <tr key={task.id} className={"task" + (closed ? "-closed" : "") + (task.active ? " task-active" : "")} onDoubleClick={() => this.handleClick(task)}>
                                    <td>
                                        <input type="checkbox" style={{marginRight: "8px"}} checked={closed} onChange={() => this.onTaskCheck(task)}/>
                                        {task.title}
                                    </td>
                                    <td>999:59:59</td>
                                    {
                                        this.props.customFields.map(field =>
                                            <td key={field.id}>{task.customFields[`${field.id}`] || ""}</td>
                                        )
                                    }
                                    <td />
                                </tr>;
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>;
    }

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
