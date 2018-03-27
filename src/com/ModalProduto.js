import React from "react";

import Button from "../com/Button.js";
import Col from "../com/Col.js";
import FormControl from "../com/FormControl.js";
import FormGroup from "../com/FormGroup.js";
import Hr from "../com/Hr.js";
import Modal from "../com/Modal.js";
import Row from "../com/Row.js";

import {defaultMessageBoxError} from "../def/function.js";

export default class ModalProduto extends React.Component {

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
		this.onChangeCategoria = this.onChangeCategoria.bind(this);
		this.onChangeInput = this.onChangeInput.bind(this);
		this.onChangeSincTributacao = this.onChangeSincTributacao.bind(this);
		this.sincronizarTributacao = this.sincronizarTributacao.bind(this);
	}

	cancelar(){
		this.setState({
			show: false
		});
	}

	carregar(idproduto, callback){
		let query = [
			"SELECT produto.descricao, produto.dthrcriacao,",
			"  produto.idcategoria, produto.codigoean, produto.balanca,",
			"  produto.precovariavel, produto.preco, produto.status,",
			"  produto.sinctributacao, ncm.codigoncm, produto.origem,",
			"  produto.cfop, produto.csosn, produto.aliqicms, ",
			"  produto.cstpis, produto.aliqpis, produto.cstcofins, ",
			"  produto.aliqcofins, produto.codcontribsocial, produto.cest",
			"FROM produto",
			"LEFT JOIN ncm USING (idncm)",
			"WHERE produto.idproduto = $1"
		].join(" ");

		this.props.Pool.query(query, [idproduto], (err, res) => {
			if(err){
				defaultMessageBoxError(err.message);
				return false;
			}
			if(res.rows.length === 0){
				window.MessageBox.show({
					title: "Produto não encontrado",
					text: "O produto selecionado não pôde ser encontrado."
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
					case "preco":
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
		if(props.idproduto){
			props.Pool.query("SELECT descricao FROM produto WHERE idproduto = $1", [props.idproduto], (err, res) => {
				if(err){
					defaultMessageBoxError(err.message);
					return false;
				}
				this.setState({
					title: "Alterando produto: " + res.rows[0].descricao
				});
			});
		}else{
			this.setState({
				title: "Criando novo produto"
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

		if(nextProps.idproduto){
			this.carregar(nextProps.idproduto, updateShowState);
		}else{
			this.limpar();
			updateShowState();
		}
	}

	excluir(){
		window.MessageBox.show({
			title: "Excluír produto",
			text: "Tem certeza que deseja excluír o produto <b>" + this.state.input_descricao + "</b>?",
			buttons: [
				{
					text: "Sim",
					icon: "thumbs-up",
					color: "green",
					onClick: () => {
						window.MessageBox.hide();
						this.props.Pool.query("DELETE FROM produto WHERE idproduto = $1", [this.props.idproduto], (err, res) => {
							if(err){
								defaultMessageBoxError(err.message);
								return false;
							}
							this.setState({
								show: false
							});
							window.FastMessage.show("Produto excluído com sucesso.");
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

				if(["idproduto", "dthrcriacao"].indexOf(name2) > -1){
					continue;
				}

				switch(name2){
					case "preco":
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

		if(this.props.idproduto){
			let num = 1;
			let sets = [];
			for(let i in columns){
				sets.push(columns[i] + " = $" + num++);
			}
			query = "UPDATE produto SET " + sets.join(", ") + " WHERE idproduto = " + this.props.idproduto;
		}else{
			let sets = [];
			for(let i = 0; i < columns.length; i++){
				sets.push("$" + (i + 1));
			}
			query = "INSERT INTO produto (" + columns.join(", ") + ") VALUES (" + sets.join(", ") + ")";
		}

		this.props.Pool.query(query, values, (err, res) => {
			if(err){
				defaultMessageBoxError(err.message);
				return false;
			}
			this.setState({
				show: false
			});
			window.FastMessage.show("Produto gravado com sucesso.");
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

	onChangeCategoria(event){
		this.onChangeInput(event, () => {
			this.sincronizarTributacao();
		});
	}

	onChangeInput(event, callback){
		let element = event.target;
		let id = element.id.replace("modalproduto-", "");
		let value = element.value;
		if(element.type === "checkbox"){
			value = (element.checked ? "S" : "N");
		}

		this.setState({
			["input_" + id]: value
	    }, callback);
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
			"SELECT ncm.codigoncm, categoria.origem,",
			"  categoria.cfop, categoria.csosn, categoria.aliqicms, ",
			"  categoria.cstpis, categoria.aliqpis, categoria.cstcofins, ",
			"  categoria.aliqcofins, categoria.codcontribsocial, categoria.cest",
			"FROM categoria",
			"LEFT JOIN ncm USING (idncm)",
			"WHERE categoria.idcategoria = $1"
		].join(" ");

		this.props.Pool.query(query, [this.state.input_idcategoria], (err, res) => {
			if(err){
				defaultMessageBoxError(err.message);
				return false;
			}
			if(res.rows.length === 0){
				window.MessageBox.show({
					title: "Categoria não encontrada",
					text: "A categoria informada no produto não pôde ser encontrada."
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
				<div className={this.state.showDiv !== "principal" ? "d-none" : ""}>
					<Row>
						<FormGroup type="text" id="modalproduto-descricao" className="col-8" label="Descrição" value={this.state.input_descricao} onChange={this.onChangeInput} />
						<FormGroup type="text" id="modalproduto-dthrcriacao" className="col-4" label="Criado em" readOnly={true} value={this.state.input_dthrcriacao} onChange={this.onChangeInput} disabled={true} />
						<FormGroup type="select" id="modalproduto-idcategoria" className="col-5" label="Categoria" dbtable="categoria" dbcolumn="descricao" Pool={this.props.Pool} value={this.state.input_idcategoria} onChange={this.onChangeCategoria} />
						<FormGroup type="text" id="modalproduto-codigoean" className="col-4" label="Código EAN" value={this.state.input_codigoean} onChange={this.onChangeInput} />
						<FormGroup type="select" id="modalproduto-balanca" className="col-3" label="Pesar na balança" options={{"S": "Sim", "N": "Não"}} value={this.state.input_balanca} onChange={this.onChangeInput} />
						<FormGroup type="select" id="modalproduto-precovariavel" className="col-3" label="Preço variável" options={{"S": "Sim", "N": "Não"}} value={this.state.input_precovariavel} onChange={this.onChangeInput} />
						<FormGroup type="text" id="modalproduto-preco" className="col-3" inputClassName="text-center" label="Preço de venda" InformarValor={{money: true, decimal: 2}} value={this.state.input_preco} onChange={this.onChangeInput} disabled={this.state.input_precovariavel === "S"} />
						<FormGroup type="select" id="modalproduto-status" className="col-3" label="Status" options={{"A": "Ativo", "I": "Inativo"}} value={this.state.input_status} onChange={this.onChangeInput} />
						<Col size="3" labelMargin={true}>
							<Button text="Tributações..." icon="file-text" color="blue" block={true} onClick={() => {this.changeDiv("tributacao")}} />
						</Col>
					</Row>
					<Hr className="mt-0" />
					<Row>
						<Col size="6">
							<Button text="Excluír" icon="bin" color="red" onClick={this.excluir} className={this.props.idproduto ? "" : "d-none"} />
						</Col>
						<Col size="6" className="text-right">
							<Button text="Cancelar" icon="undo" color="red" onClick={this.cancelar} />
							<Button text="Gravar produto" icon="thumbs-up" color="green" className="ml-2" onClick={this.gravar} />
						</Col>
					</Row>
				</div>
				<div className={this.state.showDiv !== "tributacao" ? "d-none" : ""}>
					<Row>
						<Col size="12">
							<FormControl type="checkbox" id="modalproduto-sinctributacao" label="Usar as mesmas tributações da categoria" className="col-12" value={this.state.input_sinctributacao} onChange={this.onChangeSincTributacao} />
						</Col>
						<FormGroup type="text" id="modalproduto-codigoncm" label="NCM do produto" className="col-3" inputClassName="text-center" InformarValor={{mask: "9999.99.99"}} value={this.state.input_codigoncm} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
						<FormGroup type="select" id="modalproduto-origem" className="col-6" label="Origem do produto" options={origemOptions} value={this.state.input_origem} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
						<FormGroup type="text" id="modalproduto-cfop" label="CFOP" className="col-3" inputClassName="text-center" InformarValor={{mask: "9.999"}} value={this.state.input_cfop} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
						<FormGroup type="select" id="modalproduto-csosn" className="col-3" inputClassName="text-center" label="CSOSN" options={{"102": "102", "300": "300", "400": "400", "500": "500"}} value={this.state.input_csosn} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
						<FormGroup type="text" id="modalproduto-aliqicms" label="Alíquota de ICMS" className="col-3" inputClassName="text-center" InformarValor={{decimal: 2}} value={this.state.input_aliqicms} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
						<FormGroup type="text" id="modalproduto-cstpis" label="CST do PIS" className="col-3" inputClassName="text-center" InformarValor={{mask: "99"}} value={this.state.input_cstpis} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
						<FormGroup type="text" id="modalproduto-aliqpis" label="Alíquota de PIS" className="col-3" inputClassName="text-center" InformarValor={{decimal: 2}} value={this.state.input_aliqpis} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
						<FormGroup type="text" id="modalproduto-cstcofins" label="CST do Cofins" className="col-3" inputClassName="text-center" InformarValor={{mask: "99"}} value={this.state.input_cstcofins} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
						<FormGroup type="text" id="modalproduto-aliqcofins" label="Alíquota de Cofins" className="col-3" inputClassName="text-center" InformarValor={{decimal: 2}} value={this.state.input_aliqcofins} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
						<FormGroup type="text" id="modalproduto-codcontribsocial" label="Contribuição social" className="col-3" inputClassName="text-center" InformarValor={{mask: "99"}} value={this.state.input_codcontribsocial} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
						<FormGroup type="text" id="modalproduto-cest" label="CEST" className="col-3" inputClassName="text-center" InformarValor={{mask: "99.999.99"}} value={this.state.input_cest} onChange={this.onChangeInput} disabled={this.state.input_sinctributacao === "S"} />
						<Col size="12" className="text-right">
							<Button text="Voltar para o produto..." icon="file-text" color="blue" onClick={() => {this.changeDiv("principal")}} />
						</Col>
					</Row>
				</div>
			</Modal>
		);
	}
}
