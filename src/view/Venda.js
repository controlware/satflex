import React from "react";
import $ from "jquery";

import {Pool} from "../def/postgresql.js";

import Button from "../com/Button.js";
import Col from "../com/Col.js";
import Content from "../com/Content.js";
import FormControl from "../com/FormControl.js";
import Icon from "../com/Icon.js";
import PainelRapido from "../com/PainelRapido.js";
import Row from "../com/Row.js";
import VendaAplicarAcrescimo from "../com/VendaAplicarAcrescimo.js";
import VendaAplicarDesconto from "../com/VendaAplicarDesconto.js";
import VendaDetalhe from "../com/VendaDetalhe.js";
import VendaEditarProduto from "../com/VendaEditarProduto.js";
import VendaFinalizacao from "../com/VendaFinalizacao.js";

import {validarCPF, validarCNPJ} from "../def/function.js";

import "../css/Venda.css";

export default class Venda extends React.Component {

	constructor(props) {
		super(props);

		let documentoproduto = this.criarObjetoDocumentoProduto();

		this.state = {
			documentoproduto: documentoproduto, // Produto atual que esta sendo editado
			listaDocumentoProduto: [], // Lista de produtos que compoe a venda
			pesquisa: "", // Conteudo da pesquisa
			pesquisaEfetiva: "", // O real termo sendo pesquisado
			showEditarProduto: false, // Se deve exibir o modal da edicao de produtos
			showVendaFinalizacao: false, // Se deve exibir o modal da finalizacao de venda
			showVendaAplicarDesconto: false, // Se deve exibir o modal da aplicacao de desconto
			showVendaAplicarAcrescimo: false // Se deve exibir o modal da aplicacao de acrescimo
		};

		this.abrirFinalizacao = this.abrirFinalizacao.bind(this);
		this.animarProdutoPainel = this.animarProdutoPainel.bind(this);
		this.aplicarAcrescimo = this.aplicarAcrescimo.bind(this);
		this.aplicarDesconto = this.aplicarDesconto.bind(this);
		this.atualizarDocumentoProduto = this.atualizarDocumentoProduto.bind(this);
		this.aumentarQuantidade = this.aumentarQuantidade.bind(this);
		this.cancelarVendaAtual = this.cancelarVendaAtual.bind(this);
		this.diminuirQuantidade = this.diminuirQuantidade.bind(this);
		this.editarProduto = this.editarProduto.bind(this);
		this.incluirDezPorcento = this.incluirDezPorcento.bind(this);
		this.incluirProduto = this.incluirProduto.bind(this);
		this.informarCPF = this.informarCPF.bind(this);
		this.onChangePesquisa = this.onChangePesquisa.bind(this);
		this.onClickBuscar = this.onClickBuscar.bind(this);
		this.onKeyUpPesquisa = this.onKeyUpPesquisa.bind(this);
		this.pesquisaLimpar = this.pesquisaLimpar.bind(this);
		this.removerProduto = this.removerProduto.bind(this);

		this.Pool = new Pool();
	}

	abrirFinalizacao(){
		this.setState({
			showVendaFinalizacao: true
		});
	}

	animarProdutoPainel(element){

	}

	aplicarAcrescimo(totalbruto, totalacrescimo){
		if(isNaN(totalbruto) || isNaN(totalacrescimo)){
			this.setState({
				showVendaAplicarAcrescimo: true
			});
			return;
		}

		let listaDocumentoProduto = this.state.listaDocumentoProduto;

		listaDocumentoProduto.forEach((documentoproduto) => {
			let totalproduto = documentoproduto.preco * documentoproduto.quantidade;
			let acrescimoproduto  = totalacrescimo * (totalproduto / totalbruto);
			let acrescimounitario = acrescimoproduto / documentoproduto.quantidade;
			documentoproduto.acrescimounitario = acrescimounitario;
			this.calcularDocumentoProduto(documentoproduto);
		});

		this.setState({
			listaDocumentoProduto: listaDocumentoProduto,
			showVendaAplicarAcrescimo: false
		});
	}

