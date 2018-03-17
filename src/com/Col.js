import React from "react";

export default class Col extends React.Component {
	render(){
		var className = ["col-" + this.props.size];
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