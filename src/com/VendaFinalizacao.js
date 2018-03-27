import React from "react";

import Button from "./Button.js";
import Card from "./Card.js";
import Col from "./Col.js";
import FormGroup from "./FormGroup.js";
import Hr from "./Hr.js";
import Modal from "./Modal.js";
import Row from "./Row.js";

import {defaultMessageBoxError} from "../def/function.js";

import "../css/VendaFinalizacao.css";

export default class VendaFinalizacao extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			documentopagamentos: [],
			formaspagamento: [],
			show: false
		};

		this.finalizarVenda = this.finalizarVenda.bind(this);
		this.removerPagamento = this.removerPagamento.bind(this);

		this.totalpago = 0;
		this.totalrestante = 0;
		this.totaltroco = 0;
	}

	carregarFormasPagamento(){
		let query = "SELECT idformapagamento, descricao, especie FROM formapagamento WHERE status = $1 ORDER BY especie";
		this.props.Pool.query(query, ["A"], (err, res) => {
			if(err){
				defaultMessageBoxError(err);
				return false;
			}
			this.setState({
				formaspagamento: res.rows
			});
		});
	}

	componentDidMount(){
		this.carregarFormasPagamento();
	}

	componentWillReceiveProps(nextProps){
		this.setState({
			show: nextProps.show
		});
	}

	finalizarVenda(){
		this.props.finalizarVenda(this.state.documentopagamentos, this.totaltroco);
	}

	iconEspecie(especie){
		switch(especie){
			case "01": return "dollar";
			case "02": return "keyboard";
			case "03":
			case "04": return "credit-card";
			case "10":
			case "11":
			case "12":
			case "13": return "discout";
			case "99": return "money";
			default: return "money";
		}
	}

	incluirPagamento(formapagamento){
		window.InformarValor.show({
			title: formapagamento.descricao,
			decimal: 2,
			money: true,
			value: this.totalrestante.format(2, ",", "."),
			success: (valor) => {
				valor = valor.toFloat();
				if(!(valor > 0)){
					return;
				}

				let documentopagamentos = this.state.documentopagamentos;
				documentopagamentos.push({
					idformapagamento: formapagamento.idformapagamento,
					descricao: formapagamento.descricao,
					totalpagamento: valor
				});
				this.setState({
					documentopagamentos: documentopagamentos
				});
			}
		})
	}

	removerPagamento(i){
		let documentopagamentos = this.state.documentopagamentos;
		documentopagamentos.splice(i, 1);
		this.setState({
			documentopagamentos: documentopagamentos
		});
	}

	render(){
		this.totalpago = 0;
		this.state.documentopagamentos.forEach((documentopagamento) => {
			this.totalpago += documentopagamento.totalpagamento;
		});
		if(this.totalpago > this.props.totaldocumento){
			this.totalrestante = 0;
			this.totaltroco = this.totalpago - this.props.totaldocumento;
		}else{
			this.totalrestante = this.props.totaldocumento - this.totalpago;
			this.totaltroco = 0;
		}

		return (
			<div className={"vendafinalizacao" + (this.state.show ? "" : " d-none")}>
				<Modal title="Finalização da venda" size="lg" show={this.state.show} beforeClose={this.props.beforeClose}>
					<div className="vendafinalizacao-totaldocumento">
						{this.props.totaldocumento.format(2, ",", ".")}
					</div>
					<Row className="vendafinalizacao-formapagamento">
						{this.state.formaspagamento.map((formapagamento, i) => {
							return (
								<Col size="4" key={i}>
									<Button text={formapagamento.descricao} block={true} size="lg" icon={this.iconEspecie(formapagamento.especie)} disabled={this.totalrestante === 0} onClick={() => { this.incluirPagamento(formapagamento) }} />
								</Col>
							)
						})}
					</Row>
					<Hr />
					<Row>
						<FormGroup label="Total pago" className="col-3" inputClassName="text-center" size="lg" value={this.totalpago.format(2, ",", ".")} disabled={true} />
						<FormGroup label="Total restante" className="col-3" inputClassName="text-center" size="lg" value={this.totalrestante.format(2, ",", ".")} disabled={true} warning={this.totalrestante} />
						<FormGroup label="Total de troco" className="col-3" inputClassName="text-center" size="lg" value={this.totaltroco.format(2, ",", ".")} disabled={true} warning={this.totaltroco} />
						<Col size="3" labelMargin={true}>
							<Button text="Finalizar!" icon="thumbs-up" block={true} size="lg" color="green" disabled={this.totalrestante > 0} onClick={this.finalizarVenda} />
						</Col>
					</Row>
					<VendaFinalizacaoListaPagamentos documentopagamentos={this.state.documentopagamentos} removerPagamento={this.removerPagamento} />
				</Modal>
				<div className="vendafinalizacao-botoesextras">
					<Row>
						<Col size="4">
							<Button text="Desconto" icon="folder-minus" size="sm" block={true} disabled={this.totalpago > 0} onClick={this.props.aplicarDesconto} />
						</Col>
						<Col size="4">
							<Button text="Acréscimo" icon="folder-plus" size="sm" block={true} disabled={this.totalpago > 0} onClick={this.props.aplicarAcrescimo} />
						</Col>
						<Col size="4">
							<Button text="Incluir 10%" icon="user-plus" size="sm" block={true} onClick={this.props.incluirDezPorcento} />
						</Col>
					</Row>
				</div>
			</div>
		)
	}
}

class VendaFinalizacaoListaPagamentos extends React.Component {
	render(){
		if(this.props.documentopagamentos.length === 0){
			return null;
		}

		return (
			<div>
				<Hr className="mt-0" />
				<Row className="justify-content-center">
					{this.props.documentopagamentos.map((documentopagamento, i) => {
						return (
							<Col size="6" key={i}>
								<Card>
									<Row>
										<Col size="5">
											<span>{documentopagamento.descricao}</span>
										</Col>
										<Col size="4">
											<span>{documentopagamento.totalpagamento.format(2, ",", ".")}</span>
										</Col>
										<Col size="3">
											<Button icon="bin" color="red" size="sm" block={true} onClick={() => {this.props.removerPagamento(i)}} />
										</Col>
									</Row>
								</Card>
							</Col>
						)
					})}
				</Row>
			</div>
		)
	}
}
