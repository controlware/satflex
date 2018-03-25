import React from "react";
import "./../lib/metro-icons-3.0.15/css/metro-icons.min.css";

export default class Icon extends React.Component {
	render(){
		var className = [
			"icon",
			"mif-" + this.props.name
		];
		if(this.props.className){
			className.push(this.props.className);
		}

		var style = {};
		if(this.props.onClick){
			style.cursor = "pointer";
		}

		return (
			<span {...this.props} className={className.join(" ")} style={style}></span>
		);
	}
}