	aplicarDesconto(totalbruto, totaldesconto){
		if(isNaN(totalbruto) || isNaN(totaldesconto)){
			this.setState({
				showVendaAplicarDesconto: true
			});
			return;
		}

		let listaDocumentoProduto = this.state.listaDocumentoProduto;

		listaDocumentoProduto.forEach((documentoproduto) => {
			let totalproduto = documentoproduto.preco * documentoproduto.quantidade;
			let descontoproduto = totaldesconto * (totalproduto / totalbruto);
			let descontounitario = descontoproduto / documentoproduto.quantidade;
			documentoproduto.descontounitario = descontounitario;
			this.calcularDocumentoProduto(documentoproduto);
		});

		this.setState({
			listaDocumentoProduto: listaDocumentoProduto,
			showVendaAplicarDesconto: false
		});
	}

	atualizarDocumentoProduto(documentoproduto){
		let i = documentoproduto.i;
		let listaDocumentoProduto = this.state.listaDocumentoProduto;
		listaDocumentoProduto[i] = documentoproduto;
		this.setState({
			listaDocumentoProduto: listaDocumentoProduto
		});
	}

	aumentarQuantidade(documentoproduto){
		let i = documentoproduto.i;
		let listaDocumentoProduto = this.state.listaDocumentoProduto;
		documentoproduto = listaDocumentoProduto[i];
		documentoproduto.quantidade++;
		this.calcularDocumentoProduto(documentoproduto);
		listaDocumentoProduto[i] = documentoproduto;
		this.setState({
			listaDocumentoProduto: listaDocumentoProduto
		});
	}

	calcularDocumentoProduto(documentoproduto){
		documentoproduto.totaldesconto = documentoproduto.descontounitario * documentoproduto.quantidade;
		documentoproduto.totalacrescimo = documentoproduto.acrescimounitario * documentoproduto.quantidade;
		documentoproduto.totalproduto = (documentoproduto.preco * documentoproduto.quantidade) - documentoproduto.totaldesconto + documentoproduto.totalacrescimo;
	}

	cancelarVendaAtual(){
		window.MessageBox.show({
			title: "Cancelamento de venda",
			text: "Tem certeza que deseja cancelar a venda atual?",
			buttons: [
				{
					text: "Sim",
					icon: "thumbs-up",
					color: "green",
					onClick: () => {
						window.MessageBox.hide();
						this.setState({
							cpfcnpj: null,
							listaDocumentoProduto: []
						});
					}
				},
				{
					text: "Não",
					icon: "thumbs-down",
					color: "red",
					onClick: () => {
						window.MessageBox.hide();
					}
				}
			]
		});
	}

	componentDidMount(){

	}

	componentWillUnmount(){
		this.Pool.end();
	}

	criarObjetoDocumentoProduto(documentoproduto){
		return $.extend({
			"idproduto": null,
			"descricao": null,
			"balanca": "N",
			"precovariavel": "N",
			"quantidade": 0,
			"preco": 0,
			"descontounitario": 0,
			"totaldesconto": 0,
			"acrescimounitario": 0,
			"totalacrescimo": 0,
			"totalproduto": 0
		}, documentoproduto);
	}

	diminuirQuantidade(documentoproduto){
		let i = documentoproduto.i;
		let listaDocumentoProduto = this.state.listaDocumentoProduto;
		documentoproduto = listaDocumentoProduto[i];
		if(documentoproduto.quantidade - 1 <= 0){
			return true;
		}
		documentoproduto.quantidade--;
		this.calcularDocumentoProduto(documentoproduto);
		listaDocumentoProduto[i] = documentoproduto;
		this.setState({
			listaDocumentoProduto: listaDocumentoProduto
		});
	}

	editarProduto(documentoproduto){
		this.setState({
			documentoproduto: documentoproduto,
			showEditarProduto: true
		});
	}

	finalizarVenda(documentopagamentos, totaltroco){
		
	}

	incluirDezPorcento(){
		let listaDocumentoProduto = this.state.listaDocumentoProduto;

		listaDocumentoProduto.forEach((documentoproduto) => {
			documentoproduto.acrescimounitario = documentoproduto.preco * 0.1;
			this.calcularDocumentoProduto(documentoproduto);
		});

		this.setState({
			listaDocumentoProduto: listaDocumentoProduto
		});
	}

