import React from "react";

export default class Center extends React.Component {

	render(){
		let className = [this.props.className];
		className.push("text-center");

		return (
			<div className={className.join(" ")}>
				{this.props.children}
			</div>
		)
	}
}
