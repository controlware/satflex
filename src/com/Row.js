import React from "react";

export default class Row extends React.Component {
	render(){
		var className = ["row"];
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