	incluirProduto(produto, event){
		produto = Object.assign({}, produto);

		if(produto.precovariavel === "S"){
			window.InformarValor.show({
				title: "Preço do produto",
				money: true,
				decimal: 2,
				success: (valor) => {
					produto.preco = valor.toFloat();
					this.incluirProdutoDefinitivo(produto, event);
				}
			});
		}else if(produto.balanca === "S"){
			window.InformarValor.show({
				title: "Peso do produto em KG",
				decimal: 3,
				success: (valor) => {
					produto.quantidade = valor.toFloat();
					this.incluirProdutoDefinitivo(produto, event);
				}
			});
		}else{
			this.incluirProdutoDefinitivo(produto, event);
		}
	}

	incluirProdutoDefinitivo(produto, event){
		let listaDocumentoProduto = this.state.listaDocumentoProduto;

		if(!produto.quantidade){
			produto.quantidade = 1;
		}

		let documentoproduto = this.criarObjetoDocumentoProduto({
			idproduto: produto.idproduto,
			descricao: produto.descricao,
			balanca: produto.balanca,
			precovariavel: produto.precovariavel,
			quantidade: produto.quantidade,
			preco: produto.preco
		});

		this.calcularDocumentoProduto(documentoproduto);

		let found = false;
		listaDocumentoProduto.forEach((documentoproduto2) => {
			if(found){
				return false;
			}

			let documentoprodutoComp1 = Object.assign({}, documentoproduto);
			let documentoprodutoComp2 = Object.assign({}, documentoproduto2);

			delete documentoprodutoComp1.quantidade;
			delete documentoprodutoComp2.quantidade;
			delete documentoprodutoComp1.totalproduto;
			delete documentoprodutoComp2.totalproduto;
			delete documentoprodutoComp2.i;

			if(JSON.stringify(documentoprodutoComp1) === JSON.stringify(documentoprodutoComp2)){
				documentoproduto2.quantidade += documentoproduto.quantidade;
				this.calcularDocumentoProduto(documentoproduto2);
				found = true;
			}
		});

		if(parseFloat(documentoproduto.preco) === 0){
			window.MessageBox.show({
				title: "Produto sem preço",
				text: "O preço do produto precisa ser maior que zero."
			});
			return false;
		}

		if(!found){
			listaDocumentoProduto.push(documentoproduto);
		}

		this.animarProdutoPainel(event.target);

		this.setState({
			listaDocumentoProduto: listaDocumentoProduto
		});
	}

	informarCPF(){
		window.InformarValor.show({
			title: "Informe o CPF ou CNPJ",
			mask: "99999999999999",
			success: (valor) => {
				let cpfcnpj = null;
				if(valor.length === 11 && validarCPF(valor)){
					cpfcnpj = valor.substr(0, 3) + "." + valor.substr(3, 3) + "." + valor.substr(6, 3) + "-" + valor.substr(9, 2);
				}else if(valor.length === 14 && validarCNPJ(valor)){
					cpfcnpj = valor.substr(0, 2) + "." + valor.substr(2, 3) + "." + valor.substr(5, 3) + "/" + valor.substr(8, 4) + "-" + valor.substr(12, 2);
				}else if(valor.length > 0){
					window.MessageBox.show({
						title: "CPF ou CNPJ inválido",
						text: "O CPF ou CNPJ informado é inválido.<br>Por favor, digite novamente.",
						buttons: [
							{
								text: "Ok",
								icon: "thumbs-up",
								color: "blue",
								onClick: () => {
									window.MessageBox.hide();
									this.informarCPF();
								}
							}
						]
					});
					return false;
				}
				this.setState({
					cpfcnpj: cpfcnpj
				});
			},
			fail: () => {
				this.setState({
					cpfcnpj: null
				});
			}
		});
	}

	onChangePesquisa(event){
		this.setState({
			pesquisa: event.target.value
		});
	}

	onClickBuscar(){
		this.setState({
			pesquisaEfetiva: this.state.pesquisa
		});
	}

	onKeyUpPesquisa(event){
		if(event.keyCode === 13){
			this.onClickBuscar();
		}
	}

	pesquisaLimpar(){
		this.setState({
			pesquisa: "",
			pesquisaEfetiva: ""
		});
	}

