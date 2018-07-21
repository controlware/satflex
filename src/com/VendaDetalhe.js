import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";

import Button from "./Button.js";
import Col from "./Col.js";
import Hr from "./Hr.js";
import Icon from "./Icon.js";
import ListGroup from "./ListGroup.js";
import ListItem from "./ListItem.js";
import Row from "./Row.js";

import "../css/VendaDetalhe.css";

export default class VendaDetalhe extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			height: "0px"
		}

		this.ajustarAltura = this.ajustarAltura.bind(this);
	}

	ajustarAltura(){
		this.setState({
			height: window.innerHeight
		});
	}

	componentDidMount(){
		window.addEventListener("resize", this.ajustarAltura);
		this.ajustarAltura();
	}

	componentWillUnmount(){
		window.removeEventListener("resize", this.ajustarAltura);
	}

	render(){
		return (
			<div className="vendadetalhe" style={{height: this.state.height}}>
				<VendaDetalheCabecalho
					cancelarUltimaVenda={this.props.cancelarUltimaVenda}
					cancelarVendaAtual={this.props.cancelarVendaAtual}
					carregarOrcamento={this.props.carregarOrcamento}
					listaDocumentoProduto={this.props.listaDocumentoProduto}
					operacao={this.props.operacao}
					reimprimirCupom={this.props.reimprimirCupom}
					trocarOperacao={this.props.trocarOperacao}
				/>
				<VendaDetalheCorpo
					aumentarQuantidade={this.props.aumentarQuantidade}
					diminuirQuantidade={this.props.diminuirQuantidade}
					editarProduto={this.props.editarProduto}
					listaDocumentoProduto={this.props.listaDocumentoProduto}
					removerProduto={this.props.removerProduto}
				/>
				<VendaDetalheRodape
					abrirFinalizacao={this.props.abrirFinalizacao}
					cpfcnpj={this.props.cpfcnpj}
					informarCPF={this.props.informarCPF}
					listaDocumentoProduto={this.props.listaDocumentoProduto}
					operacao={this.props.operacao}
				/>
			</div>
		)
	}
}

class VendaDetalheCabecalho extends React.Component {

	constructor(props){
		super(props);

		this.alternarOrcamento = this.alternarOrcamento.bind(this);
		this.alternarVenda = this.alternarVenda.bind(this);
		this.efetivarOrcamento = this.efetivarOrcamento.bind(this);
		this.onClickDocument = this.onClickDocument.bind(this);
		this.onClickIcon = this.onClickIcon.bind(this);

		this.exibindoOpcoes = false;
	}

	abrirOpcoes(){
		let opcoes = ReactDOM.findDOMNode(this.opcoes);
		$(opcoes).stop().animate({
			height: "show"
		}, 350);
		this.exibindoOpcoes = true;
	}

	alternarOrcamento(){
		this.props.trocarOperacao("OR");
	}

	alternarVenda(){
		this.props.trocarOperacao("CU");
	}

	componentDidMount(){
		document.addEventListener("click", this.onClickDocument);
	}

	componentWillUnmount(){
		document.removeEventListener("click", this.onClickDocument);
	}

	efetivarOrcamento(){
		window.InformarValor.show({
			title: "Número do orçamento",
			mask: "999999",
			success: (value) => {
				if(value.length > 0){
					this.props.carregarOrcamento(value);
				}
			}
		});
	}

	fecharOpcoes(){
		let opcoes = ReactDOM.findDOMNode(this.opcoes);
		$(opcoes).stop().animate({
			height: "hide"
		}, 350);
		this.exibindoOpcoes = false;
	}

	onClickDocument(event){
		let icon = ReactDOM.findDOMNode(this.icon);
		if(!this.iconClicked && icon.contains(event.target)){
			this.iconClicked = true;
		}else if(this.exibindoOpcoes){
			this.iconClicked = false;
			this.fecharOpcoes();
		}
	}

	onClickIcon(){
		this.abrirOpcoes();
	}

