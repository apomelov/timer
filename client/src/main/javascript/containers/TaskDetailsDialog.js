import connect from "react-redux/es/connect/connect";
import {bindActionCreators} from "redux";
import tasks from "../modules/tasks";

class TaskDetailsDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = { validForm: false };
    }

    componentDidMount = () => {
        const self = this;
        $(this.refs.newTaskForm).submit(false);

        $("#taskDetailModal").on("show.bs.modal", (e) => {
            const { id, title, fields} = $(e.target).data("task") || { };

            $(self.refs.newTaskTitle).val(title);
            self.props.fields.forEach(field => {
                $(self.refs[`newTaskField_${field.id}`]).val(fields && fields[field.id] || "");
            });

            self.setState({ id, title, fields: {...fields}, validForm: !!title, isUpdate: !!id });
        });
    };

    onTaskTitleChange = () => {
        const title = $(this.refs.newTaskTitle).val();
        const validForm = !!title;
        $(this.refs.submit).prop("disabled", !validForm);
        this.setState({ ...this.state, title, validForm });
    };

    onSubmit = () => {
        if (this.state.validForm) {
            const title = $(this.refs.newTaskTitle).val();
            const fields = { };
            this.props.fields.forEach(field => {
                fields[field.id] = $(this.refs[`newTaskField_${field.id}`]).val();
            });
            if (this.state.isUpdate) {
                this.props.updateTask(this.state.id, title, fields);
            } else {
                this.props.createTask(title, fields);
            }
        }
    };

    render = () => {
        const title = this.state.isUpdate ? "Update a task" : "Create a new task";
        const submit = this.state.isUpdate ? "Save" : "Create";
        let submitClass = "btn btn-primary";
        if (!this.state.validForm) {
            submitClass += " disabled";
        }

        return <div className="modal fade" id="taskDetailModal" tabIndex="-1" role="dialog" aria-labelledby="taskDetailModalLabel">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 className="modal-title" id="taskDetailModalLabel">{title}</h4>
                    </div>
                    <div className="modal-body">
                        <form ref="newTaskForm">
                            <div className="form-group">
                                <label htmlFor="newTaskTitle">Task title <span style={{color: "red"}}>*</span></label>
                                <input ref="newTaskTitle" onChange={::this.onTaskTitleChange} className="form-control"
                                       id="newTaskTitle" placeholder="Title"/>
                            </div>
                            {
                                this.props.fields.map(field =>
                                    <div key={field.id} className="form-group">
                                        <label htmlFor={`newTaskField_${field.id}`}>{field.title}</label>
                                        <input className="form-control" id={`newTaskField_${field.id}`}
                                               ref={`newTaskField_${field.id}`} placeholder={field.title}/>
                                    </div>
                                )
                            }
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" data-dismiss="modal" className="btn btn-default">Cancel</button>
                        <button type="button" data-dismiss="modal" className={submitClass} ref="submit"
                                onClick={::this.onSubmit} disabled={!this.state.validForm}>{submit}</button>
                    </div>
                </div>
            </div>
        </div>
    };

}

export default connect(
    state => ({
        fields: state.fields
    }),
    dispatch => bindActionCreators({
        createTask: tasks.actions.createTask,
        updateTask: tasks.actions.updateTask
    }, dispatch)
)(TaskDetailsDialog);
