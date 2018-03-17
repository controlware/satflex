import React from "react";
import "../css/Label.css";

export default class Label extends React.Component {

	render(){
		return (
			<label {...this.props}>
				{this.props.children}
			</label>
		);
	}

}
