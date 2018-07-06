import React from "react";

import Col from "./Col.js";
import ListGroup from "./ListGroup.js";
import ListItem from "./ListItem.js";
import Modal from "./Modal.js";
import Row from "./Row.js";
import Printer from "./Printer.js";

import {defaultMessageBoxError} from "../def/function.js";

import "../css/VendaReimprimirCupom.css";

export default class VendaReimprimirCupom extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			listaUltimosDocumentos: [],
			show: false
		};

		this.carregarUltimosDocumentos = this.carregarUltimosDocumentos.bind(this);
		this.imprimir = this.imprimir.bind(this);

		this.Printer = new Printer(this.props.Pool);
	}

	atualizarState(data){
		let numero = (data.numero ? data.numero : "");
		let cpfcnpj = (data.cpfcnpj ? data.cpfcnpj : "não informado");

		this.setState({
			iddocumento: data.iddocumento,
			numero: String(numero).lpad(6, "0"),
			totaldocumento: "R$ " + data.totaldocumento.format(2, ",", "."),
			cpfcnpj: cpfcnpj
		});
	}

	cancelar(){
		this.setState({
			show: false
		});
	}

	async carregarDocumento(localizarNumero){
		let query = [
			"SELECT iddocumento, numero, totaldocumento, cpfcnpj",
			"FROM documento",
			"WHERE operacao = $1",
			"  AND numero = $2",
			"ORDER BY iddocumento DESC",
			"LIMIT 1"
		].join(" ");

		let res = await this.props.Pool.query(query, ["CU", localizarNumero]);

		if(res.rowCount === 0){
			this.setState({
				show: false
			});
			window.MessageBox.show({
				title: "Houve uma falha",
				text: "Nenhum documento foi encontrado com o número " + localizarNumero + "."
			});
			return false;
		}

		let data = res.rows[0];
		this.atualizarState(data);
	}

	async carregarUltimosDocumentos(){
		let query = [
			"SELECT iddocumento, dthrcriacao, totaldocumento, totalquantidade, cpfcnpj",
			"FROM documento",
			"WHERE operacao = $1",
			"ORDER BY dthrcriacao DESC",
			"LIMIT 3"
		].join(" ");

		let res = await this.props.Pool.query(query, ["CU"]);

		let data = [];
		for(let row of res.rows){
			data.push(row);
		}

		this.setState({
			listaUltimosDocumentos: data
		});
	}

	componentWillReceiveProps(nextProps){
		this.setState({
			show: nextProps.show
		});

		if(!this.state.show && nextProps.show){
			this.carregarUltimosDocumentos();
		}
	}

	async imprimir(iddocumento){
		await this.Printer.imprimirDocumento(iddocumento, () => {
			this.setState({
				show: false
			});
			window.FastMessage.show("Cupom enviado para impressora com sucesso!");
		}, (err) => {
			if(err) defaultMessageBoxError(err);
		});
	}

	render(){
		return (
			<Modal id="VendaReimprimirCupom" title="Reimpressão de cupom" show={this.state.show} size="md" beforeClose={this.props.beforeClose} >
				<ListGroup>
					{this.state.listaUltimosDocumentos.map((documento, i) => {
						let dthrcriacao = documento.dthrcriacao.toLocaleString();
						let totaldocumento = "R$ " + documento.totaldocumento.format(2, ",", ".");
						let totalquantidade = Math.round(documento.totalquantidade);
						let cpfcnpj = documento.cpfcnpj;

						return (
							<ListItem key={i} onClick={() => {this.imprimir(documento.iddocumento)}}>
								<Row>
									<Col size="12">
										<h3 className="text-center">{dthrcriacao}</h3>
									</Col>
									<Col size="4" className="text-center">
										<span>Total documento</span>
										<h4>{totaldocumento}</h4>
									</Col>
									<Col size="4" className="text-center">
										<span>Qtde de itens</span>
										<h4>{totalquantidade}</h4>
									</Col>
									<Col size="4" className="text-center">
										<span>CPF/CNPJ</span>
										<h4>{cpfcnpj}</h4>
									</Col>
								</Row>
							</ListItem>
						)
					})}
				</ListGroup>
			</Modal>
		);
	}

}