	removerProduto(documentoproduto){
		let totalproduto = "R$ " + documentoproduto.totalproduto.format(2, ",", ".");

		window.MessageBox.show({
			text: "Tem certeza que deseja remover o produto?<br><br>" + documentoproduto.descricao + "<span class='float-right'>" + totalproduto + "</span>",
			buttons: [
				{
					text: "Sim",
					icon: "thumbs-up",
					color: "green",
					onClick: () => {
						window.MessageBox.hide();
						let listaDocumentoProduto = this.state.listaDocumentoProduto;
						listaDocumentoProduto.splice(documentoproduto.i, 1);
						this.setState({
							listaDocumentoProduto: listaDocumentoProduto
						});
					}
				},
				{
					text: "Não",
					icon: "thumbs-down",
					color: "red",
					onClick: () => {
						window.MessageBox.hide();
					}
				}
			]
		});
	}

	render(){

		let totalbruto = 0;
		let totaldesconto = 0;
		let totaldocumento = 0;
		this.state.listaDocumentoProduto.forEach((documentoproduto) => {
			totalbruto += documentoproduto.preco * documentoproduto.quantidade;
			totaldesconto += documentoproduto.totaldesconto;
			totaldocumento += documentoproduto.totalproduto;
		});

		return (
			<Content>
				<Row>
					<Col size="7">
						<Row className="mb-4 mt-4">
							<Col size="9">
								<FormControl type="search" id="pesquisa" value={this.state.pesquisa} placeholder="Pesquise um produto..." onKeyUp={this.onKeyUpPesquisa} onChange={this.onChangePesquisa} />
								<Icon name="cross" id="pesquisa-limpar" onClick={this.pesquisaLimpar} className={this.state.pesquisa.length > 0 ? null : "d-none"} />
							</Col>
							<Col size="3" className="pl-0">
								<Button text="Buscar" icon="search" color="green" block={true} onClick={this.onClickBuscar} />
							</Col>
						</Row>
						<PainelRapido
							Pool={this.Pool}
							pesquisa={this.state.pesquisaEfetiva}
							onSelectProduto={this.incluirProduto}
						/>
					</Col>
					<Col size="5" className="pr-0">
						<VendaDetalhe
							abrirFinalizacao={this.abrirFinalizacao}
							aumentarQuantidade={this.aumentarQuantidade}
							cancelarVendaAtual={this.cancelarVendaAtual}
							cpfcnpj={this.state.cpfcnpj}
							diminuirQuantidade={this.diminuirQuantidade}
							editarProduto={this.editarProduto}
							informarCPF={this.informarCPF}
							listaDocumentoProduto={this.state.listaDocumentoProduto}
							removerProduto={this.removerProduto}
						/>
					</Col>
				</Row>
				<VendaEditarProduto
					show={this.state.showEditarProduto}
					documentoproduto={this.state.documentoproduto}
					atualizarDocumentoProduto={this.atualizarDocumentoProduto}
					beforeClose={() => {this.setState({showEditarProduto: false})}}
				/>
				<VendaFinalizacao
					Pool={this.Pool}
					show={this.state.showVendaFinalizacao}
					totaldocumento={totaldocumento}
					aplicarAcrescimo={this.aplicarAcrescimo}
					aplicarDesconto={this.aplicarDesconto}
					incluirDezPorcento={this.incluirDezPorcento}
					finalizarVenda={this.finalizarVenda}
					beforeClose={() => {this.setState({showVendaFinalizacao: false})}}
				/>
				<VendaAplicarDesconto
					totalbruto={totalbruto}
					show={this.state.showVendaAplicarDesconto}
					aplicarDesconto={this.aplicarDesconto}
					beforeClose={() => {this.setState({showVendaAplicarDesconto: false})}}
				/>
				<VendaAplicarAcrescimo
					totalbruto={totalbruto}
					totaldesconto={totaldesconto}
					show={this.state.showVendaAplicarAcrescimo}
					aplicarAcrescimo={this.aplicarAcrescimo}
					beforeClose={() => {this.setState({showVendaAplicarAcrescimo: false})}}
				/>
			</Content>
		)
	}
}
