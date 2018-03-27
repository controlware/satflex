import React from "react";

export default class Card extends React.Component {

	render(){
		let className = [this.props.className];
		className.push("card");

		return (
			<div className={className.join(" ")}>
				{this.props.children}
			</div>
		)
	}
}
