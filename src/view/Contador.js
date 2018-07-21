import React from "react";
import $ from "jquery";

import {Pool} from "../def/postgresql.js";

import Button from "../com/Button.js";
import Col from "../com/Col.js";
import Content from "../com/Content.js";
import Email from "../com/Email.js";
import FormGroup from "../com/FormGroup.js";
import Row from "../com/Row.js";
import SubTitle from "../com/SubTitle.js";
import Title from "../com/Title.js";

import {valorParametro, writeTemporary} from "./../def/function.js";

export default class Contador extends React.Component {

	constructor(props) {
		super(props);

		this.atualizarEmailContador = this.atualizarEmailContador.bind(this);
		this.carregarDocumentos = this.carregarDocumentos.bind(this);
		this.enviarEmail = this.enviarEmail.bind(this);

		this.Pool = new Pool();
	}

	async atualizarEmailContador(){
		await this.Pool.query("UPDATE parametro SET valor = $1 WHERE grupo = $2 AND nome = $3", [$("#email").val(), "CONTADOR", "EMAIL"]);
	}

	async carregarDocumentos(){
		let query = [
			"SELECT chave, xml, chavecanc, xmlcanc",
			"FROM documento",
			"WHERE xml IS NOT NULL",
			"  AND chave IS NOT NULL",
			"  AND dthrcriacao::DATE BETWEEN $1 AND $2",
			"ORDER BY dthrcriacao"
		].join(" ");
		let res = await this.Pool.query(query, [$("#dtinicial").val(), $("#dtfinal").val()]);
		return res.rows;
	}

	carregarEmailContador(){
		valorParametro(this.Pool, "CONTADOR", "EMAIL", (valor) => {
			$("#email").val(valor);
		});
	}

	componentDidMount(){
		this.carregarEmailContador();
	}

	async enviarEmail(){
		let destinatario = $("#email").val();
		let dtinicial = $("#dtinicial").val();
		let dtfinal = $("#dtfinal").val();

		// Verifica se os campos foram preenchidos
		if(destinatario.length === 0){
			window.MessageBox.show({
				text: "Informe o e-mail do contador antes de prosseguir."
			});
			return false;
		}
		if(dtinicial.length === 0){
			window.MessageBox.show({
				text: "Informe a data inicial antes de prosseguir."
			});
			return false;
		}
		if(dtfinal.length === 0){
			window.MessageBox.show({
				text: "Informe a data final antes de prosseguir."
			});
			return false;
		}

		// Abre o loading
		window.Loading.show();

		// Reformata as datas de 'Y-m-d' para 'd/m/Y'
		dtinicial = dtinicial.split("-").reverse().join("/");
		dtfinal = dtfinal.split("-").reverse().join("/");

		// Atualiza o email do contador
		await this.atualizarEmailContador();

		// Carrega os documentos
		let documentos = await this.carregarDocumentos();

		// Cria o arquivo ZIP
		let zip = new window.zip();
		documentos.forEach((documento) => {
			if(documento.xml){
				zip.file(documento.chave + ".xml", documento.xml);
			}
			if(documento.xmlcanc){
				zip.file(documento.chavecanc + ".xml", documento.xmlcanc);
			}
		});
		let zippedData = zip.generate({
			base64: false,
			compression: "DEFLATE"
		});
		let filename = new Date().toISOString().substr(0, 10) + ".zip";
		let zipfile = writeTemporary(filename, zippedData);

		// Envia o email
		let email = new Email();
		email.destinatario(destinatario);
		email.titulo("SAT-Flex: XMLs de " + dtinicial + " até " + dtfinal);
		email.anexo(zipfile);
		email.corpo("Seguem os XMLs do período de " + dtinicial + " até " + dtfinal + " anexados ao e-mail.");
		email.enviar(() => {
			// Fecha o loading
			window.Loading.hide();

			// Mensagem de sucesso
			window.MessageBox.show({
				title: "Enviado com sucesso",
				text: "O e-mail contendo os XMLs no período especificado foi enviado com sucesso para o e-mail do contador."
			});
		}, (err) => {
			// Fecha o loading
			window.Loading.hide();

			// Mensagem de erro
			window.MessageBox.show({
				title: "Houve uma falha",
				text: err.message
			});
		});
	}

	render(){
		return (
			<Content>
				<Title>Módulo do contador</Title>
				<SubTitle>Enviar arquivos fiscais por e-mail</SubTitle>
				<Row>
					<Col size="6" offset="3">
						<Row>
							<FormGroup type="email" id="email" label="E-mail do contador" className="col-12" size="lg" />
							<FormGroup type="date" id="dtinicial" label="Data inicial" className="col-6" size="lg" />
							<FormGroup type="date" id="dtfinal" label="Data final" className="col-6" size="lg" />
						</Row>
						<div className="text-center mt-2">
							<Button text="Enviar arquivos por e-mail" icon="mail-read" size="lg" onClick={this.enviarEmail} />
						</div>
					</Col>
				</Row>
			</Content>
		)
	}
}
