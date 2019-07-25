import "../../styles/table.pcss"
import Length from "./Length";
import moment from "moment";
import {DragSource} from "react-dnd";


const timeSegmentSource = {
    beginDrag(props) {
        return { segmentId: props.segment.id };
    },
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

class Segment extends React.Component {

    constructor(props) {
        super(props);
    }

    render = () => {
        const { segment, connectDragSource, isDragging } = this.props;
        let cls = "panel-row interval";
        if (!segment.end) cls += " active";
        if (isDragging) cls += " dragging";
        return connectDragSource(<div className={cls}>
            <div>{segment.taskTitle}</div>
            <div><Length segment={segment} /></div>
            <div>{moment(segment.start).format("MMM DD YYYY, HH:mm:ss")}</div>
        </div>);
    }
}

export default DragSource("timeSegment", timeSegmentSource, collect)(Segment);
