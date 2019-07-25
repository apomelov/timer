import {connect} from "react-redux"
import TaskList from "./TaskList"
import IntervalList from "./IntervalList"
import HTML5Backend from "react-dnd-html5-backend";
import {DragDropContext} from "react-dnd";

class App extends React.Component {

    render = () => {
        return <div className="application-panel">
            <TaskList />
            <IntervalList />
        </div>;
    };

}

export default connect()(DragDropContext(HTML5Backend)(App));
