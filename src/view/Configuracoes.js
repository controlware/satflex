import React from "react";
import {Redirect} from "react-router";

import {Pool} from "../def/postgresql.js";

import Button from "../com/Button.js";
import Col from "../com/Col.js";
import Content from "../com/Content.js";
import Icon from "../com/Icon.js";
import Row from "../com/Row.js";
import Title from "../com/Title.js";

import Atualizacao from "../com/Atualizacao.js";

import {serialNumber} from "../def/function.js";

import "../css/Configuracoes.css";

export default class Configuracoes extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			redirect: null,
			serialnumber: null
		};

		this.verificarAtualizacao = this.verificarAtualizacao.bind(this);

		this.Pool = new Pool();
		this.Atualizacao = new Atualizacao(this.Pool);
	}

	componentDidMount(){
		(async () => {
			this.setState({
				serialnumber: await serialNumber()
			});
		})();
	}

	verificarAtualizacao(){
		this.Atualizacao.verificarAtualizacao();
	}

	render(){
		if(this.state.redirect){
			return <Redirect to={this.state.redirect} />
		}

		let serialnumber = null;
		if(this.state.serialnumber){
			serialnumber = <b>{this.state.serialnumber}</b>;
		}else{
			serialnumber = <Icon name="spinner3" className="ani-spin" />
		}

		return (
			<Content>
				<Title>Configurações</Title>
				<Row>
					<Col size="8" offset="2">
						<Row>
							<Col size="6" className="mb-4">
								<Button text={"Verificar atualização<br><small>versão atual: " + this.Atualizacao.versaoLocal() + "</small>"} icon="safari" size="xxl" block={true} onClick={this.verificarAtualizacao} />
							</Col>
							<Col size="6" className="mb-4">
								<Button text="Parâmetros<br>do sistema" icon="widgets" size="xxl" block={true} onClick={() => {this.setState({redirect: "/parametro"})}} />
							</Col>
							<Col size="6" className="mb-4">
								<Button text="Ferramentas" icon="tools" size="xxl" block={true} onClick={() => {this.setState({redirect: "/ferramentas"})}} />
							</Col>
						</Row>
					</Col>
					{/*
					<Col size="6">
						<Button text="Atualizar versão" icon="loop2" size="xxl" block={true} />
					</Col>
					*/}
				</Row>
				<div className="serialnumber">
					<small>Número de série</small><br />
					{serialnumber}
				</div>
			</Content>
		)
	}
}
