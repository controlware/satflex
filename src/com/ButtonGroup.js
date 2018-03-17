import React from "react";

export default class ButtonGroup extends React.Component {
	render(){

		var className = [
			"btn-group",
			"btn-group-" + this.props.size
		];

		if(this.props.className){
			className.push(this.props.className);
		}

		return (
			<div className={className.join(" ")}>
				{this.props.children}
			</div>
		);
	}
}

ButtonGroup.defaultProps = {
	size: "md"
};