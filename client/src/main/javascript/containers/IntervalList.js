import {connect} from "react-redux"
import {bindActionCreators} from "redux"

import "react-datepicker/dist/react-datepicker.css"
import "../../styles/datepicker.pcss"

import times from "../modules/times"
import Interval from "./Interval";
import RangePicker from "./RangePicker";

class IntervalList extends React.Component {

    componentDidMount = () => this.props.loadIntervals();

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
                this.props.intervals.map(interval =>
                    <Interval key={interval.id} interval={interval}/>
                )
            }
        </div>
        <RangePicker />
    </div>;

}

export default connect(
    (state) => ({
        intervals: state.times.intervals
    }),
    (dispatch) => bindActionCreators({
        loadIntervals: times.actions.loadIntervals
    }, dispatch)
)(IntervalList);
