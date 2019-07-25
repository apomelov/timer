import {connect} from "react-redux"
import TaskList from "./TaskList"
import IntervalList from "./IntervalList"

class App extends React.Component {

    render = () => {
        return <div className="application-panel">
            <TaskList />
            <IntervalList />
        </div>;
    };

}

export default connect()(App);
