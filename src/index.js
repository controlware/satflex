import React from "react";
import ReactDOM from "react-dom";

import {BrowserRouter as Router, Route} from "react-router-dom";

import "./lib/bootstrap-4.0.0/bootstrap.js";

import Menu from "./com/Menu.js";
import {MessageBoxEmitter, MessageBoxModal} from "./com/MessageBox.js";

import Venda from "./view/Venda.js";

//import "./css/index.css";

class App extends React.Component {

	constructor(props){
		super(props);

		window.MessageBox = new MessageBoxEmitter();

		this.state = {
			MessageBox: window.MessageBox
		};
	}

	render(){
		return (
			<div>
				<Router>
					<Route path="/">
						<div>
							<Menu />
							<div id="viewContainer">
								<Route exact path="/" component={Venda} />
							</div>
						</div>
					</Route>
				</Router>
				<MessageBoxModal MessageBoxEmitter={this.state.MessageBox} />
			</div>
		)
	}
}

class Home extends React.Component {
	render(){
		return <div>
			<h1 className='text-center'>Home</h1>
		</div>
	}
}

ReactDOM.render(<App />, document.getElementById('root'));
