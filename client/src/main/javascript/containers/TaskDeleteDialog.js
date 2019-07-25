import connect from "react-redux/es/connect/connect";
import {bindActionCreators} from "redux";
import tasks from "../modules/tasks";

class NewTaskDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = { disabled: true };
    }

    componentDidMount = () => {
        const self = this;
        $("#taskDeleteModal").on("show.bs.modal", (e) => {
            self.setState({ ...self.state, task: $(e.target).data("task"), disabled: true });
            const interval = setInterval(() => {
                let s = $(self.refs.progress).text();
                if (s.length >= 10) s = "";
                s += ".";
                $(self.refs.progress).text(s);
            }, 100);
            setTimeout(() => {
                clearInterval(interval);
                $(self.refs.progress).text("");
                self.setState({ ...self.state, disabled: false });
            }, 5000);
        });
    };

    onSubmit = () => {
        if (this.state.task && !this.state.disabled) {
            this.props.deleteTask(this.state.task);
        }
    };

    render = () => {
        let submitClass = "btn btn-primary btn-danger";
        if (this.state.disabled) {
            submitClass += " disabled";
        }
        const labelStyle = this.state.disabled ? {color: "#ddd"} : { };

        return <div className="modal fade" id="taskDeleteModal" tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 className="modal-title">Delete a task?</h4>
                    </div>
                    <div className="modal-body">
                        <p>You're about to permanently delete the task:</p>
                        <h3>{this.state.task && this.state.task.title}</h3>
                        <p>It will permanently delete all associated time segments and custom values.</p>
                        <p>Cool down and think about your decision for a few seconds<span ref="progress" /></p>
                        <form>
                            <div ref="dontBother" className="checkbox disabled">
                                <label style={labelStyle}>
                                    <input type="checkbox" disabled={this.state.disabled}/>
                                    Don't bother me again with this question!
                                </label>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" data-dismiss="modal" className="btn btn-default">Cancel</button>
                        <button type="button" data-dismiss="modal" className={submitClass}
                                ref="submit" disabled={this.state.disabled} onClick={::this.onSubmit}>Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>;
    };

}

export default connect(
    state => ({
        fields: state.fields
    }),
    dispatch => bindActionCreators({
        createTask: tasks.actions.createTask,
        updateTask: tasks.actions.updateTask,
        deleteTask: tasks.actions.deleteTask
    }, dispatch)
)(NewTaskDialog);
