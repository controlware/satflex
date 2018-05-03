import React from "react";
import "../css/ListGroup.css";

export default class ListGroup extends React.Component {
	render(){
		let className = ["list-group"];

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
