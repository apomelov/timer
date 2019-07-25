import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Panel from "../components/Panel";

import { modules } from "../modules"

class App extends React.Component {

    componentDidMount() {
        $(this.refs.form).submit(false);
    }

    onClick = () => {
        this.props.requestData();
    };

    render = () => <div style={{width: "50%", margin: "auto"}}>
        <Panel title="Hello, Template!">
            <form ref="form">
                <div className="form-group">
                    <button className="btn btn-default" onClick={::this.onClick}>Call the server!!!</button>
                    {
                        this.props.requested
                            ? <div className="loader" />
                            : <p>{this.props.data}</p>
                    }
                </div>
            </form>
        </Panel>
    </div>;

}

export default connect(
    state => ({
        data: state.data.payload,
        requested: state.data.requested
    }),
    dispatch => bindActionCreators({
        requestData: modules.data.actions.requestData
    }, dispatch)
)(App);
