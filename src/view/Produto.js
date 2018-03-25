import React from "react";
import {Redirect} from "react-router";

import {Pool} from "../def/postgresql.js";

import Button from "../com/Button.js";
import Col from "../com/Col.js";
import Content from "../com/Content.js";
import DataGrid from "../com/DataGrid.js";
import FormControl from "../com/FormControl.js";
import Icon from "../com/Icon.js";
import ModalProduto from "../com/ModalProduto.js";
import Row from "../com/Row.js";
import Title from "../com/Title.js";

import {defaultMessageBoxError} from "../def/function.js";

import "../css/Produto.css";

export default class Produto extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			dataGrid: [],
			pesquisa: "",
			idproduto: null,
			showModalProduto: false,
			redirectToCategoria: false
		};

		this.beforeCloseModal = this.beforeCloseModal.bind(this);
		this.loadDataGrid = this.loadDataGrid.bind(this);
		this.novoProduto = this.novoProduto.bind(this);
		this.onChangePesquisa = this.onChangePesquisa.bind(this);
		this.onClickBtnCategoria = this.onClickBtnCategoria.bind(this);
		this.onKeyUpPesquisa = this.onKeyUpPesquisa.bind(this);
		this.pesquisaLimpar = this.pesquisaLimpar.bind(this);

		this.pool = new Pool();
	}

	beforeCloseModal(){
		this.setState({
			showModalProduto: false
		}, () => {
			this.loadDataGrid();
		});
	}

	carregarProduto(idproduto){
		this.setState({
			showModalProduto: true,
			idproduto: idproduto
		});
	}

	componentDidMount(){
		this.loadDataGrid();
	}

	componentWillUnmount(){
		this.pool.end();
	}

	loadDataGrid(){
		let query = [
			"SELECT produto.idproduto, produto.descricao, categoria.descricao AS categoria,",
			"  produto.preco, produto.codigoean, produto.dthrcriacao",
			"FROM produto",
			"LEFT JOIN categoria USING (idcategoria)",
			"WHERE produto.descricao ILIKE '%'||$1||'%'",
			"ORDER BY produto.descricao"
		].join(" ");

		this.pool.query(query, [this.state.pesquisa], (err, res) => {
			if(err){
				defaultMessageBoxError(err.message);
				return false;
			}else{
				let data = [];
				for(let i in res.rows){
					let row = res.rows[i];
					data.push({
						data: [
							{text: row.descricao, align: "left"},
							{text: row.categoria, align: "left"},
							{text: row.preco.format(2, ",", "."), align: "center"},
							{text: row.codigoean, align: "center"},
							{text: row.dthrcriacao.toLocaleString(), align: "center"}
						],
						onClick: () => {
							this.carregarProduto(row.idproduto);
						}
					});
				}
				this.setState({
					dataGrid: data
				});
			}
		});
	}

	novoProduto(){
		this.setState({
			showModalProduto: true,
			idproduto: null
		});
	}

	onChangePesquisa(event){
		this.setState({
			pesquisa: event.target.value
		});
	}

	onClickBtnCategoria(){
		this.setState({
			redirectToCategoria: true
		});
	}

	onKeyUpPesquisa(event){
		if(event.keyCode === 13){
			this.loadDataGrid();
		}
	}

	pesquisaLimpar(){
		this.setState({
			pesquisa: ""
		}, () => {
			this.loadDataGrid();
		});
	}

	render(){
		if(this.state.redirectToCategoria){
			return <Redirect to="/categoria" />
		}

		let dataGridHeader = [
			{text: "Descrição", align: "left"},
			{text: "Categoria", align: "left"},
			{text: "Preço", align: "center"},
			{text: "EAN", align: "left"},
			{text: "Criado em", align: "center"}
		];

		return (
			<Content>
				<Title>Cadastro de <b>Produtos</b></Title>
				<Row className="mb-4">
					<Col size="4">
						<FormControl type="search" id="pesquisa" value={this.state.pesquisa} placeholder="Pesquise um produto..." onKeyUp={this.onKeyUpPesquisa} onChange={this.onChangePesquisa} />
						<Icon name="cross" id="pesquisa-limpar" onClick={this.pesquisaLimpar} className={this.state.pesquisa.length > 0 ? null : "d-none"} />
					</Col>
					<Col size="2" className="pl-0">
						<Button text="Buscar" icon="search" color="green" onClick={this.loadDataGrid} />
					</Col>
					<Col size="6" className="text-right">
						<Button text="Categorias" icon="layers" color="blue" className="mr-3" onClick={this.onClickBtnCategoria} />
						<Button text="Novo produto" icon="plus" color="green" onClick={this.novoProduto} />
					</Col>
				</Row>
				<DataGrid header={dataGridHeader} data={this.state.dataGrid} />
				<ModalProduto pool={this.pool} show={this.state.showModalProduto} idproduto={this.state.idproduto} beforeClose={this.beforeCloseModal} />
			</Content>
		)
	}
}
