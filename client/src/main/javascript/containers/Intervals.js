import {connect} from "react-redux"
import {bindActionCreators} from "redux"

import "react-datepicker/dist/react-datepicker.css"
import "../../styles/datepicker.css"
import moment from "moment"

import times from "../modules/times"
import Length from "./Length"
import RangePicker from "./RangePicker"

class Intervals extends React.Component {

    componentDidMount = () => this.props.loadIntervals();

    render() {
        const baseStyle = {height: "100%", display: "flex", flexFlow: "column"};
        const style = {...baseStyle, ...(this.props.style || { })};
        return <div className={"panel panel-default"} style={style}>
            <div className="panel-heading" style={{flex: "0 1 auto"}}>
                <h3 className="panel-title">Intervals</h3>
            </div>
            <div className="panel-body" style={{padding: "0", flex: "1 1 0", overflowY: "scroll"}}>
                <table className="table table-striped table-hover interval-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Start</th>
                            <th>Length</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.intervals.map(interval => {
                                return <tr key={interval.id} className={!interval.end ? "row-active" : ""}>
                                    <td>{interval.taskTitle}</td>
                                    <td>{moment(interval.start).format("MMM DD YYYY, h:mm:ss")}</td>
                                    <td><Length interval={interval} /></td>
                                </tr>;
                            })
                        }
                    </tbody>
                </table>
            </div>
            <RangePicker />
        </div>;
    }

}

export default connect(
    (state) => ({
        intervals: state.times.intervals
    }),
    (dispatch) => bindActionCreators({
        loadIntervals: times.actions.loadIntervals
    }, dispatch)
)(Intervals);
