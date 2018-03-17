import React from "react";
import $ from "jquery";

import Button from "../com/Button.js";
import ButtonGroup from "../com/ButtonGroup.js";
import Col from "./../com/Col.js";
import Content from "../com/Content.js";
import FormControl from "../com/FormControl.js";
import DataGrid from "../com/DataGrid.js";
import FormGroup from "../com/FormGroup.js";
import Row from "./../com/Row.js";
import Title from "../com/Title.js";

export default class Venda extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			dataGrid: []
		};
		this.loadDataGrid = this.loadDataGrid.bind(this);
	}

	componentDidMount(){
		this.loadDataGrid();
	}

	loadDataGrid(){
		$.getJSON("http://localhost/temp/json/datagrid.php").then(data => {
			this.setState({
				dataGrid: data
			});
		});
	}

	render(){

		let dataGridHeader = [
			{text: "Descrição", align: "left"},
			{text: "Categoria", align: "left"},
			{text: "Preço", align: "center"},
			{text: "EAN", align: "left"},
			{text: "Balança", align: "center"},
			{text: "Preço Variável", align: "center"},
			{text: "Criado em", align: "center"},
		];

		return (
			<Content>
				<Title>Cadastro de <b>Produtos</b></Title>
				<Row>
					<Col size="4">
						<FormControl type="search" id="pesquisa" placeholder="Pesquise um produto..." />
					</Col>
					<Col size="2">
						<Button text="Buscar" icon="search" color="green" />
					</Col>
					<Col size="6" className="text-right">
						<Button text="Categorias" icon="layers" color="blue" />
						<Button text="Novo produto" icon="plus" color="green" />
					</Col>
				</Row>
				<DataGrid header={dataGridHeader} data={[]} />
			</Content>
		)
	}
}
