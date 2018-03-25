import React from "react";
import $ from "jquery";
import {EventEmitter} from "events";

import Icon from "./Icon.js";

import "../css/FastMessage.css";

export class FastMessageEmitter extends EventEmitter  {
	constructor(){
		super();

		this.data = {
			icon: null,
			text: null,
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
			this.element = $("#FastMessage").get(0);
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
	show(settings){
		if(typeof settings === "string"){
			settings = {text: settings};
		}

		settings = $.extend({
			icon: null,
			text: null,
			visible: true
		}, settings);

		this.data = $.extend(this.data, settings);
		this.commitChange();
	}
}

export class FastMessageModal extends React.Component {

	constructor(props){
		super(props);

		this.animateHide = this.animateHide.bind(this);
		this.animateShow = this.animateShow.bind(this);
		this.onChangeData = this.onChangeData.bind(this);
		this.onDocumentClick = this.onDocumentClick.bind(this);

		this.state = props.FastMessageEmitter.getData();
	}

	animateHide(){
		if(!this.state.visible){
			return true;
		}
		$(this.element).stop().animate({
			opacity: 0,
			top: window.innerHeight
		}, 180, () => {
			this.setState({
				visible: false
			});
		});
	}

	animateShow(){
		$(this.element).show();

		let totalTime = 3000;
		let currentTime = 0;

		let stages = [
			{progress: 0,    opacity: 0, top: 0},
			{progress: 0.05, opacity: 1, top: 0.3},
			{progress: 0.95, opacity: 1, top: 0.35},
			{progress: 1,    opacity: 0, top: 1}
		];

		let animateStages = () => {
			let stage = stages.shift();

			let animationTime = (totalTime * stage.progress) - currentTime;
			currentTime += animationTime;

			$(this.element).stop().animate({
				opacity: stage.opacity,
				top: (window.innerHeight * stage.top)
			}, animationTime, () => {
				if(stages.length > 0){
					animateStages();
				}else{
					this.setState({
						visible: false
					});
				}
			})
		}

		animateStages();
	}

	componentDidMount(){
		this.element = this.props.FastMessageEmitter.getElement();
		this.props.FastMessageEmitter.addChangeListener(this.onChangeData);
		document.addEventListener("click", this.onDocumentClick);
	}

	componentWillUnmount(){
		this.props.FastMessageEmitter.removeChangeListener(this.onChangeData);
		document.removeEventListener("click", this.onDocumentClick);
	}

	onChangeData(){
		let data = this.props.FastMessageEmitter.getData();
		if(data.visible !== this.state.visible){
			if(data.visible){
				this.animateShow();
			}else{
				this.animateHide();
			}
		}
		this.setState(data);
	}

	onDocumentClick(){
		if(this.state.visible){
			this.animateHide();
		}
	}

	render(){
		return (
			<div id="FastMessage">
				{this.state.icon ? <Icon name={this.state.icon} /> : null}
				<span>{this.state.text}</span>
			</div>
		);
	}
}
