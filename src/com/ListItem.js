import React from "react";
import "../css/ListItem.css";

export default class ListItem extends React.Component {
	render(){
		let props = Object.assign({}, this.props);

		let className = ["list-group-item"];
		if(props.className){
			className.push(props.className);
		}
		if(props.active){
			className.push("active");
		}
		delete props.active;
		delete props.className;

		return (
			<div className={className.join(" ")} {...props}>
				{props.children}
			</div>
		);
	}
}
