import {connect} from "react-redux"
import {bindActionCreators} from "redux"

import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "../../styles/datepicker.css"
import moment from "moment"

import times from "../modules/times"

class RangePicker extends React.Component {

    handleChangeStart = (date) => this.props.setInterval(date, this.props.end);
    handleChangeEnd = (date) => this.props.setInterval(this.props.start, date);
    handleToday = () => this.props.setInterval(moment(), moment());
    handleYesterday = () => this.props.setInterval(moment().subtract(1, "d"), moment().subtract(1, "d"));

    handleThisWeek = () => {
        const day = moment().weekday();
        this.props.setInterval(
            moment().subtract(day - 1, "d"),
            moment().add(7 - day, "d")
        );
    };

    handlePreviousWeek = () => {
        const day = moment().weekday();
        this.props.setInterval(
            moment().subtract(day + 6, "d"),
            moment().subtract(day , "d")
        );
    };

    render = () =>
        <ul className="list-group">
            <li className="list-group-item" style={{display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "5px 15px"}}>
                <b>From:</b>
                <div className="customDatePicker">
                    <DatePicker selectsStart selected={this.props.start}
                                startDate={this.props.start} endDate={this.props.end}
                                onChange={::this.handleChangeStart}
                                dropdownMode="scroll"
                                locale="en-gb" dateFormat="DD MMM YYYY"
                    />
                </div>
                <b>To:</b>
                <div className="customDatePicker">
                    <DatePicker selectsEnd selected={this.props.end}
                                startDate={this.props.start} endDate={this.props.end}
                                onChange={::this.handleChangeEnd}
                                dropdownMode="scroll"
                                locale="en-gb" dateFormat="DD MMM YYYY"
                    />
                </div>
                <div className="btn-group dropup">
                    <button type="button" className="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false">
                        <b>[&emsp;]&emsp;</b><span className="caret" />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-right">
                        <li><a href="#" onClick={::this.handleToday}>Today</a></li>
                        <li><a href="#" onClick={::this.handleYesterday}>Yesterday</a></li>
                        <li><a href="#" onClick={::this.handleThisWeek}>This week</a></li>
                        <li><a href="#" onClick={::this.handlePreviousWeek}>Previous week</a></li>
                    </ul>
                </div>
            </li>
        </ul>
    ;

}

export default connect(
    (state) => ({
        start: state.times.start,
        end: state.times.end
    }),
    (dispatch) => bindActionCreators({
        setInterval: times.actions.setInterval
    }, dispatch)
)(RangePicker);
