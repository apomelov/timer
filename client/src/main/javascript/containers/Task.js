import "../../styles/table.pcss"
import {DropTarget} from "react-dnd";
import {taskContextMenuId} from "./TaskList"
import {contextMenu} from "../utils";

const squareTarget = {
    drop(props, monitor) {
        props.moveSegment(monitor.getItem().segmentId);
    }
};

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    };
}

class Task extends React.Component {

    constructor(props) {
        super(props);
    }

    render = () => {
        const { task, fields, onCheck, onDoubleClick, connectDropTarget, isOver } = this.props;
        let cls = "panel-row task";
        if (task.closedAt) cls += " closed";
        if (task.active) cls += " active";
        if (isOver) cls += " aimed";

        return connectDropTarget(
            <div className={cls}
                 onDoubleClick={() => onDoubleClick()}
                 onContextMenu={(e) => contextMenu(e, { menuId: taskContextMenuId, target: task })}
            >
                <div data-toggle="tooltip" data-placement="top" title={task.title}>
                    <input type="checkbox" style={{marginRight: "8px"}} checked={!!task.closedAt}
                           onChange={onCheck}/>
                    {task.title}
                </div>
                <div>
                    {
                        fields.map(field => {
                            const value = task.fields && task.fields[`${field.id}`] || "";
                            return <div key={field.id} data-toggle="tooltip" data-placement="top" title={value}>{value}</div>;
                        })
                    }
                </div>

            </div>
        );
    }
}

export default DropTarget("timeSegment", squareTarget, collect)(Task);