import React from "react";
import $ from "jquery";
import {EventEmitter} from "events";

import Progress from "./Progress.js";

import "../css/Loading.css";

export class LoadingEmitter extends EventEmitter  {
	constructor(){
		super();

		this.data = {
			visible: false,
			progress: null
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
	async hide(){
		this.data.visible = false;
		this.commitChange();
	}

	// Exibe a caixa de mensagem
	async show(){
		this.data.visible = true;
		this.data.progress = null;
		this.commitChange();
	}

	// Exibe a barra de progresso
	async progress(value){
		this.data.progress = value;
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
				<Progress value={this.state.progress} color="green" className={this.state.progress === null ? "d-none" : null} />
			</div>
		);
	}
}
