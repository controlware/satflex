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
import VendaCancelarCupom from  "../com/VendaCancelarCupom.js";
import VendaDetalhe from "../com/VendaDetalhe.js";
import VendaEditarProduto from "../com/VendaEditarProduto.js";
import VendaFinalizacao from "../com/VendaFinalizacao.js";
import VendaFinalizacaoOrcamento from "../com/VendaFinalizacaoOrcamento.js";
import VendaReimprimirCupom from "../com/VendaReimprimirCupom.js";

import Printer from "../com/Printer.js";
import SAT from "../com/SAT.js";

import "../def/prototype.js";
import {
	defaultMessageBoxError, temporaryDirectory, validarCPF,
	validarCNPJ, valorParametro, writeTemporary
} from "../def/function.js";

import "../css/Venda.css";

export default class Venda extends React.Component {

	constructor(props) {
		super(props);

		let documentoproduto = this.criarObjetoDocumentoProduto();

		this.state = {
			documentoproduto: documentoproduto, // Produto atual que esta sendo editado
			listaDocumentoProduto: [], // Lista de produtos que compoe a venda
			listaDocumentoPagamento: [], // Lista de pagamentos que compoe a venda
			operacao: "CU", // Operacao (CU: Cupom, OR: Orcamento)
			cpfcnpj: null, // CPF/CNPJ do cliente
			nomeorcamento: null, // Nome do cliente
			iddocumentoorcamento: null, // ID do orcamento de origem
			pesquisa: "", // Conteudo da pesquisa
			pesquisaEfetiva: "", // O real termo sendo pesquisado
			showEditarProduto: false, // Se deve exibir o modal da edicao de produtos
			showVendaAplicarDesconto: false, // Se deve exibir o modal da aplicacao de desconto
			showVendaAplicarAcrescimo: false, // Se deve exibir o modal da aplicacao de acrescimo
			showVendaCancelarCupom: false, // Se deve exibir o modal de cancelamento de cupom
			showVendaFinalizacao: false, // Se deve exibir o modal da finalizacao de venda
			showVendaFinalizacaoOrcamento: false, // Se deve exibir o modal da finalizacao de orcamento
			showVendaReimprimirCupom: false // Se deve exibir o modal de reimpressao de cupom
		};

		this.abrirFinalizacao = this.abrirFinalizacao.bind(this);
		this.animarProdutoPainel = this.animarProdutoPainel.bind(this);
		this.aplicarAcrescimo = this.aplicarAcrescimo.bind(this);
		this.aplicarDesconto = this.aplicarDesconto.bind(this);
		this.atualizarDocumentoProduto = this.atualizarDocumentoProduto.bind(this);
		this.aumentarQuantidade = this.aumentarQuantidade.bind(this);
		this.cancelarUltimaVenda = this.cancelarUltimaVenda.bind(this);
		this.cancelarVendaAtual = this.cancelarVendaAtual.bind(this);
		this.carregarTemporario = this.carregarTemporario.bind(this);
		this.diminuirQuantidade = this.diminuirQuantidade.bind(this);
		this.editarProduto = this.editarProduto.bind(this);
		this.finalizarDocumento = this.finalizarDocumento.bind(this);
		this.finalizarOrcamento = this.finalizarOrcamento.bind(this);
		this.finalizarVenda = this.finalizarVenda.bind(this);
		this.gravarTemporario = this.gravarTemporario.bind(this);
		this.incluirDezPorcento = this.incluirDezPorcento.bind(this);
		this.incluirProduto = this.incluirProduto.bind(this);
		this.informarCPF = this.informarCPF.bind(this);
		this.onChangePesquisa = this.onChangePesquisa.bind(this);
		this.onClickBuscar = this.onClickBuscar.bind(this);
		this.onKeyUpPesquisa = this.onKeyUpPesquisa.bind(this);
		this.pesquisaLimpar = this.pesquisaLimpar.bind(this);
		this.reimprimirCupom = this.reimprimirCupom.bind(this);
		this.reiniciar = this.reiniciar.bind(this);
		this.removerProduto = this.removerProduto.bind(this);
		this.trocarOperacao = this.trocarOperacao.bind(this);

		this.Pool = new Pool();
		this.Printer = new Printer(this.Pool);

		this.temporaryFileName = "venda.tmp";
	}

