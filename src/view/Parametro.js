import React from "react";
import $ from "jquery";

import {Pool} from "../def/postgresql.js";

import Button from "../com/Button.js";
import Col from "../com/Col.js";
import Content from "../com/Content.js";
import FormControl from "../com/FormControl.js";
import ListGroup from "../com/ListGroup.js";
import ListItem from "../com/ListItem.js";
import Row from "../com/Row.js";
import Title from "../com/Title.js";

import {defaultMessageBoxError} from "../def/function.js";

import "../css/Parametro.css";

export default class Parametro extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			listaGrupo: [],
			listaParametro: [],
			grupoAtivo: null,
			parametroAtivo: null,

			idparametro: null,
			valor: null,
			observacao: null
		};

		this.ajustarAltura = this.ajustarAltura.bind(this);
		this.carregarListaGrupo = this.carregarListaGrupo.bind(this);
		this.carregarListaParametro = this.carregarListaParametro.bind(this);
		this.carregarParametro = this.carregarParametro.bind(this);
		this.gravar = this.gravar.bind(this);
		this.onChangeValor = this.onChangeValor.bind(this);

		this.Pool = new Pool();
	}

	ajustarAltura(){
		$("#content .list-group").each(function(){
			let height = window.innerHeight - $(this).offset().top - 30;
			$(this).height(height);
		});
	}

	carregarListaGrupo(){
		this.Pool.query("SELECT DISTINCT grupo FROM parametro WHERE visivel = 'S' ORDER BY grupo", [], (err, res) => {
			if(err){
				defaultMessageBoxError(err.message);
				return false;
			}
			this.setState({
				listaGrupo: res.rows
			});
		});
	}

	carregarListaParametro(grupo){
		this.Pool.query("SELECT idparametro, nome FROM parametro WHERE visivel = 'S' AND grupo = $1 ORDER BY ordem, nome", [grupo], (err, res) => {
			if(err){
				defaultMessageBoxError(err.message);
				return false;
			}
			this.setState({
				listaParametro: res.rows,
				grupoAtivo: grupo,
				parametroAtivo: null,

				idparametro: null,
				valor: null,
				observacao: null
			});
		});
	}

	carregarParametro(idparametro){
		this.Pool.query("SELECT idparametro, valor, observacao FROM parametro WHERE idparametro = $1", [idparametro], (err, res) => {
			if(err){
				defaultMessageBoxError(err.message);
				return false;
			}
			let row = res.rows.shift();
			this.setState({
				parametroAtivo: idparametro,
				idparametro: row.idparametro,
				valor: row.valor,
				observacao: row.observacao
			});
		});
	}

	componentDidMount(){
		window.addEventListener("resize", this.ajustarAltura);

		this.ajustarAltura();
		this.carregarListaGrupo();
	}

	componentWillUnmount(){
		window.removeEventListener("resize", this.ajustarAltura);
	}

	gravar(){
		let query = "UPDATE parametro SET valor = $1 WHERE idparametro = $2";
		this.Pool.query(query, [this.state.valor, this.state.idparametro], (err) => {
			if(err){
				defaultMessageBoxError(err.message);
				return false;
			}
			window.FastMessage.show("Parâmetro atualizado com sucesso!");
		})
	}

	onChangeValor(event){
		this.setState({
			valor: event.target.value
		});
	}

	render(){
		let observacao = null;
		if(this.state.observacao){
			observacao = this.state.observacao.replaceAll("\\n", "<br>");
		}

		return (
			<Content className="Parametro">
				<Title>Parâmetros do sistema</Title>
				<Row>
					<Col size="3" offset="1">
						<ListGroup>
							{this.state.listaGrupo.map((row, i) => {
								return <ListItem key={i} active={this.state.grupoAtivo === row.grupo} onClick={() => {this.carregarListaParametro(row.grupo)}}>{row.grupo}</ListItem>
							})}
						</ListGroup>
					</Col>
					<Col size="3">
						<ListGroup>
							{this.state.listaParametro.map((row, i) => {
								return <ListItem key={i} active={this.state.parametroAtivo === row.idparametro} onClick={() => {this.carregarParametro(row.idparametro)}}>{row.nome}</ListItem>
							})}
						</ListGroup>
					</Col>
					<Col size="4">
						<FormControl type="textarea" rows="7" value={this.state.valor} onChange={this.onChangeValor} disabled={!this.state.idparametro} />
						<Button text="Gravar alterações" icon="floppy-disk" color="green" size="lg" block={true} className="mt-2 mb-2" disabled={!this.state.idparametro} onClick={this.gravar} />
						<div className={"observacao" + (observacao ? "" : " d-none")} dangerouslySetInnerHTML={{__html: observacao}}></div>
					</Col>
				</Row>
			</Content>
		)
	}
}
