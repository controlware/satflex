import React from "react";

export default class Progress extends React.Component {
	render(){
		let value = Math.round(this.props.value) + "%";
		let background = null;
		switch(this.props.color){
			case "green":
				background = "bg-success";
				break;
			case "yellow":
				background = "bg-warning";
				break;
			case "red":
				background = "bg-danger";
				break;
			default:
				background = "bg-primary";
				break;
		}

		let className = "progress";
		if(this.props.className){
			className += " " + this.props.className;
		}

		return (
			<div className={className}>
				<div className={"progress-bar progress-bar-striped progress-bar-animated " + background} style={{width: value}}>
					{value}
				</div>
			</div>
		);
	}
}
