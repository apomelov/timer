import {connect} from "react-redux"
import TaskList from "./TaskList"
import SegmentList from "./SegmentList"
import HTML5Backend from "react-dnd-html5-backend"
import {DragDropContext} from "react-dnd"


class App extends React.Component {

    render = () =>
        <div className="application">
            <div className="application-panel">
                <TaskList />
                <SegmentList />
            </div>
        </div>;

}

export default connect()(DragDropContext(HTML5Backend)(App));
