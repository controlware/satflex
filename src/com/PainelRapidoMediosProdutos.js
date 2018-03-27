import React from "react";

import Col from "./Col.js";
import Row from "./Row.js";

import {defaultMessageBoxError} from "../def/function.js";

export default class PainelRapidoMediosProdutos extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			categorias: [], // Lista de categorias visiveis
			produtos: [], // Lista de produtos visiveis
			categoria: null // Dados da categoria ativa
		};

		this.carregarCategorias = this.carregarCategorias.bind(this);
		this.carregarProdutos = this.carregarProdutos.bind(this);
		this.trocarCategoria = this.trocarCategoria.bind(this);
	}

	carregarCategorias(){
		let query = "SELECT idcategoria, descricao, cor FROM categoria ORDER BY descricao";
		this.props.Pool.query(query, (err, res) => {
			if(err){
				defaultMessageBoxError(err);
				return false;
			}
			this.setState({
				categorias: res.rows,
				categoria: res.rows[0]
			}, () => {
				this.carregarProdutos();
			});
		});
	}

	carregarProdutos(){
		let query = "SELECT idproduto, descricao, precovariavel, balanca, preco FROM produto WHERE idcategoria = $1 ORDER BY descricao";
		this.props.Pool.query(query, [this.state.categoria.idcategoria], (err, res) => {
			if(err){
				defaultMessageBoxError(err);
				return false;
			}
			this.setState({
				produtos: res.rows
			});
		});
	}

	componentDidMount(){
		this.carregarCategorias();
	}

	trocarCategoria(categoria){
		this.setState({
			categoria: categoria
		}, () => {
			this.carregarProdutos();
		});
	}

	render(){
		return (
			<div className="painelrapido painelrapido-mediosprodutos">
				<Row className="painelrapido-categoria">
					{this.state.categorias.map((categoria, i) => {
						return <Categoria key={i} idcategoria={categoria.idcategoria} descricao={categoria.descricao} cor={categoria.cor} trocarCategoria={this.trocarCategoria} />
					})}
				</Row>
				<Row className="painelrapido-produto">
					{this.state.produtos.map((produto, i) => {
						return <Produto key={i} idproduto={produto.idproduto} descricao={produto.descricao} precovariavel={produto.precovariavel} balanca={produto.balanca} preco={produto.preco} cor={this.state.categoria.cor} onSelectProduto={this.props.onSelectProduto} />
					})}
				</Row>
			</div>
		);
	}

}

class Categoria extends React.Component {

	constructor(props){
		super(props);

		this.onClick = this.onClick.bind(this);
	}

	onClick(){
		this.props.trocarCategoria(this.props);
	}

	render(){
		return (
			<Col size="2">
				<div className="painelrapido-categoria-item" style={{backgroundColor: this.props.cor}} onClick={this.onClick}>
					<span>{this.props.descricao}</span>
				</div>
			</Col>
		);
	}
}

class Produto extends React.Component {

	constructor(props){
		super(props);

		this.onClick = this.onClick.bind(this);
	}

	onClick(event){
		if(this.props.onSelectProduto){
			this.props.onSelectProduto(this.props, event);
		}
	}

	render(){
		return (
			<Col size="2">
				<div className="painelrapido-produto-item" style={{borderColor: this.props.cor}} onClick={this.onClick}>
					<span>{this.props.descricao}</span>
				</div>
			</Col>
		);
	}
}
