import "../../styles/table.pcss"
import Length from "./Length";
import moment from "moment";
import {DragSource} from "react-dnd";


const timeSegmentSource = {
    beginDrag(props) {
        return { intervalId: props.interval.id };
    },
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

class Interval extends React.Component {

    constructor(props) {
        super(props);
    }

    render = () => {
        const { interval, connectDragSource, isDragging } = this.props;
        let cls = "panel-row interval";
        if (!interval.end) cls += " active";
        if (isDragging) cls += " dragging";
        return connectDragSource(<div className={cls}>
            <div>{interval.taskTitle}</div>
            <div><Length interval={interval} /></div>
            <div>{moment(interval.start).format("MMM DD YYYY, h:mm:ss")}</div>
        </div>);
    }
}

export default DragSource("timeSegment", timeSegmentSource, collect)(Interval);
