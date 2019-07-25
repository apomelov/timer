import "../../styles/table.pcss"
import Length from "./Length";
import moment from "moment";

class Interval extends React.Component {

    constructor(props) {
        super(props);
    }

    render = () => {
        const { interval } = this.props;
        let cls = "panel-row interval";
        if (!interval.end) cls += " active";
        return <div className={cls}>
            <div>{interval.taskTitle}</div>
            <div><Length interval={interval} /></div>
            <div>{moment(interval.start).format("MMM DD YYYY, h:mm:ss")}</div>
        </div>;
    }
}

export default Interval;
