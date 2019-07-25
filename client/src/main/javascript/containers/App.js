import {connect} from "react-redux"
import TaskList from "./TaskList"
import Intervals from "./Intervals"

class App extends React.Component {

    render = () => {
        return <div style={{height: "100%", display: "flex", flexFlow: "column"}}>
            <TaskList style={{flex: "6 1 0", margin: "0"}}/>
            <Intervals style={{flex: "4 1 0", margin: "0"}}/>
        </div>;
    };

}

export default connect()(App);
