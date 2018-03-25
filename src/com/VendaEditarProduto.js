import React from "react";

import Button from "./Button.js";
import FormGroup from "./FormGroup.js";
import Hr from "./Hr.js";
import Modal from "./Modal.js";
import Row from "./Row.js";

import "../css/VendaEditarProduto.css";

export default class VendaEditarProduto extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			quantidade: this.props.documentoproduto.quantidade,
			preco: this.props.documentoproduto.preco,
			descontounitario: this.props.documentoproduto.descontounitario,
			acrescimounitario: this.props.documentoproduto.acrescimounitario,
			totaldesconto: this.props.documentoproduto.totaldesconto,
			totalacrescimo: this.props.documentoproduto.totalacrescimo,
			totalproduto: this.props.documentoproduto.totalproduto,
			show: this.props.show
		};

		this.calcularTotais = this.calcularTotais.bind(this);
		this.cancelar = this.cancelar.bind(this);
		this.confirmar = this.confirmar.bind(this);
		this.onChangeAcrescimoPercentual = this.onChangeAcrescimoPercentual.bind(this);
		this.onChangeAcrescimoUnitario = this.onChangeAcrescimoUnitario.bind(this);
		this.onChangeDescontoPercentual = this.onChangeDescontoPercentual.bind(this);
		this.onChangeDescontoUnitario = this.onChangeDescontoUnitario.bind(this);
		this.onChangePreco = this.onChangePreco.bind(this);
		this.onChangeQuantidade = this.onChangeQuantidade.bind(this);
		this.onChangeTotalAcrescimo = this.onChangeTotalAcrescimo.bind(this);
		this.onChangeTotalDesconto = this.onChangeTotalDesconto.bind(this);
	}

	calcularTotais(){
		let totalbruto = this.state.preco * this.state.quantidade;
		let totalacrescimo = this.state.acrescimounitario * this.state.quantidade;
		let totaldesconto = this.state.descontounitario * this.state.quantidade;
		let totalproduto = totalbruto - totaldesconto + totalacrescimo;

		this.setState({
			totalbruto: totalbruto,
			totalacrescimo: totalacrescimo,
			totaldesconto: totaldesconto,
			totalproduto: totalproduto
		});
	}

	cancelar(){
		this.setState({
			show: false
		});
	}

	componentWillReceiveProps(nextProps){
		this.setState({
			quantidade: nextProps.documentoproduto.quantidade,
			preco: nextProps.documentoproduto.preco,
			descontounitario: nextProps.documentoproduto.descontounitario,
			acrescimounitario: nextProps.documentoproduto.acrescimounitario,
			show: nextProps.show
		}, this.calcularTotais);
	}

	confirmar(){
		let documentoproduto = Object.assign({}, this.props.documentoproduto);

		documentoproduto.quantidade = this.state.quantidade;
		documentoproduto.preco = this.state.preco;
		documentoproduto.descontounitario = this.state.descontounitario;
		documentoproduto.acrescimounitario = this.state.acrescimounitario;
		documentoproduto.totaldesconto = this.state.totaldesconto;
		documentoproduto.totalacrescimo = this.state.totalacrescimo;
		documentoproduto.totalproduto = this.state.totalproduto;

		this.setState({
			show: false
		}, () => {
			this.props.atualizarDocumentoProduto(documentoproduto)
		});
	}

	onChangeAcrescimoPercentual(event){
		let acrescimopercentual = event.target.value.toFloat();
		let acrescimounitario  = this.state.preco * acrescimopercentual / 100;

		this.setState({
			acrescimounitario: acrescimounitario
		}, this.calcularTotais);
	}

	onChangeAcrescimoUnitario(event){
		let acrescimounitario  = event.target.value.toFloat();

		this.setState({
			acrescimounitario: acrescimounitario
		}, this.calcularTotais);
	}

	onChangeDescontoPercentual(event){
		let descontopercentual = event.target.value.toFloat();
		let descontounitario  = this.state.preco * descontopercentual / 100;

		this.setState({
			descontounitario: descontounitario
		}, this.calcularTotais);
	}

	onChangeDescontoUnitario(event){
		let descontounitario  = event.target.value.toFloat();

		this.setState({
			descontounitario: descontounitario
		}, this.calcularTotais);
	}

	onChangePreco(event){
		let preco  = event.target.value.toFloat();

		this.setState({
			preco: preco
		}, this.calcularTotais);
	}

	onChangeQuantidade(event){
		let quantidade  = event.target.value.toFloat();

		this.setState({
			quantidade: quantidade
		}, this.calcularTotais);
	}

	onChangeTotalAcrescimo(event){
		let acrescimounitario = event.target.value.toFloat() / this.state.quantidade;

		this.setState({
			acrescimounitario: acrescimounitario
		}, this.calcularTotais);
	}

	onChangeTotalDesconto(event){
		let descontounitario = event.target.value.toFloat() / this.state.quantidade;

		this.setState({
			descontounitario: descontounitario
		}, this.calcularTotais);
	}

	shouldComponentUpdate(nextProps){
		return nextProps.show;
	}

	render(){
		let totalbruto = this.state.preco * this.state.quantidade;
		let acrescimopercentual = (totalbruto > 0 ? this.state.totalacrescimo / totalbruto * 100 : 0);
		let descontopercentual = (totalbruto > 0 ? this.state.totaldesconto / totalbruto * 100 : 0);

		let decimalQuantidade = (this.props.documentoproduto.balanca === "S" ? 3 : 0);

		return (
			<Modal id="VendaEditarProduto" title={this.props.documentoproduto.descricao} show={this.state.show} size="md" beforeClose={this.props.beforeClose} >
				<Row>
					<FormGroup type="text" label="Quantidade" className="col-4" inputClassName="text-center" value={this.state.quantidade.format(decimalQuantidade, ",", ".")} onChange={this.onChangeQuantidade} InformarValor={{decimal: decimalQuantidade}} />
					<FormGroup type="text" label="Preço unitário" className="col-4" inputClassName="text-center" value={this.state.preco.format(2, ",", ".")} onChange={this.onChangePreco} InformarValor={{decimal: 2, money: true}} />
					<FormGroup type="text" label="Valor do item" className="col-4" inputClassName="text-center" value={totalbruto.format(2, ",", ".")} disabled={true} readOnly={true} />
					<FormGroup type="text" label="Desconto unitário" className="col-4" inputClassName="text-center" value={this.state.descontounitario.format(2, ",", ".")} onChange={this.onChangeDescontoUnitario} InformarValor={{decimal: 2, money: true}} />
					<FormGroup type="text" label="Desconto percentual" className="col-4" inputClassName="text-center" value={descontopercentual.format(2, ",", ".")} onChange={this.onChangeDescontoPercentual} InformarValor={{decimal: 0}} />
					<FormGroup type="text" label="Total de desconto" className="col-4" inputClassName="text-center" value={this.state.totaldesconto.format(2, ",", ".")} onChange={this.onChangeTotalDesconto} InformarValor={{decimal: 2, money: true}} />
					<FormGroup type="text" label="Acréscimo unitário" className="col-4" inputClassName="text-center" value={this.state.acrescimounitario.format(2, ",", ".")} onChange={this.onChangeAcrescimoUnitario} InformarValor={{decimal: 2, money: true}} />
					<FormGroup type="text" label="Acrésc percentual" className="col-4" inputClassName="text-center" value={acrescimopercentual.format(2, ",", ".")} onChange={this.onChangeAcrescimoPercentual} InformarValor={{decimal: 0}} />
					<FormGroup type="text" label="Total de acréscimo" className="col-4" inputClassName="text-center" value={this.state.totalacrescimo.format(2, ",", ".")} onChange={this.onChangeTotalAcrescimo} InformarValor={{decimal: 2, money: true}} />
					<FormGroup type="text" label="Total final" className="col-4 offset-8" inputClassName="text-center" value={this.state.totalproduto.format(2, ",", ".")} disabled={true} readOnly={true} />
				</Row>
				<Hr />
				<div className="text-right">
					<Button text="Confirmar" icon="thumbs-up" color="green" className="mr-2" onClick={this.confirmar} />
					<Button text="Voltar" icon="thumbs-down" color="red" onClick={this.cancelar} />
				</div>
			</Modal>
		)
	}
}
