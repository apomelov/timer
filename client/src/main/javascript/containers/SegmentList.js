import {connect} from "react-redux"
import {bindActionCreators} from "redux"

import "react-datepicker/dist/react-datepicker.css"
import "../../styles/datepicker.pcss"

import segments from "../modules/segments"
import Segment from "./Segment";
import RangePicker from "./RangePicker";


class SegmentList extends React.Component {

    componentDidMount = () => {
        const { refreshSegments, start, end} = this.props;
        refreshSegments(start, end);
    };

    render = () => <div className={"panel panel-default intervals-panel"}>
        <div className="panel-heading">
            <h3 className="panel-title">Time segments</h3>
        </div>
        <div className="panel-body">
            <div className="panel-row interval">
                <div>Task</div>
                <div>Length</div>
                <div>Start</div>
            </div>
            {
                this.props.segments.map(segment =>
                    <Segment key={segment.id} segment={segment} />
                )
            }
        </div>
        <RangePicker />
    </div>;

}

export default connect(
    (state) => ({
        segments: state.segments,
        start: state.times.start,
        end: state.times.end
    }),
    (dispatch) => bindActionCreators({
        refreshSegments: segments.actions.refreshSegments
    }, dispatch)
)(SegmentList);
