import React from "react";
import ReactDOM from "react-dom";

import { HashRouter, Route } from "react-router-dom";

import "./lib/bootstrap-4.0.0/bootstrap.js";

import Menu from "./com/Menu.js";
import { FastMessageEmitter, FastMessageModal } from "./com/FastMessage.js";
import { InformarValorEmitter, InformarValorModal } from "./com/InformarValor.js";
import { LoadingEmitter, LoadingElement } from "./com/Loading.js";
import { MessageBoxEmitter, MessageBoxModal } from "./com/MessageBox.js";
import Servidor from "./com/Servidor.js";

import Categoria from "./view/Categoria.js";
import Configuracoes from "./view/Configuracoes.js";
import Contador from "./view/Contador.js";
import Estatistica from "./view/Estatistica.js";
import Fechamento from "./view/Fechamento.js";
import Ferramentas from "./view/Ferramentas.js";
import Parametro from "./view/Parametro.js";
import Produto from "./view/Produto.js";
import Relatorios from "./view/Relatorios.js";
import RelOrcamento from "./view/RelOrcamento.js";
import Suporte from "./view/Suporte.js";
import Venda from "./view/Venda.js";

import { valorParametro } from "./def/function.js";

import ProcessoAutomatico from "./com/ProcessoAutomatico.js";

import "./css/index.css";
import "./font/gotham/gotham.css";

import { Pool } from "./def/postgresql.js";

class App extends React.Component {

	constructor(props){
		super(props);

		window.FastMessage = new FastMessageEmitter();
		window.InformarValor = new InformarValorEmitter();
		window.Loading = new LoadingEmitter();
		window.MessageBox = new MessageBoxEmitter();

		this.state = {
			FastMessage: window.FastMessage,
			InformarValor: window.InformarValor,
			Loading: window.Loading,
			MessageBox: window.MessageBox
		};

		this.Pool = new Pool();
		this.processoAutomatico = new ProcessoAutomatico(this.Pool);
		window.processoAutomatico = this.processoAutomatico;
		
		// Utilizado apenas para debug
		window.servidor = new Servidor(this.Pool);
	}

	componentDidMount(){
		this.processoAutomatico.iniciar();
		window.addEventListener("keydown", this.onKeyDown);

		this.verificarTerminal();
	}

	componentWillUnmount(){
        window.removeEventListener("keydown", this.onKeyDown);
    }

	onKeyDown(e){
		if(e.ctrlKey && e.keyCode === 73){
			window.require('electron').ipcRenderer.sendSync("open-dev-tools");
		}
	}

	async verificarTerminal(){
		let status = await valorParametro(this.Pool, "SISTEMA", "STATUS");
		let telefone = await valorParametro(this.Pool, "REVENDA", "TELEFONE");
		switch(status){
			case "0000": // Ativo
				break;
			case "0001": // Bloqueado
				window.MessageBox.show({
					title: "Terminal bloqueado",
					text: "Seu terminal foi bloqueado, para mais informações, entre em contato com o suporte pelo número <b>" + telefone + "</b>.",
					buttons: [
						{
							text: "Sair do SAT-Flex",
							color: "primary",
							onClick: function(){
								window.close();
							}
						}
					]
				});
				break;
			case "0002": // Falta de comunicacao
				window.MessageBox.show({
					title: "Terminal bloqueado",
					text: "Seu terminal foi bloqueado por falta de comunicação com a Internet. Verifique sua conexão com a Internet e tente novamente.<br> Caso o problema persista, entre em contato com o suporte pelo número <b>" + telefone + "</b>.",
					buttons: [
						{
							text: "Sair do SAT-Flex",
							color: "primary",
							onClick: function(){
								window.close();
							}
						}
					]
				});
				break;
			default:
				break;
		}
	}

	render(){
		return (
			<div>
				<HashRouter>
					<Route path="/">
						<div>
							<Menu />
							<div id="viewContainer">
								<Route exact path="/" component={Venda} />
								<Route exact path="/venda" component={Venda} />
								<Route exact path="/venda/:id" component={Venda} />
								<Route path="/categoria" component={Categoria} />
								<Route path="/configuracao" component={Configuracoes} />
								<Route path="/contador" component={Contador} />
								<Route path="/estatistica" component={Estatistica} />
								<Route path="/fechamento" component={Fechamento} />
								<Route path="/ferramentas" component={Ferramentas} />
								<Route path="/parametro" component={Parametro} />
								<Route path="/produto" component={Produto} />
								<Route path="/relatorio" component={Relatorios} />
								<Route path="/relorcamento" component={RelOrcamento} />
								<Route path="/suporte" component={Suporte} />
							</div>
						</div>
					</Route>
				</HashRouter>
				<FastMessageModal FastMessageEmitter={this.state.FastMessage} />
				<InformarValorModal InformarValorEmitter={this.state.InformarValor} />
				<LoadingElement LoadingEmitter={this.state.Loading} />
				<MessageBoxModal MessageBoxEmitter={this.state.MessageBox} />
			</div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById("root"));
