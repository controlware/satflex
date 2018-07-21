import React from "react";

import Col from "./Col.js";
import Row from "./Row.js";

import {defaultMessageBoxError} from "../def/function.js";

export default class PainelRapidoPesquisa extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			pesquisa: props.pesquisa, // Atual pesquisa
			produtos: [] // Lista de produtos visiveis
		};

		this.carregarProdutos = this.carregarProdutos.bind(this);
	}

	carregarProdutos(pesquisa){
		pesquisa = (pesquisa ? pesquisa : this.props.pesquisa);
		if(typeof pesquisa !== "string" || pesquisa.length === 0){
			this.setState({
				produtos: []
			});
			return;
		}

		let query = [
			"SELECT produto.idproduto, produto.descricao, produto.precovariavel,",
			"  produto.balanca, produto.preco, categoria.cor",
			"FROM produto",
			"INNER JOIN categoria USING (idcategoria)",
			"WHERE produto.descricao ILIKE '%'||$1||'%'",
			"  OR produto.codigoean = $1",
			"ORDER BY descricao"
		].join(" ");

		this.props.Pool.query(query, [pesquisa], (err, res) => {
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
		this.carregarProdutos();
	}

	componentWillReceiveProps(nextProps){
		this.carregarProdutos(nextProps.pesquisa);
	}

	render(){
		let className = ["painelrapido", "painelrapido-pesquisa"];

		if(this.props.layoutVendas === "0"){
			className.push("painelrapido-poucosprodutos");
		}

		return (
			<div className={className.join(" ")}>
				<Row className="painelrapido-produto">
					{this.state.produtos.map((produto, i) => {
						return <Produto key={i} idproduto={produto.idproduto} descricao={produto.descricao} precovariavel={produto.precovariavel} balanca={produto.balanca} preco={produto.preco} cor={produto.cor} onSelectProduto={this.props.onSelectProduto} layoutVendas={this.props.layoutVendas} />
					})}
				</Row>
			</div>
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
		let size = (this.props.layoutVendas === "0" ? 3 : 2);

		return (
			<Col size={size}>
				<div className="painelrapido-produto-item" style={{borderColor: this.props.cor}} onClick={this.onClick}>
					<span>{this.props.descricao}</span>
				</div>
			</Col>
		);
	}
}
