import React from "react";

import Button from "./Button.js";
import Col from "./Col.js";
import FormControl from "./FormControl.js";
import Label from "./Label.js";
import Modal from "./Modal.js";
import Row from "./Row.js";

import "../css/VendaAplicarAcrescimo.css";

export default class VendaEditarProduto extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			acrescimovalor: 0,
			acrescimopercentual: 0,
			totaldocumento: props.totalbruto,
			show: props.show
		};

		this.cancelar = this.cancelar.bind(this);
		this.confirmar = this.confirmar.bind(this);
		this.onChangeAcrescimoPercentual = this.onChangeAcrescimoPercentual.bind(this);
		this.onChangeAcrescimoValor = this.onChangeAcrescimoValor.bind(this);
		this.onChangeTotalLiquido = this.onChangeTotalLiquido.bind(this);
	}

	cancelar(){
		this.setState({
			show: false
		});
	}

	componentWillReceiveProps(nextProps){
		this.setState({
			acrescimovalor: 0,
			acrescimopercentual: 0,
			totaldocumento: nextProps.totalbruto,
			show: nextProps.show
		});
	}

	confirmar(){
		this.props.aplicarAcrescimo(this.props.totalbruto, this.state.acrescimovalor);
	}

	onChangeAcrescimoPercentual(event){
		let acrescimopercentual = event.target.value.toFloat();
		let acrescimovalor = this.props.totalbruto * acrescimopercentual / 100;
		let totaldocumento = this.props.totalbruto - this.props.totaldesconto + acrescimovalor;

		this.setState({
			acrescimopercentual: acrescimopercentual,
			acrescimovalor: acrescimovalor,
			totaldocumento: totaldocumento
		});
	}

	onChangeAcrescimoValor(event){
		let acrescimovalor = event.target.value.toFloat();
		let acrescimopercentual = acrescimovalor / this.props.totalbruto * 100;
		let totaldocumento = this.props.totalbruto - this.props.totaldesconto + acrescimovalor;

		this.setState({
			acrescimopercentual: acrescimopercentual,
			acrescimovalor: acrescimovalor,
			totaldocumento: totaldocumento
		});
	}

	onChangeTotalLiquido(event){
		let totaldocumento = event.target.value.toFloat();
		if(totaldocumento < this.props.totalbruto){
			totaldocumento = this.props.totalbruto;
		}
		let acrescimovalor =  totaldocumento - this.props.totalbruto + this.props.totaldesconto;
		let acrescimopercentual = acrescimovalor / this.props.totalbruto * 100;

		this.setState({
			acrescimopercentual: acrescimopercentual,
			acrescimovalor: acrescimovalor,
			totaldocumento: totaldocumento
		});
	}

	render(){
		return (
			<Modal id="VendaAplicarAcrescimo" title="Aplicando acréscimo..." show={this.state.show} size="md" beforeClose={this.props.beforeClose} >
				<Row>
					<Col size="6">
						<Label>Total dos itens</Label>
					</Col>
					<Col size="6">
						<FormControl type="text" className="text-center" disabled={true} value={this.props.totalbruto.format(2, ",", ".")} />
					</Col>
				</Row>
				<Row>
					<Col size="6">
						<Label>Total de desconto</Label>
					</Col>
					<Col size="6">
						<FormControl type="text" className="text-center" disabled={true} value={this.props.totaldesconto.format(2, ",", ".")} />
					</Col>
				</Row>
				<Row>
					<Col size="6">
						<Label>Acréscimo em percentual</Label>
					</Col>
					<Col size="6">
						<FormControl type="text" className="text-center" value={this.state.acrescimopercentual.format(0, ",", ".")} InformarValor={{decimal: 0}} onChange={this.onChangeAcrescimoPercentual} />
					</Col>
				</Row>
				<Row>
					<Col size="6">
						<Label>Acréscimo em valor</Label>
					</Col>
					<Col size="6">
						<FormControl type="text" className="text-center" value={this.state.acrescimovalor.format(2, ",", ".")} InformarValor={{decimal: 2, money: true}} onChange={this.onChangeAcrescimoValor} />
					</Col>
				</Row>
				<Row>
					<Col size="6">
						<Label>Total final</Label>
					</Col>
					<Col size="6">
						<FormControl type="text" className="text-center" value={this.state.totaldocumento.format(2, ",", ".")} InformarValor={{decimal: 2, money: true}} onChange={this.onChangeTotalLiquido} />
					</Col>
				</Row>
				<div className="text-right mt-2">
					<Button icon="undo" color="red" className="float-left" onClick={this.cancelar} />
					<Button text="Confirmar" icon="thumbs-up" color="green" onClick={this.confirmar} />
				</div>
			</Modal>
		)
	}
}