	render(){
		let countLista = this.props.listaDocumentoProduto.length;
		let operacao = this.props.operacao;

		let titulo = null;
		switch(operacao){
			case "OR":
				titulo = "Orçamento";
				break;
			case "CU":
			default:
				titulo = "Detalhe da venda";
				break;
		}

		return (
			<div className="vendadetalhe-cabecalho">
				<div>
					<h4>{titulo}</h4>
					<Icon name="menu" onClick={this.onClickIcon} ref={(icon) => { this.icon = icon }} />
					<div className={"vendadetalhe-cabecalho-opcoes"} ref={(opcoes) => { this.opcoes = opcoes }}>
						<ListGroup>
							<ListItem className={countLista === 0 ? " d-none" : ""} onClick={this.props.cancelarVendaAtual}>Cancelar venda atual</ListItem>
							<ListItem className={countLista === 0 ? "" : " d-none"} onClick={this.props.cancelarUltimaVenda}>Cancelar última venda</ListItem>
							<ListItem onClick={this.props.reimprimirCupom}>Reimprimir cupom</ListItem>
							<ListItem className={operacao !== "CU" ? "" : " d-none"} onClick={this.alternarVenda}>Alternar para venda</ListItem>
							<ListItem className={operacao !== "OR" ? "" : " d-none"} onClick={this.alternarOrcamento}>Alternar para orçamento</ListItem>
							<ListItem onClick={this.efetivarOrcamento}>Efetivar um orçamento</ListItem>
						</ListGroup>
					</div>
				</div>
			</div>
		)
	}
}

class VendaDetalheCorpo extends React.Component {

	constructor(props){
		super(props);

		this.countLista = props.listaDocumentoProduto.length;
	}

	componentDidUpdate(){
		if(this.props.listaDocumentoProduto.length > this.countLista){
			this.scrollToBottom();
		}
		this.countLista = this.props.listaDocumentoProduto.length;
	}

	scrollToBottom(){
		$("#vendadetalhe-corpo-conteudo").stop().animate({
			"scrollTop": $("#vendadetalhe-corpo-conteudo").get(0).scrollHeight
		}, 1000);
	}

	render(){
		return (
			<div className="vendadetalhe-corpo">
				<div>
					<div id="vendadetalhe-corpo-conteudo">
						{this.props.listaDocumentoProduto.map((documentoproduto, i) => {
							documentoproduto.i = i;
							return <VendaDetalheCorpoItem key={i} documentoproduto={documentoproduto} aumentarQuantidade={this.props.aumentarQuantidade} diminuirQuantidade={this.props.diminuirQuantidade} editarProduto={this.props.editarProduto} removerProduto={this.props.removerProduto} />
						})}
					</div>
				</div>
			</div>
		)
	}
}

class VendaDetalheCorpoItem extends React.Component {

