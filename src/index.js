import React from "react";
import ReactDOM from "react-dom";

import {BrowserRouter as Router, Route} from "react-router-dom";

import "./lib/bootstrap-4.0.0/bootstrap.js";

import Menu from "./com/Menu.js";
import {MessageBoxEmitter, MessageBoxModal} from "./com/MessageBox.js";
import {FastMessageEmitter, FastMessageModal} from "./com/FastMessage.js";
import {InformarValorEmitter, InformarValorModal} from "./com/InformarValor.js";

import Categoria from "./view/Categoria.js";
import Produto from "./view/Produto.js";
import Venda from "./view/Venda.js";

import "./css/index.css";
import "./font/gotham/gotham.css";

class App extends React.Component {

	constructor(props){
		super(props);

		window.MessageBox = new MessageBoxEmitter();
		window.FastMessage = new FastMessageEmitter();
		window.InformarValor = new InformarValorEmitter();

		this.state = {
			MessageBox: window.MessageBox,
			FastMessage: window.FastMessage,
			InformarValor: window.InformarValor
		};
	}

	componentDidMount(){

	}

	render(){
		return (
			<div>
				<Router>
					<Route path="/">
						<div>
							<Menu />
							<div id="viewContainer">
								<Route path="/venda" component={Venda} />
								<Route path="/produto" component={Produto} />
								<Route path="/categoria" component={Categoria} />
							</div>
						</div>
					</Route>
				</Router>
				<MessageBoxModal MessageBoxEmitter={this.state.MessageBox} />
				<FastMessageModal FastMessageEmitter={this.state.FastMessage} />
				<InformarValorModal InformarValorEmitter={this.state.InformarValor} />
			</div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById("root"));
