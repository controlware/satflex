import React from "react";

import "./../css/PainelRapido.css";

export default class PainelRapido extends React.Component {

	

	render(){
		return (
			<div className="painelrapido">
				{this.props.children}
			</div>
		);
	}

}
