import React from "react";
import FormControl from "./FormControl.js";
import Label from "./Label.js";
import "../css/FormGroup.css";

export default class FormGroup extends React.Component {

	render(){
		var className = [
			"form-group"
		];

		if(this.props.className){
			className.push(this.props.className);
		}

		return (
			<div className={className.join(" ")}>
				{["checkbox"].indexOf(this.props.type) > -1 ? null : <Label htmlFor={this.props.id}>{this.props.label}</Label>}
				<FormControl {...this.props} />
			</div>
		)
	}
}
