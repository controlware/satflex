import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";

import ColorInput from "./ColorInput.js";
import Select from "./Select.js";

import "../css/FormControl.css";

export default class FormControl extends React.Component {

	constructor(props){
		super(props);

		this.onFocus = this.onFocus.bind(this);
	}

	componentDidMount(){
		this.element = ReactDOM.findDOMNode(this);
	}

	onFocus(){
		if(this.props.InformarValor){
			let settings = this.props.InformarValor;
			if(settings.success === undefined){
				settings.success = (valor) => {
					$(this.element).val(valor);
					if(this.props.onChange){
						let event = {target: {id: this.props.id, value: valor}};
						this.props.onChange(event);
					}
				}
			}
			window.InformarValor.show(settings);
		}
	}

	render(){
		let props = Object.assign({}, this.props);

		delete props.InformarValor;

		let value = props.value;
		if(value === undefined || value === null){
			value = "";
		}

		let className = (props.className ? props.className.split(" ") : []);
		className.push("form-control");

		if(props.size){
			className.push("form-control-" + props.size);
		}

		props.className = className.join(" ");
		props.value = value;
		props.onFocus = this.onFocus;

		switch(props.type){
			// Se o componente for do tipo Checkbox
			case "checkbox":
				return (
					<div className="form-check">
						<input type="checkbox" id={this.props.id} className="form-check-input" checked={value === "S"} defaultValue={this.props.defaultValue} disabled={this.props.disabled} onChange={this.props.onChange} onClick={this.props.onClick} />
						<label className="form-check-label" htmlFor={this.props.id}>{this.props.label}</label>
					</div>
				)

			// Se o componente for do tipo Color
			case "color":
				return (
					<ColorInput {...props} />
				)

			// Se o componente for do tipo Select
			case "select":
				delete props.type;

				return (
					<Select {...props} />
				)

			// Se o componente for algum input padrao que nao necessita ser personalizado
			default:
				return (
					<input {...props} />
				)
		}
	}
}
