import React from "react";
import {Redirect} from "react-router";

import Button from "../com/Button.js";
import Col from "../com/Col.js";
import Content from "../com/Content.js";
import Row from "../com/Row.js";
import Title from "../com/Title.js";

export default class Relatorios extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			redirect: null
		};
	}

	render(){
		if(this.state.redirect){
			return <Redirect to={this.state.redirect} />
		}

		return (
			<Content>
				<Title>Relatórios</Title>
				<Row>
					<Col size="3" offset="3">
						<Button text="Fechamento" icon="calendar" size="xxl" block={true} onClick={() => {this.setState({redirect: "/fechamento"})}} />
					</Col>
					<Col size="3">
						<Button text="Estatísticas" icon="chart-dots" size="xxl" block={true} onClick={() => {this.setState({redirect: "/estatistica"})}} />
					</Col>
				</Row>
				<Row className="mt-4">
					<Col size="3" offset="3">
						<Button text="Orçamentos" icon="files-empty" size="xxl" block={true} disabled={true} onClick={() => {this.setState({redirect: "/relorcamento"})}} />
					</Col>
				</Row>
			</Content>
		)
	}
}
