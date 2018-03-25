import React from "react";
import {Redirect} from "react-router";

import {Pool} from "../def/postgresql.js";

import Button from "../com/Button.js";
import Col from "../com/Col.js";
import Content from "../com/Content.js";
import DataGrid from "../com/DataGrid.js";
import FormControl from "../com/FormControl.js";
import Icon from "../com/Icon.js";
import ModalCategoria from "../com/ModalCategoria.js";
import Row from "../com/Row.js";
import Title from "../com/Title.js";

import {defaultMessageBoxError} from "../def/function.js";

import "../css/Categoria.css";

export default class Categoria extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			dataGrid: [],
			pesquisa: "",
			idcategoria: null,
			showModalCategoria: false,
			redirectToProduto: false
		};

		this.beforeCloseModal = this.beforeCloseModal.bind(this);
		this.loadDataGrid = this.loadDataGrid.bind(this);
		this.novaCategoria = this.novaCategoria.bind(this);
		this.onChangePesquisa = this.onChangePesquisa.bind(this);
		this.onClickBtnProduto = this.onClickBtnProduto.bind(this);
		this.onKeyUpPesquisa = this.onKeyUpPesquisa.bind(this);
		this.pesquisaLimpar = this.pesquisaLimpar.bind(this);

		this.pool = new Pool();
	}

	beforeCloseModal(){
		this.setState({
			showModalCategoria: false
		}, () => {
			this.loadDataGrid();
		});
	}

	carregarCategoria(idcategoria){
		this.setState({
			showModalCategoria: true,
			idcategoria: idcategoria
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
			"SELECT categoria.idcategoria, categoria.descricao, ",
			"  ncm.codigoncm AS codigoncm, categoria.dthrcriacao,",
			"  (SELECT COUNT(idproduto) FROM produto WHERE idcategoria = categoria.idcategoria) AS produtos",
			"FROM categoria",
			"LEFT JOIN ncm USING (idncm)",
			"WHERE categoria.descricao ILIKE '%'||$1||'%'",
			"ORDER BY categoria.descricao"
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
							{text: row.codigoncm, align: "center"},
							{text: row.produtos, align: "center"},
							{text: row.dthrcriacao.toLocaleString(), align: "center"}
						],
						onClick: () => {
							this.carregarCategoria(row.idcategoria);
						}
					});
				}
				this.setState({
					dataGrid: data
				});
			}
		});
	}

	novaCategoria(){
		this.setState({
			showModalCategoria: true,
			idcategoria: null
		});
	}

	onChangePesquisa(event){
		this.setState({
			pesquisa: event.target.value
		});
	}

	onClickBtnProduto(){
		this.setState({
			redirectToProduto: true
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
		if(this.state.redirectToProduto){
			return <Redirect to="/produto" />
		}

		let dataGridHeader = [
			{text: "Descrição", align: "left"},
			{text: "NCM", align: "center"},
			{text: "Produtos", align: "center"},
			{text: "Criado em", align: "center"}
		];

		return (
			<Content>
				<Title>Cadastro de <b>Categorias</b></Title>
				<Row className="mb-4">
					<Col size="4">
						<FormControl type="search" id="pesquisa" value={this.state.pesquisa} placeholder="Pesquise uma categoria..." onKeyUp={this.onKeyUpPesquisa} onChange={this.onChangePesquisa} />
						<Icon name="cross" id="pesquisa-limpar" onClick={this.pesquisaLimpar} className={this.state.pesquisa.length > 0 ? null : "d-none"} />
					</Col>
					<Col size="2" className="pl-0">
						<Button text="Buscar" icon="search" color="green" onClick={this.loadDataGrid} />
					</Col>
					<Col size="6" className="text-right">
						<Button text="Produtos" icon="layers" color="blue" className="mr-3" onClick={this.onClickBtnProduto} />
						<Button text="Nova categoria" icon="plus" color="green" onClick={this.novaCategoria} />
					</Col>
				</Row>
				<DataGrid header={dataGridHeader} data={this.state.dataGrid} />
				<ModalCategoria pool={this.pool} show={this.state.showModalCategoria} idcategoria={this.state.idcategoria} beforeClose={this.beforeCloseModal} />
			</Content>
		)
	}
}
