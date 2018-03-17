import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";

export default class Select extends React.Component {

	constructor(props){
		super(props);

		this.getDBOptions = this.getDBOptions.bind(this);

		this.state = {
			options: (props.options === undefined ? [] : props.options)
		};

		this.currValue = (props.value ? props.value : props.defaultValue);
	}

	componentDidMount(){
		this.element = ReactDOM.findDOMNode(this);

		$(this.element).bind("change", () => {
			$(this.element).attr("currValue", $(this.element).val());
			this.forceUpdate();
		});

		if(this.props.dbparent){
			let parent = document.getElementById(this.props.dbparent);
			$(parent).bind("change", () => {
				this.getDBOptions();
			}).on("updateChildrenOptions", () => {
				this.getDBOptions();
			});
		}

		this.getDBOptions();
	}

	componentWillReceiveProps(nextProps){
		this.getDBOptions(nextProps);
	}

	drawOption(option, i){
		if(typeof option !== "object"){
			option = {value: option};
		}
		if(typeof option.text === "undefined"){
			option.text = option.value;
		}
		return <option key={i} value={option.value}>{option.text}</option>
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
		/*
		this.ajaxDBOptions = Backend({
			name: "dbcontrol/select",
			data: {
				dbtable: dbtable,
				dbcolumn:dbcolumn,
				dbfilter: dbfilter
			},
			complete: () => {
				this.ajaxDBOptions = null;
			},
			success: (result) => {
				var options = result.options;
				options.unshift({"": ""});
				if(this.state.options !== options){
					this.setState({
						options: options
					});
				}
			},
			error: (message) => {
				alert(message);
			}
		});
		*/
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
					text: options[value],
					selected: false
				});
			}
			options = optionsAux;
		}

		// Se nao foi passado um array como opcao, criar um array em branco
		if(!Array.isArray(options)){
			options = [];
		}

		// Copia as propriedes para uma variavel para pode remover algumas
		// propriedades que nao devem ficar disponiveis no elemento
		let props = Object.assign({}, this.props);
		delete props.options;

		return (
			<select {...props} value={$(this.element).attr("currValue")}>
				{options.map(this.drawOption)}
			</select>
		)
	}

}
