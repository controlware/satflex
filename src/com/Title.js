import React from "react";
import "../css/Title.css";

export default class Title extends React.Component {
	render(){
		let text = (this.props.text !== undefined ? this.props.text : this.props.children);

		return (
			<h1 className="mb-4 mt-4">
				{text}
			</h1>
		)
	}
}
