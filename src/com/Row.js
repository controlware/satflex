import React from "react";

export default class Row extends React.Component {
	render(){
		let className = ["row"];
		if(this.props.className){
			className.push(this.props.className);
		}

		let props = Object.assign({}, this.props);
		delete props.className;

		return (
			<div {...props} className={className.join(" ")}>
				{this.props.children}
			</div>
		);
	}
}
