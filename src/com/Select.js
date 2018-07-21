import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";

import ReactSelect from "react-select";
import "react-select/dist/react-select.css";

import {defaultMessageBoxError} from "../def/function.js";

export default class Select extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			options: (props.options === undefined ? [] : props.options),
			value: (props.value === undefined ? "" : props.value)
		};

		this.getDBOptions = this.getDBOptions.bind(this);
		this.onChange = this.onChange.bind(this);
		this.verifyComponentId = this.verifyComponentId.bind(this);
	}

	componentDidMount(){
		this.element = ReactDOM.findDOMNode(this);
		this.verifyComponentId();
		this.getDBOptions();
	}

	componentWillReceiveProps(nextProps){
		this.getDBOptions(nextProps);

		if(nextProps.value !== this.props.value){
			this.setState({
				value: nextProps.value
			});
		}
	}

	getDBOptions(props){
		props = (props === undefined ? this.props : props);

		if(props.dbtable === undefined){
			return true;
		}

		var dbtable = props.dbtable;
		var dbcolumn = props.dbcolumn;
		var dbfilter = props.dbfilter;
		var dbparent = props.dbparent;

		if(dbcolumn === undefined){
			dbcolumn = "descricao";
		}
		if(dbfilter === undefined && dbparent !== undefined){
			let parent = document.getElementById(dbparent);
			dbfilter = "id" + $(parent).attr("dbtable") + "=" + $(parent).val();
		}

		if(this.ajaxDBOptions !== null && this.ajaxDBOptions !== undefined){
			this.ajaxDBOptions.abort();
			this.ajaxDBOptions = null;
		}

		let query = "SELECT id"+dbtable+", "+dbcolumn+" FROM "+dbtable+" ORDER BY 2";

		this.props.Pool.query({text: query, rowMode: "array"}, (err, res) => {
			if(err){
				defaultMessageBoxError(err.message);
				return false;
			}
			let options = [];
			for(let i in res.rows){
				let row = res.rows[i];
				options.push({value: row[0], label: row[1]});
			}
			if(this.state.options !== options){
				this.setState({
					options: options
				});
			}
		});
	}

	onChange(option){
		let value = (option ? option.value : null);
		this.setState({
			value: value
		});

		if(this.props.onChange){
			let event = {target: {id: this.props.id, value: value}};
			this.props.onChange(event);
		}
	}

	verifyComponentId(){
		if(this.props.id){
			let input = $("[name='" + this.props.id + "']");
			if(input.length > 0){
				input.attr("id", $(input).attr("name"));
			}
		}
	}

	render(){
		// Captura as opcoes enviadas
		var options = this.state.options;

		// Verifica se as opcoes estao no formato JSON e converte para array de JSON
		if(!Array.isArray(options)){
			var optionsAux = [];
			for(var value in options){
				// Estrutura padrao das opcoes do Select
				optionsAux.push({
					value: value,
					label: options[value]
				});
			}
			options = optionsAux;
		}

		// Se nao foi passado um array como opcao, criar um array em branco
		if(!Array.isArray(options)){
			options = [];
		}

		return (
			<ReactSelect
				clearable={false}
				disabled={this.props.disabled}
				id={this.props.id}
				name={this.props.id}
				onChange={this.onChange}
				onInputChange={this.verifyComponentId}
				options={options}
				placeholder=""
				searchable={false}
				value={(this.state.value ? this.state.value : this.props.defaultValue)}
			/>
		);
	}

}
