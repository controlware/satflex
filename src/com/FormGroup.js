import React from "react";
import FormControl from "./FormControl.js";
import Label from "./Label.js";
import "../css/FormGroup.css";

export default class FormGroup extends React.Component {

	render(){
		let props = Object.assign({}, this.props);

		let className = ["form-group"];
		if(props.className){
			className.push(props.className);
		}
		if(props.warning){
			className.push("form-group-warning");
			delete props.warning;
		}

		if(props.InformarValor){
			if(props.InformarValor.title === undefined){
				props.InformarValor.title = this.props.label;
			}
		}

		props.className = props.inputClassName;
		delete props.inputClassName;

		return (
			<div className={className.join(" ")}>
				{["checkbox"].indexOf(this.props.type) > -1 ? null : <Label htmlFor={this.props.id}>{this.props.label}</Label>}
				<FormControl {...props} />
			</div>
		)
	}
}