	abrirFinalizacao(){
		switch(this.state.operacao){
			case "CU":
				this.setState({
					showVendaFinalizacao: true
				});
				break;
			case "OR":
				this.setState({
					showVendaFinalizacaoOrcamento: true
				});
				break;
			default:
				break;
		}
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

	cancelarUltimaVenda(){
		this.setState({
			showVendaCancelarCupom: true
		});
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

	async carregarTemporario(){
		let fs = window.require("fs");
		let filename = temporaryDirectory() + "/" + this.temporaryFileName;
		if(fs.existsSync(filename)){
			let content = fs.readFileSync(filename);
			let state = JSON.parse(content);
			if(typeof state === "object"){
				this.setState(state);
			}
		}
	}

	componentDidMount(){
		this.carregarTemporario();
	}

	componentWillUnmount(){
		this.Pool.end();
	}

	componentWillUpdate(nextProps, nextState){
		this.gravarTemporario(nextState);
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

	async finalizarDocumento(){
		window.Loading.show();

		// Abre um client com o banco para fazer transacao
		const client = await this.Pool.connect();
		try{
			// Inicia a transacao
			client.query("BEGIN");

			// Cria o documento
			let sqlInsertDocumento = [
				"INSERT INTO documento (operacao, modelo, cpfcnpj, nomeorcamento, totaltroco)",
				"VALUES ($1, $2, $3, $4, $5)",
				"RETURNING iddocumento"
			].join(" ");
			let resDocumento = await client.query(sqlInsertDocumento, [
				this.state.operacao, "65", this.state.cpfcnpj,
				this.state.nomeorcamento, this.state.totaltroco
			]);

			// Captura o id do documento gravado
			let iddocumento = resDocumento.rows[0].iddocumento;

			// Captura todos os codigos de produtos
			let listaIdProduto = [];
			for(let documentoproduto of this.state.listaDocumentoProduto){
				listaIdProduto.push(documentoproduto.idproduto);
			}

			// Carrega as informacoes necessarias para incluir o produto
			let queryProduto = [
				"SELECT produto.idproduto, ncm.codigoncm, produto.origem,",
				"  produto.csosn, produto.aliqicms, produto.cstpis, produto.aliqpis,",
				"  produto.cstcofins, produto.aliqcofins, produto.codcontribsocial,",
				"  produto.cest, produto.cfop",
				"FROM produto",
				"LEFT JOIN ncm USING (idncm)",
				"WHERE idproduto IN (" + listaIdProduto.join(", ") + ")"
			].join(" ");

			let resProduto = await client.query(queryProduto);

			// Organiza os produtos carregados
			let listaProdutos = {};
			for(let row of resProduto.rows){
				let idproduto = row.idproduto;
				delete row.idproduto;
				listaProdutos[idproduto] = row;
			}

			// Percorre os itens da venda
			let sequencial = 1;
			for(let documentoproduto of this.state.listaDocumentoProduto){
				let produto = listaProdutos[documentoproduto.idproduto];

				let sqlInsertDocumentoProduto = [
					"INSERT INTO documentoproduto (",
					"  iddocumento, sequencial, idproduto,",
					"  descricao, preco, quantidade,",
					"  descontounitario, acrescimounitario, codigoncm,",
					"  origem, csosn, aliqicms,",
					"  cstpis, aliqpis, cstcofins,",
					"  aliqcofins, codcontribsocial, cest,",
					"  cfop",
					") VALUES (",
					"  $1, $2, $3,",
					"  $4, $5, $6,",
					"  $7, $8, $9,",
					"  $10, $11, $12,",
					"  $13, $14, $15,",
					"  $16, $17, $18,",
					"  $19",
					")"
				].join(" ");

				await client.query(sqlInsertDocumentoProduto, [
					iddocumento, sequencial++, documentoproduto.idproduto,
					documentoproduto.descricao, documentoproduto.preco, documentoproduto.quantidade,
					documentoproduto.descontounitario, documentoproduto.acrescimounitario, produto.codigoncm,
					produto.origem, produto.csosn, produto.aliqicms,
					produto.cstpis, produto.aliqpis, produto.cstcofins,
					produto.aliqcofins, produto.codcontribsocial, produto.cest,
					produto.cfop
				]);
			}

			// Verifica se eh cupom
			if(this.state.operacao === "CU"){
				let listaDocumentoPagamento = this.state.listaDocumentoPagamento;

				// Verifica se existe troco, e se caso sim, abate o valor da ultima finalizadora informada
				if(this.state.totaltroco > 0){
					let i = listaDocumentoPagamento.length - 1;
					listaDocumentoPagamento[i].totalpagamento -= this.state.totaltroco;
				}

				// Grava os pagamentos
				for(let documentopagamento of listaDocumentoPagamento){
					let sqlInsertDocumentoPagamento = [
						"INSERT INTO documentopagamento (iddocumento, idformapagamento, totalpagamento)",
						"VALUES ($1, $2, $3)"
					].join(" ");

					await client.query(sqlInsertDocumentoPagamento, [
						iddocumento, documentopagamento.idformapagamento, documentopagamento.totalpagamento
					]);
				}

				// Apaga o orcamento origem se houver
				if(this.state.iddocumentoorcamento){
					await client.query("DELETE FROM documento WHERE iddocumento = $1", [this.state.iddocumentoorcamento]);
				}

				// Transmite o documento atraves do SAT
				let sat = new SAT(client);
				let retorno = await sat.transmitirDocumento(iddocumento);
				if(retorno === false){
					throw new Error(sat.error);
				}

				// Atualiza os dados do documento fiscal
				await client.query("UPDATE documento SET xml = $1, chave = $2, numero = $3 WHERE iddocumento = $4", [retorno.xml, retorno.chave, retorno.numero, iddocumento]);
			}

			// Confirma a transacao do banco de dados
			await client.query("COMMIT");

			// Mensagem de sucesso
			if(this.state.totaltroco > 0){
				window.MessageBox.show({
					text: "<div class='text-center'><h5>Venda finalizada com sucesso!</h5><h3>Total de troco</h3><h1><small>R$</small>" + this.state.totaltroco.format(2, ",", ".") + "</h1></div>"
				});
			}else{
				switch(this.state.operacao){
					case "CU":
					default:
						window.FastMessage.show("Venda finalizada com sucesso!");
						break;
					case "OR":
						window.FastMessage.show("Orçamento finalizado com sucesso!");
						break;
				}
			}

			// Imprime o documento
			let numeroVias = await valorParametro(this.Pool, "IMPRESSORA", "NUMEROVIAS");
			if(await valorParametro(this.Pool, "IMPRESSORA", "CONFIRMACAO") === "S"){
				window.MessageBox.show({
					title: "Imprimir cupom",
					text: "Deseja imprimir o cupom da venda realizada?",
					buttons: [
						{
							text: "Sim",
							color: "green",
							icon: "thumbs-up",
							onClick: () => {
								window.MessageBox.hide();
								for(let i = 1; i <= numeroVias; i++){
									this.Printer.imprimirDocumento(iddocumento);
								}
							}
						},
						{
							text: "Não",
							color: "red",
							icon: "thumbs-down",
							onClick: function(){
								window.MessageBox.hide();
							}
						}
					]
				})
			}else{
				for(let i = 1; i <= numeroVias; i++){
					this.Printer.imprimirDocumento(iddocumento);
				}
			}

			// Prepara a tela para uma nova venda
			this.reiniciar();
		}catch(err){
			console.error(err);
			await client.query("ROLLBACK");
			defaultMessageBoxError(err.message);
		}finally{
			client.release();
			window.Loading.hide();
		}
	}

	finalizarOrcamento(nomeorcamento, cpfcnpj){
		this.setState({
			nomeorcamento: nomeorcamento,
			cpfcnpj: cpfcnpj,
			listaDocumentoPagamento: [],
			totaltroco: 0,
			showVendaFinalizacaoOrcamento: false
		}, () => {
			this.finalizarDocumento();
		});
	}

	finalizarVenda(documentopagamentos, totaltroco){
		this.setState({
			listaDocumentoPagamento: documentopagamentos,
			totaltroco: totaltroco,
		}, () => {
			this.finalizarDocumento();
		});
	}

	async gravarTemporario(state){
		state = (state === undefined ? this.state : state);
		writeTemporary(this.temporaryFileName, JSON.stringify(state));
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

	reimprimirCupom(){
		this.setState({
			showVendaReimprimirCupom: true
		});
	}

	reiniciar(){
		let documentoproduto = this.criarObjetoDocumentoProduto();

		this.setState({
			documentoproduto: documentoproduto,
			listaDocumentoProduto: [],
			listaDocumentoPagamento: [],
			//operacao: "CU",
			cpfcnpj: null,
			nomeorcamento: null,
			iddocumentoorcamento: null,
			pesquisa: "",
			pesquisaEfetiva: "",
			showEditarProduto: false,
			showVendaFinalizacao: false,
			showVendaFinalizacaoOrcamento: false,
			showVendaAplicarDesconto: false,
			showVendaAplicarAcrescimo: false
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

	trocarOperacao(operacao){
		this.setState({
			operacao: operacao
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

		let contentClassName = "operacao-" + this.state.operacao;

		return (
			<Content className={contentClassName}>
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
							cancelarUltimaVenda={this.cancelarUltimaVenda}
							cancelarVendaAtual={this.cancelarVendaAtual}
							reimprimirCupom={this.reimprimirCupom}
							cpfcnpj={this.state.cpfcnpj}
							diminuirQuantidade={this.diminuirQuantidade}
							editarProduto={this.editarProduto}
							informarCPF={this.informarCPF}
							listaDocumentoProduto={this.state.listaDocumentoProduto}
							operacao={this.state.operacao}
							removerProduto={this.removerProduto}
							trocarOperacao={this.trocarOperacao}
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
					listaDocumentoPagamento={this.state.listaDocumentoPagamento}
					beforeClose={() => {this.setState({showVendaFinalizacao: false})}}
				/>
				<VendaFinalizacaoOrcamento
					nomeorcamento={this.state.nomeorcamento}
					cpfcnpj={this.state.cpfcnpj}
					finalizarOrcamento={this.finalizarOrcamento}
					show={this.state.showVendaFinalizacaoOrcamento}
					beforeClose={() => {this.setState({showVendaFinalizacaoOrcamento: false})}}
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
				<VendaCancelarCupom
					Pool={this.Pool}
					show={this.state.showVendaCancelarCupom}
					beforeClose={() => {this.setState({showVendaCancelarCupom: false})}}
				/>
				<VendaReimprimirCupom
					Pool={this.Pool}
					show={this.state.showVendaReimprimirCupom}
					beforeClose={() => {this.setState({showVendaReimprimirCupom: false})}}
				/>
			</Content>
		)
	}
}
