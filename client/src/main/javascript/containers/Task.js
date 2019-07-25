import "../../styles/table.pcss"

class Task extends React.Component {

    constructor(props) {
        super(props);
    }

    render = () => {
        const { task, customFields, onCheck, onDoubleClick} = this.props;
        let cls = "panel-row task";
        if (task.closedAt) cls += " closed";
        if (task.active) cls += " active";


        return <div className={cls} onDoubleClick={() => onDoubleClick()}>
            <div data-toggle="tooltip" data-placement="top" title={task.title}>
                <input type="checkbox" style={{marginRight: "8px"}} checked={!!task.closedAt}
                       onChange={() => onCheck()}/>
                {task.title}
            </div>
            <div>999:59:59</div>
            <div>
                {
                    customFields.map(field => {
                        const value = task.customFields[`${field.id}`] || "";
                        return <div key={field.id} data-toggle="tooltip" data-placement="top" title={value}>{value}</div>;
                    })
                }
            </div>
        </div>;
    }
}

export default Task;