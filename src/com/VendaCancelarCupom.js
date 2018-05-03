import React from "react";

import Button from "./Button.js";
import Col from "./Col.js";
import Hr from "./Hr.js";
import Modal from "./Modal.js";
import Row from "./Row.js";

import {currentTimestamp, defaultMessageBoxError} from "../def/function.js";

export default class VendaCancelarCupom extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			iddocumento: null,
			numero: null,
			totaldocumento: null,
			cpfcnpj: null,
			show: false
		};

		this.atualizarState = this.atualizarState.bind(this);
		this.cancelar = this.cancelar.bind(this);
		this.carregarUltimoDocumento = this.carregarUltimoDocumento.bind(this);
		this.confirmar = this.confirmar.bind(this);
		this.outroCupom = this.outroCupom.bind(this);
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

	async carregarUltimoDocumento(){
		let query = [
			"SELECT iddocumento, numero, totaldocumento, cpfcnpj",
			"FROM documento",
			"WHERE operacao = $1",
			"ORDER BY iddocumento DESC",
			"LIMIT 1"
		].join(" ");

		let res = await this.props.Pool.query(query, ["CU"]);
console.log(res);
		if(res.rowCount === 0){
			this.setState({
				show: false
			});
			window.MessageBox.show({
				title: "Houve uma falha",
				text: "Nenhum documento foi encontrado."
			});
			return false;
		}

		let data = res.rows[0];
		this.atualizarState(data);
	}

	componentWillReceiveProps(nextProps){
		this.setState({
			show: nextProps.show
		});

		if(!this.state.show && nextProps.show){
			this.carregarUltimoDocumento();
		}
	}

	async confirmar(){
		try {
			window.Loading.show();

			/* ************************************************
			T R A T A R   C A N C E L A M E N T O   N O   S A T
			************************************************ */
			let xmlcanc = null;
			let chavecanc = null;

			let query = [
				"UPDATE documento SET",
				"  status = $2, dthrcancelamento = $3,",
				"  xmlcanc = $4, chavecanc = $5",
				"WHERE iddocumento = $1"
			].join(" ");

			let values = [
				this.state.iddocumento,
				"C", currentTimestamp(),
				xmlcanc, chavecanc
			];

			await this.props.Pool.query(query, values);

			/* ************************************************************
			T R A T A R   I M P R E S S A O   D O   C A N C E L A M E N T O
			************************************************************ */


			window.FastMessage.show("Venda cancelada com sucesso!");
			this.setState({
				show: false
			});
		}catch(err){
			console.error(err.stack);
			defaultMessageBoxError(err.message);
		}finally{
			window.Loading.hide();
		}
	}

	outroCupom(){
		window.InformarValor.show({
			title: "Informe o número do cupom",
			mask: "999999",
			success: (value) => {
				this.carregarDocumento(value);
			}
		});
	}

	render(){
		return (
			<Modal id="VendaCancelarCupom" title="Cancelamento de venda" show={this.state.show} size="md" beforeClose={this.props.beforeClose} >
				<Row>
					<Col size="12" className="text-left">
						Tem certeza que deseja cancelar a venda?<br />
						<br />
						Cupom: {this.state.numero}<br />
						Total: {this.state.totaldocumento}<br />
						CPF: {this.state.cpfcnpj}
					</Col>
				</Row>
				<Hr />
				<Row>
					<Col size="5">
						<Button text="Outro cupom" color="blue" onClick={this.outroCupom} />
					</Col>
					<Col size="7" className="text-right">
						<Button text="Sim" icon="thumbs-up" color="green" className="mr-2" onClick={this.confirmar} />
						<Button text="Não" icon="thumbs-down" color="red" onClick={this.cancelar} />
					</Col>
				</Row>
			</Modal>
		);
	}

}
