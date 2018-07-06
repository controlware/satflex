import React from "react";
import ReactDOM from "react-dom";

import {HashRouter, Route} from "react-router-dom";

import "./lib/bootstrap-4.0.0/bootstrap.js";

import Menu from "./com/Menu.js";
import {FastMessageEmitter, FastMessageModal} from "./com/FastMessage.js";
import {InformarValorEmitter, InformarValorModal} from "./com/InformarValor.js";
import {LoadingEmitter, LoadingElement} from "./com/Loading.js";
import {MessageBoxEmitter, MessageBoxModal} from "./com/MessageBox.js";

import Categoria from "./view/Categoria.js";
import Configuracoes from "./view/Configuracoes.js";
import Contador from "./view/Contador.js";
import Parametro from "./view/Parametro.js";
import Produto from "./view/Produto.js";
import Relatorios from "./view/Relatorios.js";
import Suporte from "./view/Suporte.js";
import Venda from "./view/Venda.js";

import "./css/index.css";
import "./font/gotham/gotham.css";

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
								<Route path="/categoria" component={Categoria} />
								<Route path="/configuracao" component={Configuracoes} />
								<Route path="/contador" component={Contador} />
								<Route path="/parametro" component={Parametro} />
								<Route path="/produto" component={Produto} />
								<Route path="/relatorio" component={Relatorios} />
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
