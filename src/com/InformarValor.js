import React from "react";
import $ from "jquery";
import {EventEmitter} from "events";

import Button from "./Button.js";
import Col from "./Col.js";
import Icon from "./Icon.js";
import Modal from "./Modal.js";
import Row from "./Row.js";

import "../css/InformarValor.css";

export class InformarValorEmitter extends EventEmitter {
	constructor(){
		super();

		this.data = {
			decimal: 0, // Quantidade de casas decimais
			mask: null, // Mascara de entrada
			money: false, // Simbolo monetario a frente do valor
			title: null, // Titulo da janela
			value: "", // Valor pre-informado
			visible: false, // Define se o modal esta visivel
			success: () => {}, // Metodo executado ao confirmar valor
			fail: () => {} // Metodo executado ao cancelar
		};
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
			this.element = $("#informarvalor").get(0);
		}
		return this.element;
	}

	// Remove um metodo a ser executado quando houver uma mudanca
	removeChangeListener(callback){
		this.removeListener("change", callback);
	}

	// Escone a caixa de mensagem
	hide(){
		this.data.visible = false;
		this.commitChange();
	}

	// Exibe a caixa de mensagem
	show(settings){
		settings = $.extend({
			decimal: 0, // Quantidade de casas decimais
			mask: null, // Mascara de entrada
			money: false, // Simbolo monetario a frente do valor
			title: "Informe o valor", // Titulo da janela
			value: "", // Valor pre-informado
			visible: true, // Define se o modal esta visivel
			success: () => {}, // Metodo executado ao confirmar valor
			fail: () => {} // Metodo executado ao cancelar
		}, settings);

		this.data = $.extend(this.data, settings);
		this.commitChange();
	}
}

