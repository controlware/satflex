import React from "react";
import $ from "jquery";

import Button from "../com/Button.js";
import ButtonGroup from "../com/ButtonGroup.js";
import Col from "../com/Col.js";
import Content from "../com/Content.js";
import FormControl from "../com/FormControl.js";
import DataGrid from "../com/DataGrid.js";
import FormGroup from "../com/FormGroup.js";
import Row from "../com/Row.js";
import Title from "../com/Title.js";

import {Pool} from "../def/pg.js";

export default class Venda extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			dataGrid: []
		};


		this.loadDataGrid = this.loadDataGrid.bind(this);
	}

	componentDidMount(){
		this.pool = new Pool();
		this.loadDataGrid();
	}

	componentWillUnmount(){
		this.pool.end();
	}

	loadDataGrid(){
		let query = [
			"SELECT produto.descricao, categoria.descricao AS categoria, produto.preco,",
			"  produto.codigoean, produto.balanca, produto.precovariavel, produto.dthrcriacao",
			"FROM produto",
			"LEFT JOIN categoria USING (idcategoria)",
			"ORDER BY produto.descricao"
		].join(" ");

		this.pool.query(query, (err, res) => {
			if(err){
				alert("ERRO (veja console)");
				console.log(err);
				return false;
			}else{
				let data = [];
				for(let i in res.rows){
					let row = res.rows[i];
					data.push([
						row.descricao,
						row.categoria,
						row.preco,
						row.codigoean,
						(row.balanca === "S" ? "Sim" : "Não"),
						(row.precovariavel === "S" ? "Sim" : "Não"),
						row.dthrcriacao
					]);
					//console.log(row);
				}
				console.log(data);
				this.setState({
					dataGrid: data
				});
			}
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
				<Row className="mb-4">
					<Col size="4">
						<FormControl type="search" id="pesquisa" placeholder="Pesquise um produto..." />
					</Col>
					<Col size="2" className="pl-0">
						<Button text="Buscar" icon="search" color="green" />
					</Col>
					<Col size="6" className="text-right">
						<Button text="Categorias" icon="layers" color="blue" className="mr-2" />
						<Button text="Novo produto" icon="plus" color="green" />
					</Col>
				</Row>
				<DataGrid header={dataGridHeader} data={this.state.dataGrid} />
			</Content>
		)
	}
}
