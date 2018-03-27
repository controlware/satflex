import React from "react";

import "./../css/PainelRapido.css";

import PainelRapidoPesquisa from  "./PainelRapidoPesquisa.js";
import PainelRapidoPoucosProdutos from  "./PainelRapidoPoucosProdutos.js";
import PainelRapidoMediosProdutos from  "./PainelRapidoMediosProdutos.js";
import PainelRapidoMuitosProdutos from  "./PainelRapidoMuitosProdutos.js";

import {defaultMessageBoxError, valorParametro} from "./../def/function.js";

export default class PainelRapido extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			layoutVendas: null
		};
	}

	componentDidMount(){
		valorParametro(this.props.Pool, "DIVERSOS", "LAYOUTVENDAS", (valor) => {
			this.setState({
				layoutVendas: valor
			});
		}, (err) => {
			defaultMessageBoxError(err);
		});
	}

	render(){
		if(this.props.pesquisa.length > 0){
			return <PainelRapidoPesquisa {...this.props} layoutVendas={this.state.layoutVendas} />
		}

		switch(this.state.layoutVendas){
			case "0": return <PainelRapidoPoucosProdutos {...this.props} />;
			case "1": return <PainelRapidoMediosProdutos {...this.props} />;
			case "2": return <PainelRapidoMuitosProdutos {...this.props} />;
			default: return null;
		}
	}

}
