import React from "react";

import Button from "../com/Button.js";
import Col from "../com/Col.js";
import Content from "../com/Content.js";
import Row from "../com/Row.js";
import Title from "../com/Title.js";

export default class Ferramentas extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			redirect: null
		};
	}

	consoleDesenvolvedor(){
		let electron = window.require("electron");
		electron.remote.getCurrentWebContents().openDevTools();
	}

	render(){
		return (
			<Content>
				<Title>Ferramentas</Title>
				<Row>
					<Col size="6" offset="3">
						<Row>
							<Col size="6">
								<Button text="Abrir console de<br>desenvolvedor" icon="embed2" size="xxl" block={true} onClick={this.consoleDesenvolvedor} />
							</Col>
						</Row>
					</Col>
				</Row>
			</Content>
		)
	}
}
