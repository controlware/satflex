import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import Select from "./Select.js";

export default class FormControl extends React.Component {

	constructor(props){
		super(props);

		this.currValue = (props.value ? props.value : props.defaultValue);
	}

	componentDidMount(){
		this.element = ReactDOM.findDOMNode(this);
	}

	componentWillReceiveProps(nextProps){
		if($(this.element).attr("currValue") !== undefined){
			this.currValue = $(this.element).attr("currValue");
			$(this.element).removeAttr("currValue");
		}else{
			this.currValue = nextProps.value;
		}

		if(this.currValue !== $(this.element).val()){
			$(this.element).val(this.currValue);
			if($(this.element).val() !== this.currValue){
				$(this.element).attr("unloadedValue", this.currValue);
			}

			if(nextProps.onChange){
				let event = document.createEvent("HTMLEvents");
				event.initEvent("change", false, true);
				this.element.dispatchEvent(event);
				nextProps.onChange(event);
			}
		}
	}

	render(){
		switch(this.props.type){
			// Se o componento for do tipo Checkbox
			case "checkbox":
				return (
					<div className="form-check">
						<input type="checkbox" id={this.props.id} className="form-check-input" defaultValue={this.props.defaultValue} disabled={this.props.disabled} onChange={this.props.onChange} />
						<label className="form-check-label" htmlFor={this.props.id}>{this.props.label}</label>
					</div>
				)

			// Se o componente for do tipo Select
			case "select":
				return (
					<Select id={this.props.id} className="form-control" options={this.props.options} defaultValue={this.props.defaultValue} disabled={this.props.disabled} onChange={this.props.onChange} dbtable={this.props.dbtable} dbcolumn={this.props.dbcolumn} dbparent={this.props.dbparent} dbfilter={this.props.dbfilter} />
				)

			// Se o componente for algum input padrao que nao necessita ser personalizado
			default:
				return (
					<input type={this.props.type} id={this.props.id} className="form-control" placeholder={this.props.placeholder} defaultValue={this.props.defaultValue} disabled={this.props.disabled} onChange={this.props.onChange} onKeyPress={this.props.onKeyPress} />
				)
		}
	}
}