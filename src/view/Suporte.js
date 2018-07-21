import React from "react";

import {Pool} from "../def/postgresql.js";

import Col from "../com/Col.js";
import Content from "../com/Content.js";
import Hr from "../com/Hr.js";
import Icon from "../com/Icon.js";
import Image from "../com/Image.js";
import Row from "../com/Row.js";
import Title from "../com/Title.js";

import {defaultMessageBoxError} from "./../def/function.js";

import "../css/Suporte.css";

export default class Suporte extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			logotipo: null,
			informativo: null,
			telefone: null,
			email: null,
			endereco: null
		};

		this.carregarDados = this.carregarDados.bind(this);

		this.Pool = new Pool();
	}

	carregarDados(){
		this.Pool.query("SELECT nome, valor FROM parametro WHERE grupo = $1", ["REVENDA"], (err, res) => {
			if(err){
				defaultMessageBoxError(err);
				return false;
			}
			let state = {};
			for(let row of res.rows){
				state[row.nome.toLowerCase()] = row.valor.replaceAll("\n", "</br>");
			}
			this.setState(state);
		});
	}

	componentDidMount(){
		this.carregarDados();
	}

	render(){
		return (
			<Content>
				<Title>Suporte</Title>
				<Row>
					<Col size="5" offset="1">
						<Image className="logotipo" src={this.state.logotipo} />
					</Col>
				</Row>
				<Row>
					<Col size="5" offset="1">
						<p className="informativo" dangerouslySetInnerHTML={{__html: this.state.informativo}}></p>
					</Col>
					<Col className="contatos" size="4" offset="1">
						<Row>
							<Col size="1"><Icon name="phone" /></Col>
							<Col size="11"><p dangerouslySetInnerHTML={{__html: this.state.telefone}}></p></Col>
						</Row>
						<Hr />
						<Row>
							<Col size="1"><Icon name="mail" /></Col>
							<Col size="11"><p dangerouslySetInnerHTML={{__html: this.state.email}}></p></Col>
						</Row>
						<Hr />
						<Row>
							<Col size="1"><Icon name="location" /></Col>
							<Col size="11"><p dangerouslySetInnerHTML={{__html: this.state.endereco}}></p></Col>
						</Row>
					</Col>
				</Row>
			</Content>
		)
	}
}
