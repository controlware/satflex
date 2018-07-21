import React from "react";
import "../css/SubTitle.css";

export default class SubTitle extends React.Component {
	render(){
		let text = (this.props.text !== undefined ? this.props.text : this.props.children);
		let model = (this.props.model !== undefined ? this.props.model : 1);

		return (
			<h3 className={"subtitle-model-" + model}>
				{text}
			</h3>
		)
	}
}
