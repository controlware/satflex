import React from "react";

import Button from "./Button.js";
import Col from "./Col.js";
import FormGroup from "./FormGroup.js";
import Hr from "./Hr.js";
import Modal from "./Modal.js";
import Row from "./Row.js";

import {validarCPF, validarCNPJ} from "../def/function.js";

export default class VendaFinalizacaoOrcamento extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			nomeorcamento: this.props.nomeorcamento,
			cpfcnpj: this.props.cpfcnpj,
			show: this.props.show
		};

		this.cancelar = this.cancelar.bind(this);
		this.confirmar = this.confirmar.bind(this);
		this.onChangeCpfCnpj = this.onChangeCpfCnpj.bind(this);
		this.onChangeNomeOrcamento = this.onChangeNomeOrcamento.bind(this);
		this.onFocusCpfCnpj = this.onFocusCpfCnpj.bind(this);
	}

	cancelar(){
		this.setState({
			show: false
		});
	}

	componentWillReceiveProps(nextProps){
		this.setState({
			nomeorcamento: nextProps.nomeorcamento,
			cpfcnpj: nextProps.cpfcnpj,
			show: nextProps.show
		});
	}

	confirmar(){
		this.props.finalizarOrcamento(this.state.nomeorcamento, this.state.cpfcnpj);
	}

	onChangeCpfCnpj(event){
		this.setState({
			cpfcnpj: event.target.value
		});
	}

	onChangeNomeOrcamento(event){
		this.setState({
			nomeorcamento: event.target.value
		});
	}

	onFocusCpfCnpj(event){
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
						text: "O CPF ou CNPJ informado é inválido."
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

	render(){
		return (
			<Modal id="VendaFinalizacaoOrcamento" show={this.state.show} size="sm" beforeClose={this.props.beforeClose} >
				<Row>
					<FormGroup type="text" className="col-12" label="Nome do cliente" value={this.state.nomeorcamento} onChange={this.onChangeNomeOrcamento} />
					<FormGroup type="text" className="col-12" label="CPF/CNPJ" value={this.state.cpfcnpj} onChange={this.onChangeCpfCnpj} onFocus={this.onFocusCpfCnpj} />
				</Row>
				<Hr className="mt-0" />
				<Row>
					<Col size="6">
						<Button text="Cancelar" color="red" block={true} onClick={this.cancelar} />
					</Col>
					<Col size="6" className="pl-0">
						<Button text="Confirmar" color="green" block={true} onClick={this.confirmar} />
					</Col>
				</Row>
			</Modal>
		);
	}
}
