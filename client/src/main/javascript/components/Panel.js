
export default class Panel extends React.Component {

    render() {

        const panelHeading = this.props.title
            ? <div className="panel-heading"><h3 className="panel-title">{this.props.title}</h3></div>
            : "";

        const titleStyle = this.props.titleStyle || "default";
        const style = this.props.style || { };

        return <div className={"panel panel-" + titleStyle} style={style}>
            {panelHeading}
            <div className="panel-body">
                {this.props.children}
            </div>
        </div>

    }

}

