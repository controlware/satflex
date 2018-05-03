import React from "react";
import {Redirect} from "react-router";

import Button from "../com/Button.js";
import Col from "../com/Col.js";
import Content from "../com/Content.js";
import Icon from "../com/Icon.js";
import Row from "../com/Row.js";
import Title from "../com/Title.js";

import {serialNumber} from "../def/function.js";

import "../css/Configuracoes.css";

export default class Configuracoes extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			redirect: null,
			serialnumber: null
		};
	}

	componentDidMount(){
		serialNumber((value) => {
			this.setState({
				serialnumber: value
			});
		});
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
					<Col size="3" offset="3">
						<Button text="Ferramentas" icon="tools" size="xxl" block={true} />
					</Col>
					<Col size="3">
						<Button text="Atualizar versão" icon="loop2" size="xxl" block={true} />
					</Col>
				</Row>
				<Row className="mt-4">
					<Col size="3" offset="3">
						<Button text="Parâmetros<br>do sistema" icon="widgets" size="xxl" block={true} onClick={() => {this.setState({redirect: "/parametro"})}} />
					</Col>
				</Row>
				<div className="serialnumber">
					<small>Número de série</small><br />
					{serialnumber}
				</div>
			</Content>
		)
	}
}
