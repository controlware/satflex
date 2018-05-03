import React from "react";
import $ from "jquery";
import {EventEmitter} from "events";

import "../css/Loading.css";

export class LoadingEmitter extends EventEmitter  {
	constructor(){
		super();

		this.data = {
			visible: false
		}
	}

	// Adiciona um metodo a ser executado quando houver uma mudanca
	addChangeListener(callback){
		this.on("change", callback);
	}

	// Metodo responsavel em propagar as mudancas dos dados
	commitChange(){
		this.emit("change");
	}

	// Captura os dados atuais da classe
	getData(){
		return Object.assign({}, this.data);
	}

	// Retorna o elemento modal da caixa de mensagem
	getElement(){
		if(this.element === undefined){
			this.element = $("#Loading").get(0);
		}
		return this.element;
	}

	// Remove um metodo a ser executado quando houver uma mudanca
	removeChangeListener(callback){
		this.removeListener("change", callback);
	}

	// Esconde a caixa de mensagem
	hide(){
		this.data.visible = false;
		this.commitChange();
	}

	// Exibe a caixa de mensagem
	show(){
		this.data.visible = true;
		this.commitChange();
	}
}

export class LoadingElement extends React.Component {

	constructor(props){
		super(props);

		this.onChangeData = this.onChangeData.bind(this);

		this.state = props.LoadingEmitter.getData();
	}

	componentDidMount(){
		this.element = this.props.LoadingEmitter.getElement();
		this.props.LoadingEmitter.addChangeListener(this.onChangeData);
	}

	componentWillUnmount(){
		this.props.LoadingEmitter.removeChangeListener(this.onChangeData);
	}

	onChangeData(){
		let data = this.props.LoadingEmitter.getData();
		this.setState(data);
	}

	render(){
		if(!this.state.visible){
			return null;
		}

		return (
			<div className="Loading">
				<div className="Loading-Spinner"></div>
			</div>
		);
	}
}
