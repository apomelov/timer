import {connect} from "react-redux"
import "react-datepicker/dist/react-datepicker.css"
import "../../styles/datepicker.css"
import moment from "moment";


const pad = (s) =>  (s < 10) ? `0${s}` : `${s}`;

const formatDuration = (start, end) => {
    const duration = moment.duration(end - start);
    const hours = Math.floor(duration.asHours());
    duration.subtract(hours, "hour");
    const minutes = Math.floor(duration.asMinutes());
    duration.subtract(minutes, "m");
    const seconds = Math.floor(duration.asSeconds());
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
};

class Length extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const start = this.props.interval.start;
        const end = Math.max(start, this.props.interval.end || this.props.now);
        return formatDuration(start, end);
    }

}

export default connect(
    (state) => ({
        now: state.times.now
    })
)(Length);
