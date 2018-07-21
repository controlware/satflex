import React from "react";

import Button from "./Button.js";
import Col from "./Col.js";
import FormControl from "./FormControl.js";
import Label from "./Label.js";
import Modal from "./Modal.js";
import Row from "./Row.js";

import "../css/VendaAplicarDesconto.css";

export default class VendaEditarProduto extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			descontovalor: 0,
			descontopercentual: 0,
			totaldocumento: props.totalbruto,
			show: props.show
		};

		this.cancelar = this.cancelar.bind(this);
		this.confirmar = this.confirmar.bind(this);
		this.onChangeDescontoPercentual = this.onChangeDescontoPercentual.bind(this);
		this.onChangeDescontoValor = this.onChangeDescontoValor.bind(this);
		this.onChangeTotalLiquido = this.onChangeTotalLiquido.bind(this);
	}

	cancelar(){
		this.setState({
			show: false
		});
	}

	componentWillReceiveProps(nextProps){
		this.setState({
			descontovalor: 0,
			descontopercentual: 0,
			totaldocumento: nextProps.totalbruto,
			show: nextProps.show
		});
	}

	confirmar(){
		this.props.aplicarDesconto(this.props.totalbruto, this.state.descontovalor);
	}

	onChangeDescontoPercentual(event){
		let descontopercentual = event.target.value.toFloat();
		let descontovalor = this.props.totalbruto * descontopercentual / 100;
		let totaldocumento = this.props.totalbruto - descontovalor;

		this.setState({
			descontopercentual: descontopercentual,
			descontovalor: descontovalor,
			totaldocumento: totaldocumento
		});
	}

	onChangeDescontoValor(event){
		let descontovalor = event.target.value.toFloat();
		let descontopercentual = descontovalor / this.props.totalbruto * 100;
		let totaldocumento = this.props.totalbruto - descontovalor;

		this.setState({
			descontopercentual: descontopercentual,
			descontovalor: descontovalor,
			totaldocumento: totaldocumento
		});
	}

	onChangeTotalLiquido(event){
		let totaldocumento = event.target.value.toFloat();
		if(totaldocumento > this.props.totalbruto){
			totaldocumento = this.props.totalbruto;
		}
		let descontovalor = this.props.totalbruto - totaldocumento;
		let descontopercentual = descontovalor / this.props.totalbruto * 100;

		this.setState({
			descontopercentual: descontopercentual,
			descontovalor: descontovalor,
			totaldocumento: totaldocumento
		});
	}

	render(){
		return (
			<Modal id="VendaAplicarDesconto" title="Aplicando desconto..." show={this.state.show} size="md" beforeClose={this.props.beforeClose} >
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
						<Label>Desconto em percentual</Label>
					</Col>
					<Col size="6">
						<FormControl type="text" className="text-center" value={this.state.descontopercentual.format(0, ",", ".")} InformarValor={{decimal: 0}} onChange={this.onChangeDescontoPercentual} />
					</Col>
				</Row>
				<Row>
					<Col size="6">
						<Label>Desconto em valor</Label>
					</Col>
					<Col size="6">
						<FormControl type="text" className="text-center" value={this.state.descontovalor.format(2, ",", ".")} InformarValor={{decimal: 2, money: true}} onChange={this.onChangeDescontoValor} />
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
