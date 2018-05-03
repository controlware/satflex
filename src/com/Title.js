import React from "react";
import "../css/Title.css";

export default class Title extends React.Component {
	render(){
		let text = (this.props.text !== undefined ? this.props.text : this.props.children);
		let model = (this.props.model !== undefined ? this.props.model : 1);

		return (
			<h1 className={"title-model-" + model}>
				{text}
			</h1>
		)
	}
}
