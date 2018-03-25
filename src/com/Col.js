import React from "react";

export default class Col extends React.Component {
	render(){
		let size = (this.props.size === undefined ? 1 : this.props.size);
		let className = ["col-" + size];

		if(this.props.className){
			className.push(this.props.className);
		}

		let label = null;
		if(this.props.labelMargin){
			label = <label>&nbsp;</label>;
		}

		return (
			<div className={className.join(" ")}>
				{label}
				{this.props.children}
			</div>
		);
	}
}