export class InformarValorModal extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			decimal: 0, // Quantidade de casas decimais
			mask: null, // Mascara de entrada
			money: false, // Simbolo monetario a frente do valor
			title: null, // Titulo da janela
			value: "", // Valor pre-informado
			visible: false, // Define se o modal esta visivel
			success: () => {}, // Metodo executado ao confirmar valor
			fail: () => {} // Metodo executado ao cancelar
		};

		this.backspace = this.backspace.bind(this);
		this.beforeClose = this.beforeClose.bind(this);
		this.beforeOpen = this.beforeOpen.bind(this);
		this.cancelar = this.cancelar.bind(this);
		this.confirmar = this.confirmar.bind(this);
		this.drawButton = this.drawButton.bind(this);
		this.onChangeData = this.onChangeData.bind(this);
		this.pressNumber = this.pressNumber.bind(this);
		this.valorKeyDown = this.valorKeyDown.bind(this);
		this.valorKeyUp = this.valorKeyUp.bind(this);

		this.pristine = true;
		this.visible = false;

		this.StringMask = require("string-mask");
	}

	afterOpen(){
		$("#informarvalor-valor").focus();
	}

	backspace(){
		let valor = $("#informarvalor-valor").val();
		$("#informarvalor-valor").val(valor.substr(0, valor.length - 1));
		this.valorKeyUp();
	}

	beforeClose(){
		this.visible = false;
	}

	beforeOpen(){
		this.visible = true;
	}

	cancelar(){
		$(this.element).modal("hide");
		this.state.fail();
	}

	confirmar(){
		$(this.element).modal("hide");

		let valor = $("#informarvalor-valor").val();
		if(typeof this.state.mask === "string"){
			valor = this.maskedValue(valor);
		}else{
			valor = valor / Math.pow(10, this.state.decimal);
			valor = valor.format(this.state.decimal, ",", ".");
		}

		this.state.success(valor);
	}

	componentDidMount(){
		this.props.InformarValorEmitter.addChangeListener(this.onChangeData);
		this.element = this.props.InformarValorEmitter.getElement();

		document.addEventListener("keyup", (e) => {
			if(this.visible){
				switch(e.keyCode){
					case 8: this.backspace(); return;
					case 48: this.pressNumber(0); return;
					case 49: this.pressNumber(1); return;
					case 50: this.pressNumber(2); return;
					case 51: this.pressNumber(3); return;
					case 52: this.pressNumber(4); return;
					case 53: this.pressNumber(5); return;
					case 54: this.pressNumber(6); return;
					case 55: this.pressNumber(7); return;
					case 56: this.pressNumber(8); return;
					case 57: this.pressNumber(9); return;
					default: return;
				}
			}
		});
	}

	componentWillUnmount(){
		this.props.InformarValorEmitter.removeChangeListener(this.onChangeData);
	}

	drawButton(number, i){
		return (
			<Col size="4" key={i}>
				<Button text={number} block={true} color="blue" onClick={() => {this.pressNumber(number)}} />
			</Col>
		);
	}

	maskedValue(value){
		let mask = new this.StringMask(this.state.mask);
		return mask.apply(value);
	}

	onChangeData(){
		let data = this.props.InformarValorEmitter.getData();

		if(data.visible){
			$(this.element).modal("show");
		}else{
			$(this.element).modal("hide");
		}

		if(data.value !== undefined && data.value.length > 0){
			data.value = data.value.toFloat().format(data.decimal, "", "");
		}

		this.setState(data, () => {
			this.pristine = false;
			$("#informarvalor-valor").val(data.value);
			this.valorKeyUp();
			this.pristine = true;
		});
	}

	pressNumber(number){
		$("#informarvalor-valor").val($("#informarvalor-valor").val() + number);
		this.valorKeyUp();
	}

	valorKeyDown(e){
		if([8, 13, 27, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57].indexOf(e.keyCode) === -1){
			return false;
		}
		if(e.keyCode === 13){
			this.confirmar();
		}
	}

	valorKeyUp(){
		if(this.pristine){
			this.pristine = false;
			$("#informarvalor-valor").val($("#informarvalor-valor").val().substr(-1));
		}

		let valor = $("#informarvalor-valor").val();
		if(typeof this.state.mask === "string"){
			valor = this.maskedValue(valor);
		}else{
			if(valor.length === 0){
				$("#informarvalor-valor").val(0);
			}
			valor = valor / Math.pow(10, this.state.decimal);
			valor = valor.format(this.state.decimal, ",", ".");
		}
		$("#informarvalor-display").html(valor);
		this.verificarTamanho();

		if(valor.length > 0){
			$("#informarvalor-backspace").show();
		}else{
			$("#informarvalor-backspace").hide();
		}

		$("#informarvalor-valor").focus();
	}

	verificarTamanho(){
		if($("#informarvalor-display").text().length < 10){
			$("#informarvalor-display").removeClass("informarvalor-display-sm");
		}else{
			$("#informarvalor-display").addClass("informarvalor-display-sm");
		}
	}

	render(){
		let numbers = [7, 8, 9, 4, 5, 6, 1, 2, 3];
		let displayClass = (this.state.money ? "informarvalor-display-money" : "");

		return (
			<Modal id="informarvalor" size="sm" title={this.state.title} afterOpen={this.afterOpen} beforeOpen={this.beforeOpen} beforeClose={this.beforeClose}>
				<input type="text" id="informarvalor-valor" readOnly={true} onKeyDown={this.valorKeyDown} onKeyUp={this.valorKeyUp} />
				<div id="informarvalor-display-parent">
					<div id="informarvalor-display" className={displayClass}></div>
					<Icon id="informarvalor-backspace" name="chevron-left" onClick={this.backspace} />
				</div>
				<Row id="informarvalor-keyboard">
					{numbers.map(this.drawButton)}
					<Col size="4">
						<Button icon="cross" block={true} color="red" onClick={this.cancelar} />
					</Col>
					{this.drawButton(0)}
					<Col size="4">
						<Button icon="checkmark" block={true} color="green" onClick={this.confirmar} />
					</Col>
				</Row>
			</Modal>
		);
	}
}
