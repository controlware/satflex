import React from "react";

import Button from "../com/Button.js";
import Col from "../com/Col.js";
import FormGroup from "../com/FormGroup.js";
import Hr from "../com/Hr.js";
import Modal from "../com/Modal.js";
import Row from "../com/Row.js";

import {defaultMessageBoxError} from "../def/function.js";

export default class ModalCategoria extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			show: this.props.show,
			showDiv: "principal",
			title: null
		};

		this.cancelar = this.cancelar.bind(this);
		this.changeDiv = this.changeDiv.bind(this);
		this.changeTitle = this.changeTitle.bind(this);
		this.excluir = this.excluir.bind(this);
		this.gravar = this.gravar.bind(this);
		this.limpar = this.limpar.bind(this);
		this.onChangeNcm = this.onChangeNcm.bind(this);
		this.onChangeInput = this.onChangeInput.bind(this);
		this.onChangeSincTributacao = this.onChangeSincTributacao.bind(this);
		this.sincronizarTributacao = this.sincronizarTributacao.bind(this);
	}

	cancelar(){
		this.setState({
			show: false
		});
	}

	carregar(idcategoria, callback){
		let query = [
			"SELECT categoria.descricao, categoria.dthrcriacao, categoria.cor,",
			"  categoria.sinctributacao, ncm.codigoncm, categoria.origem,",
			"  categoria.cfop, categoria.csosn, categoria.aliqicms, ",
			"  categoria.cstpis, categoria.aliqpis, categoria.cstcofins, ",
			"  categoria.aliqcofins, categoria.codcontribsocial, categoria.cest",
			"FROM categoria",
			"LEFT JOIN ncm USING (idncm)",
			"WHERE categoria.idcategoria = $1"
		].join(" ");

		this.props.Pool.query(query, [idcategoria], (err, res) => {
			if(err){
				defaultMessageBoxError(err.message);
				return false;
			}
			if(res.rows.length === 0){
				window.MessageBox.show({
					title: "Categoria não encontrada",
					text: "A categoria selecionada não pôde ser encontrada."
				});
				return false;
			}

			let state = {};
			let row = res.rows[0];

			for(let id in row){
				let value = row[id];
				switch(id){
					case "dthrcriacao":
						value = value.toLocaleString();
						break;
					case "aliqicms":
					case "aliqpis":
					case "aliqcofins":
						value = value.format(2, ",", ".");
						break;
					default:
						break;
				}

				state["input_" + id] = value;
			}
			this.setState(state);

			if(typeof callback === "function"){
				callback();
			}
		});
	}

	changeDiv(name){
		this.setState({
			showDiv: name
		});
	}

	changeTitle(props){
		if(props.idcategoria){
			props.Pool.query("SELECT descricao FROM categoria WHERE idcategoria = $1", [props.idcategoria], (err, res) => {
				if(err){
					defaultMessageBoxError(err.message);
					return false;
				}
				this.setState({
					title: "Alterando categoria: " + res.rows[0].descricao
				});
			});
		}else{
			this.setState({
				title: "Criando nova categoria"
			});
		}
	}

	componentWillReceiveProps(nextProps){
		if(!nextProps.show){
			return false;
		}

		this.changeTitle(nextProps);

		let updateShowState = () => {
			this.setState({
				show: nextProps.show
			});
		};

		if(nextProps.idcategoria){
			this.carregar(nextProps.idcategoria, updateShowState);
		}else{
			this.limpar();
			updateShowState();
		}
	}

	excluir(){
		window.MessageBox.show({
			title: "Excluír categoria",
			text: "Tem certeza que deseja excluír a categoria <b>" + this.state.input_descricao + "</b>?",
			buttons: [
				{
					text: "Sim",
					icon: "thumbs-up",
					color: "green",
					onClick: () => {
						window.MessageBox.hide();
						this.props.Pool.query("DELETE FROM categoria WHERE idcategoria = $1", [this.props.idcategoria], (err, res) => {
							if(err){
								defaultMessageBoxError(err.message);
								return false;
							}
							this.setState({
								show: false
							});
							window.FastMessage.show("Categoria excluída com sucesso.");
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
		})
	}

	async gravar(){
		let query = null;

		let columns = [];
		let values = [];
		for(let name in this.state){
			if(name.substr(0, 6) === "input_"){
				let name2 = name.replace("input_", "");
				let value = this.state[name];

				if(name2 === "codigoncm" && value){
					try{
						let res = await this.props.Pool.query("SELECT idncm FROM ncm WHERE codigoncm = $1", [value]);
						if(res.rows.length === 0){
							window.MessageBox.show({
								title: "NCM inexistente",
								text: "O código de NCM " + value + " não pôde ser encontrado.<br>Verifique se foi informado corretamente."
							});
							return false;
						}
						name2 = "idncm";
						value = res.rows[0].idncm;
					}catch(err) {
						defaultMessageBoxError(err.message);
						return false;
					}
				}

				if(["idcategoria", "dthrcriacao"].indexOf(name2) > -1){
					continue;
				}

				switch(name2){
					case "aliqicms":
					case "aliqpis":
					case "aliqcofins":
						if(value){
							value = value.toFloat();
						}
						break;
					default:
						break;
				}

				columns.push(name2);
				values.push(value);
			}
		}

		if(this.props.idcategoria){
			let num = 1;
			let sets = [];
			for(let i in columns){
				sets.push(columns[i] + " = $" + num++);
			}
			query = "UPDATE categoria SET " + sets.join(", ") + " WHERE idcategoria = " + this.props.idcategoria;
		}else{
			let sets = [];
			for(let i = 0; i < columns.length; i++){
				sets.push("$" + (i + 1));
			}
			query = "INSERT INTO categoria (" + columns.join(", ") + ") VALUES (" + sets.join(", ") + ")";
		}

		this.props.Pool.query(query, values, (err, res) => {
			if(err){
				defaultMessageBoxError(err.message);
				return false;
			}
			this.setState({
				show: false
			});
			window.FastMessage.show("Categoria gravada com sucesso.");
		});
	}

	limpar(){
		let state = {};
		for(let name in this.state){
			if(name.substr(0, 6) === "input_"){
				state[name] =  null;
			}
		}
		this.setState(state);
	}

	onChangeInput(event, callback){
		let element = event.target;
		let id = element.id.replace("modalcategoria-", "");
		let value = element.value;
		if(element.type === "checkbox"){
			value = (element.checked ? "S" : "N");
		}

		this.setState({
			["input_" + id]: value
	    }, callback);
	}

	onChangeNcm(event){
		this.onChangeInput(event, () => {
			this.sincronizarTributacao();
		});
	}

	onChangeSincTributacao(event){
		this.onChangeInput(event, () => {
			this.sincronizarTributacao();
		});
	}

	sincronizarTributacao(){
		if(this.state.input_sinctributacao !== "S"){
			return true;
		}

		let query = [
			"SELECT origem, cfop, csosn, aliqicms, cstpis, aliqpis, ",
			"  cstcofins, aliqcofins, codcontribsocial, cest",
			"FROM ncm",
			"WHERE codigoncm = $1"
		].join(" ");

		this.props.Pool.query(query, [this.state.input_codigoncm], (err, res) => {
			if(err){
				defaultMessageBoxError(err.message);
				return false;
			}
			if(res.rows.length === 0){
				window.MessageBox.show({
					title: "NCM não encontrado",
					text: "O NCM informado na categoria não pôde ser encontrado."
				});
				return false;
			}

			let state = {};
			let row = res.rows[0];
			for(let id in row){
				let value = row[id];
				switch(id){
					case "aliqicms":
					case "aliqpis":
					case "aliqcofins":
						value = value.format(2, ",", ".");
						break;
					default:
						break;
				}

				state["input_" + id] = value;
			}
			this.setState(state);
		});
	}

	shouldComponentUpdate(nextProps){
		return nextProps.show;
	}

	render(){
		let origemOptions = {
			"0": "0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8",
			"1": "1 - Estrangeira - Importação direta, exceto a indicada no código 6",
			"2": "2 - Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7",
			"3": "3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%",
			"4": "4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos de que tratam o Decreto-Lei nº 288/67, e as Leis nºs 8.248/91, 8.387/91, 10.176/01 e 11.484/ 07",
			"5": "5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%",
			"6": "6 - Estrangeira - Importação direta, sem similar nacional, constante em lista da Resolução CAMEX nº 79/2012 e gás natural",
			"7": "7 - Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista da Resolução CAMEX nº 79/2012 e gás natural",
			"8": "8 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%"
		};

		return (
			<Modal title={this.state.title} size="lg" show={this.state.show} beforeClose={this.props.beforeClose} afterClose={this.props.afterClose} closeOnOutClick={false}>
				<Row>
					<FormGroup type="text" id="modalcategoria-descricao" className="col-5" label="Descrição" value={this.state.input_descricao} onChange={this.onChangeInput} />
					<FormGroup type="color" id="modalcategoria-cor" className="col-3" label="Cor representativa" value={this.state.input_cor} onChange={this.onChangeInput} />
					<FormGroup type="text" id="modalcategoria-dthrcriacao" className="col-4" label="Criado em" readonly={true} value={this.state.input_dthrcriacao} onChange={this.onChangeInput} disabled={true} />
					<FormGroup type="text" id="modalcategoria-codigoncm" label="NCM da categoria" className="col-3" inputClassName="text-center" InformarValor={{mask: "9999.99.99"}} value={this.state.input_codigoncm} onChange={this.onChangeNcm} />
					<FormGroup type="checkbox" id="modalcategoria-sinctributacao" label="Usar as mesmas tributações da categoria" className="col-9" value={this.state.input_sinctributacao} onChange={this.onChangeSincTributacao} />
					<FormGroup type="select" id="modalcategoria-origem" className="col-6" label="Origem do categoria" options={origemOptions} value={this.state.input_origem} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
					<FormGroup type="text" id="modalcategoria-cfop" label="CFOP" className="col-3" inputClassName="text-center" InformarValor={{mask: "9.999"}} value={this.state.input_cfop} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
					<FormGroup type="select" id="modalcategoria-csosn" className="col-3" inputClassName="text-center" label="CSOSN" options={{"102": "102", "300": "300", "400": "400", "500": "500"}} value={this.state.input_csosn} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
					<FormGroup type="text" id="modalcategoria-aliqicms" label="Alíquota de ICMS" className="col-3" inputClassName="text-center" InformarValor={{decimal: 2}} value={this.state.input_aliqicms} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
					<FormGroup type="text" id="modalcategoria-cstpis" label="CST do PIS" className="col-3" inputClassName="text-center" InformarValor={{mask: "99"}} value={this.state.input_cstpis} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
					<FormGroup type="text" id="modalcategoria-aliqpis" label="Alíquota de PIS" className="col-3" inputClassName="text-center" InformarValor={{decimal: 2}} value={this.state.input_aliqpis} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
					<FormGroup type="text" id="modalcategoria-cstcofins" label="CST do Cofins" className="col-3" inputClassName="text-center" InformarValor={{mask: "99"}} value={this.state.input_cstcofins} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
					<FormGroup type="text" id="modalcategoria-aliqcofins" label="Alíquota de Cofins" className="col-3" inputClassName="text-center" InformarValor={{decimal: 2}} value={this.state.input_aliqcofins} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
					<FormGroup type="text" id="modalcategoria-codcontribsocial" label="Contribuição social" className="col-3" inputClassName="text-center" InformarValor={{mask: "99"}} value={this.state.input_codcontribsocial} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
					<FormGroup type="text" id="modalcategoria-cest" label="CEST" className="col-3" inputClassName="text-center" InformarValor={{mask: "99.999.99"}} value={this.state.input_cest} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
				</Row>
				<Hr className="mt-0" />
				<Row>
					<Col size="6">
						<Button text="Excluír" icon="bin" color="red" onClick={this.excluir} className={this.props.idcategoria ? "" : "d-none"} />
					</Col>
					<Col size="6" className="text-right">
						<Button text="Cancelar" icon="undo" color="red" onClick={this.cancelar} />
						<Button text="Gravar categoria" icon="thumbs-up" color="green" className="ml-2" onClick={this.gravar} />
					</Col>
				</Row>
			</Modal>
		);
	}
}
