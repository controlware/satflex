import React from "react";
import $ from "jquery";

import Button from "./../com/Button.js";
import ButtonGroup from "./../com/ButtonGroup.js";
import FormGroup from "./../com/FormGroup.js";
import DataGrid from "./../com/DataGrid.js";

export default class Venda extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			dataGrid: []
		};
		this.loadDataGrid = this.loadDataGrid.bind(this);
	}

	componentDidMount(){
		this.loadDataGrid();
	}

	loadDataGrid(){
		$.getJSON("http://localhost/temp/json/datagrid.php").then(data => {
			this.setState({
				dataGrid: data
			});
		});
	}

	render(){
		var header = ["Coluna 1", "Coluna 2", "Coluna 3", "Coluna 4", "Coluna 5"];

		return (
			<div className="container">
				<h1>Pagina 1</h1>
				<div className="row">
					<FormGroup type="text" id="input01" label="Input Text" className="col-2" />
					<FormGroup type="password" id="input02" label="Input Password" className="col-2" />
					<FormGroup type="select" id="input03" label="Select" className="col-2" defaultValue="" options={["", "Opção 1", "Opção 2", "Opção 3"]} />
					<FormGroup type="checkbox" id="input04" label="Checkbox" className="col-2" />
				</div>
				<Button text="Carregar grade" onClick={this.loadDataGrid} />
				<ButtonGroup className="ml-5">
					<Button text="Azul" icon="cloud" color="blue" />
					<Button text="Vermelho" icon="blocked" color="red" />
					<Button text="Verde" icon="florist" color="green" />
					<Button text="Amarelo" icon="star-full" color="yellow" />
				</ButtonGroup>
				<div className="mt-5" />
				<DataGrid header={header} data={this.state.dataGrid} />
			</div>
		)
	}
}
