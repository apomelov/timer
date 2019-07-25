import connect from "react-redux/es/connect/connect";
import {bindActionCreators} from "redux";
import settings from "../modules/settings";

class SettingsDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = { passwordChanged: false };
    }

    componentDidMount = () => {
        $(this.refs.form).submit(false);
        this.props.refreshSettings();
    };

    onSubmit = () => {

        const authHeader = this.state.passwordChanged
            ? this.authHeader($(this.refs.jiraLogin).val(), $(this.refs.jiraPass).val())
            : this.props.settings.jiraAuthHeader;

        const settings = {
            deleteTaskImmediately: !!$(this.refs.deleteTaskImmediately).prop('checked'),
            deleteTimeImmediately: !!$(this.refs.deleteTimeImmediately).prop('checked'),
            jiraLogin: $(this.refs.jiraLogin).val(),
            jiraAuthHeader: authHeader
        };

        this.props.updateSettings(settings)
    };

    onPasswordChange = () => {
        this.setState({ ...this.state, passwordChanged: true });
    };

    authHeader = (login, password) => (login && password) ? btoa(`${login}:${password}`) : "";

    render = () => {
        const { deleteTaskImmediately, deleteTimeImmediately, jiraLogin, jiraAuthHeader } = this.props.settings;
        return <div className="modal fade" id="settingsModal" tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 className="modal-title">Settings</h4>
                    </div>
                    <div className="modal-body">
                        <form ref="form">
                            <h4>Confirmations</h4>
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" ref="deleteTaskImmediately" defaultChecked={deleteTaskImmediately} />
                                    Delete tasks without confirmation
                                </label>
                            </div>
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" ref="deleteSegmentsImmediately" defaultChecked={deleteTimeImmediately} />
                                    Delete time segments without confirmation
                                </label>
                            </div>

                            <h4>Jira integration</h4>
                            <div className="form-group">
                                <label htmlFor="jiraLogin">Login:</label>
                                <input className="form-control" id="jiraLogin" ref="jiraLogin" placeholder="Login"
                                       defaultValue={jiraLogin} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="jiraPass">Password:</label>
                                <input className="form-control" id="jiraPass" ref="jiraPass"
                                       placeholder={jiraAuthHeader ? "Password has been entered already" : "Password"}
                                       type="password" onChange={::this.onPasswordChange} />
                            </div>

                            <div className="btn-group">
                                <button type="button" className="form-control btn btn-default dropdown-toggle"
                                        data-toggle="dropdown">
                                    Jira key field <span className="caret"/>
                                </button>
                                <ul className="dropdown-menu" role="menu">
                                    {
                                        this.props.fields.map(field =>
                                            <li key={field.id}><a href="#" data-value={field.id}>{field.title}</a></li>
                                        )
                                    }
                                </ul>
                            </div>
                            {/*<div className="form-group">*/}
                                {/*<label htmlFor="jiraField">Field for jira key:</label>*/}



                                {/*<select className="form-control" id="jiraField">*/}
                                    {/*{*/}
                                        {/*this.props.fields.map(field =>*/}
                                            {/*<option key={field.id} value={field.id}>{field.title}</option>*/}
                                        {/*)*/}
                                    {/*}*/}
                                {/*</select>*/}
                            {/*</div>*/}
                        </form>

                    </div>
                    <div className="modal-footer">
                        <button type="button" data-dismiss="modal" className="btn btn-default">Cancel</button>
                        <button type="button" data-dismiss="modal" className="btn btn-primary" onClick={::this.onSubmit}>Save</button>
                    </div>
                </div>
            </div>
        </div>;
    };

}

export default connect(
    state => ({
        settings: state.settings,
        fields: state.fields
    }),
    dispatch => bindActionCreators({
        refreshSettings: settings.actions.refreshSettings,
        updateSettings: settings.actions.updateSettings
    }, dispatch)
)(SettingsDialog);