	render(documentoproduto){
		let espaco = "   ";
		let preco = "R$ " + this.props.documentoproduto.preco.format(2, ",", ".");
		let quantidade  = this.props.documentoproduto.quantidade.format((this.props.documentoproduto.balanca === "S" ? 3 : 0), ",", ".");
		let totaldesconto = "R$ " + this.props.documentoproduto.totaldesconto.format(2, ",", ".");
		let totalacrescimo = "R$ " + this.props.documentoproduto.totalacrescimo.format(2, ",", ".");
		let totalproduto = "R$ " + this.props.documentoproduto.totalproduto.format(2, ",", ".");

		let calculo = null;
		if(this.props.documentoproduto.descontounitario > 0 && this.props.documentoproduto.acrescimounitario > 0){
			calculo = preco + espaco + "x" + espaco + quantidade + espaco + "-" + espaco + totaldesconto + espaco + "+" + espaco + totalacrescimo + espaco + "=" + espaco + "<b>" + totalproduto + "</b>";
		}else if(this.props.documentoproduto.descontounitario > 0){
			calculo = preco + espaco + "x" + espaco + quantidade + espaco + "-" + espaco + totaldesconto + espaco + "=" + espaco + "<b>" + totalproduto + "</b>";
		}else if(this.props.documentoproduto.acrescimounitario > 0){
			calculo = preco + espaco + "x" + espaco + quantidade + espaco + "+" + espaco + totalacrescimo + espaco + "=" + espaco + "<b>" + totalproduto + "</b>";
		}else{
			calculo = preco + espaco + "x" + espaco + quantidade + espaco + "=" + espaco + "<b>" + totalproduto + "</b>";
		}

		return (
			<div>
				<Row className="vendadetalhe-produto" onClick={() => { this.props.editarProduto(this.props.documentoproduto); }}>
					<Col size="8">
						<div className="vendadetalhe-produto-descricao">{this.props.documentoproduto.descricao}</div>
		   				<div className="vendadetalhe-produto-calculo" dangerouslySetInnerHTML={{__html: calculo}}></div>
		 			</Col>
		 			<Col size="4" className="vendadetalhe-produto-botao text-right">
		   				<div>
							<Button icon="plus" color="green" onClick={(event) => { this.props.aumentarQuantidade(this.props.documentoproduto); event.stopPropagation(); }} />
							<Button icon="minus" color="red" onClick={(event) => { this.props.diminuirQuantidade(this.props.documentoproduto); event.stopPropagation(); }} />
		   				</div>
						<Button icon="bin" color="red" onClick={(event) => { this.props.removerProduto(this.props.documentoproduto); event.stopPropagation(); }} />
		 			</Col>
				</Row>
				<Hr />
			</div>
		);
	}
}

class VendaDetalheRodape extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			cpfcnpj: props.cpfcnpj
		};
	}

	componentWillReceiveProps(nextProps){
		this.setState({
			cpfcnpj: nextProps.cpfcnpj
		});
	}

	render(){
		let totalquantidade = 0;
		let totalbruto = 0;
		let totaldesconto = 0;
		let totaldocumento = 0;

		this.props.listaDocumentoProduto.forEach((documentoproduto) => {
			totalquantidade += parseFloat(documentoproduto.quantidade);
			totalbruto += parseFloat(documentoproduto.preco * documentoproduto.quantidade);
			totaldesconto += parseFloat(documentoproduto.totaldesconto);
			totaldocumento += parseFloat(documentoproduto.totalproduto);
		});

		return (
			<div className="vendadetalhe-rodape">
				<div>
					<Row>
						<Col size="6">
							<div className="vendadetalhe-rodape-informacao mb-3 mt-1">
								<div>Quantidade de itens <strong>{totalquantidade}</strong></div>
								<div>Total dos itens <strong><small>R$</small>{totalbruto.format(2, ",", ".")}</strong></div>
								<div>Total de desconto <strong><small>R$</small>{totaldesconto.format(2, ",", ".")}</strong></div>
							</div>
							<div className={this.props.operacao === "CU" ? "" : "d-none"}>
								<div className={"vendadetalhe-rodape-cpfcnpj" + (this.state.cpfcnpj ? "" : " d-none")} style={{position: "absolute", bottom: "0px"}}>
									<span>CPF: <strong>{this.state.cpfcnpj}</strong></span>
									<Button text="alterar" color="green" size="xs" className="ml-2" onClick={this.props.informarCPF} />
								</div>
								<div className={this.state.cpfcnpj ? " d-none" : ""} style={{position: "absolute", bottom: "0px"}}>
									<Button text="Informar CPF" color="green" size="sm" onClick={this.props.informarCPF} />
								</div>
							</div>
						</Col>
						<Col size="6">
							<div className="vendadetalhe-rodape-totaldocumento">{totaldocumento.format(2, ",", ".")}</div>
							<Button text="F I N A L I Z A R" icon="dollar2" size="lg" block="true" color="green" disabled={totaldocumento === 0} onClick={this.props.abrirFinalizacao} />
						</Col>
					</Row>
				</div>
			</div>
		)
	}
}
