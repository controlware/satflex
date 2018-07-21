import React from "react";
import $ from "jquery";

import {Pool} from "../def/postgresql.js";

import Button from "../com/Button.js";
import Col from "../com/Col.js";
import Content from "../com/Content.js";
import FormGroup from "../com/FormGroup.js";
import Row from "../com/Row.js";
import SubTitle from "../com/SubTitle.js";
import Title from "../com/Title.js";

import Printer from "../com/Printer.js";

import {currentDate, valorParametro} from "../def/function.js";

export default class Fechamento extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			tipo: null,
			dtinicial: null,
			dtfinal: null,
			ativarFechamentoRelatorio: false,
			ativarFechamentoResumo: false
		};

		this.gerar = this.gerar.bind(this);
		this.imprimir = this.imprimir.bind(this);

		this.Pool = new Pool();
		this.Printer = new Printer(this.Pool);

		// Tipo de documentos que deverao ser contabilizadas
		let arrOperacao = ["CU"];
		for(let i in arrOperacao){
			arrOperacao[i] = "'" + arrOperacao[i] + "'";
		}
		this.operacaoQuery = "(" + arrOperacao.join(", ") + ")";
	}

	async gerar(){
		if(!$("#tipo").val()){
			window.MessageBox.show({
				text: "Por favor, informe o tipo de fechamento antes de prosseguir."
			});
			return false;
		}
		if(!$("#dtinicial").val()){
			window.MessageBox.show({
				text: "Por favor, informe a data inicial do fechamento antes de prosseguir."
			});
			return false;
		}
		if(!$("#dtfinal").val()){
			window.MessageBox.show({
				text: "Por favor, informe a data final do fechamento antes de prosseguir."
			});
			return false;
		}

		await this.prepararImpressao();

		this.setState({
			tipo: $("#tipo").val(),
			dtinicial: $("#dtinicial").val(),
			dtfinal: $("#dtfinal").val(),
			ativarFechamentoRelatorio: false,
			ativarFechamentoResumo: false
		}, () => {
			this.setState({
				ativarFechamentoRelatorio: true
			}, () => {
				this.setState({
					ativarFechamentoResumo: true
				});
			});
		});
	}

	async imprimir(){
		await this.Printer.alimentar(3);
		await this.Printer.guilhotina();
		await this.Printer.imprimir();
		window.FastMessage.show("Fechamento impresso com sucesso!");
	}

	async prepararImpressao(){
		await this.Printer.reiniciar();

		// Formata as datas
		let dtinicial = $("#dtinicial").val().split("-").reverse().join("/");
		let dtfinal = $("#dtfinal").val().split("-").reverse().join("/");

		// Cabecalho
		await this.Printer.texto(await valorParametro(this.Pool, "EMITENTE", "NOMEFANTASIA"), "center", true);
		await this.Printer.texto("FECHAMENTO: " + dtinicial + " a " + dtfinal, "center", true);
		await this.Printer.alimentar();
	}

	render(){
		return (
			<Content className="Fechamento">
				<Title>Fechamento</Title>
				<Row>
					<Col size="6" offset="3">
						<Row>
							<FormGroup type="select" id="tipo" label="Fechamento por" className="col-12" options={{"categoria": "Categoria", "formapagamento": "Forma de pagamento", "produto": "Produto"}} defaultValue="categoria" />
							<FormGroup type="date" id="dtinicial" label="Data inicial" className="col-6" defaultValue={currentDate()} />
							<FormGroup type="date" id="dtfinal" label="Data final" className="col-6" defaultValue={currentDate()} />
						</Row>
						<Row>
							<Col size="6" className="pr-0">
								<Button text="Gerar" block={true} color="green" icon="file-play" onClick={this.gerar} />
							</Col>
							<Col size="6" className="pl-0">
								<Button text="Imprimir" block={true} color="blue" icon="printer" onClick={this.imprimir} />
							</Col>
						</Row>
					</Col>
				</Row>
				<FechamentoRelatorio Pool={this.Pool} Printer={this.Printer} tipo={this.state.tipo} dtinicial={this.state.dtinicial} dtfinal={this.state.dtfinal} operacaoQuery={this.operacaoQuery} ativar={this.state.ativarFechamentoRelatorio} />
				<FechamentoResumo Pool={this.Pool} Printer={this.Printer} dtinicial={this.state.dtinicial} dtfinal={this.state.dtfinal} operacaoQuery={this.operacaoQuery} ativar={this.state.ativarFechamentoResumo} />
			</Content>
		)
	}
}

class FechamentoRelatorio extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			dados: []
		};

		this.tipoDescritivo = this.tipoDescritivo.bind(this);
	}

	async carregarDados(props){
		props = (props === undefined ? this.props : props);

		// Verifica se deve executar a instrucao
		if(!props.ativar){
			return;
		}

		// Monta a query de acordo com o tipo de fechamento
		let query = null;
		switch(props.tipo){
			case "categoria":
				query = [
					"SELECT categoria.descricao,",
					"  SUM(documentoproduto.quantidade) AS quantidade,",
					"  SUM(documentoproduto.totalproduto) AS total",
					"FROM documentoproduto",
					"INNER JOIN documento USING (iddocumento)",
					"INNER JOIN produto USING (idproduto)",
					"INNER JOIN categoria USING (idcategoria)",
					"WHERE documento.dthrcriacao::DATE BETWEEN $1 AND $2",
					"  AND documento.status = 'A'",
					"  AND documento.operacao IN " + props.operacaoQuery,
					"GROUP BY 1",
					"ORDER BY 3 DESC"
				].join(" ");
				break;
			case "formapagamento":
				query = [
					"SELECT formapagamento.descricao,",
					"  COUNT(documentopagamento.iddocumentopagamento) AS quantidade,",
					"  SUM(documentopagamento.totalpagamento) AS total",
					"FROM documentopagamento",
					"INNER JOIN documento USING (iddocumento)",
					"INNER JOIN formapagamento USING (idformapagamento)",
					"WHERE documento.dthrcriacao::DATE BETWEEN $1 AND $2",
					"  AND documento.status = 'A'",
					"  AND documento.operacao IN " + props.operacaoQuery,
					"GROUP BY 1",
					"ORDER BY 3 DESC"
				].join(" ");
				break;
			case "produto":
				query = [
					"SELECT produto.descricao,",
					"  SUM(documentoproduto.quantidade) AS quantidade,",
					"  SUM(documentoproduto.totalproduto) AS total",
					"FROM documentoproduto",
					"INNER JOIN documento USING (iddocumento)",
					"INNER JOIN produto USING (idproduto)",
					"WHERE documento.dthrcriacao::DATE BETWEEN $1 AND $2",
					"  AND documento.status = 'A'",
					"  AND documento.operacao IN " + props.operacaoQuery,
					"GROUP BY 1",
					"ORDER BY 3 DESC"
				].join(" ");
				break;
			default:
				break;
		}

		// Executa comando SQL
		let res = await props.Pool.query(query, [props.dtinicial, props.dtfinal]);

		// Determina o tamanho de cada coluna
		let colunas = this.props.Printer.colunas;
		let colQuantidade = 6;
		let colTotal = 10;
		let colDescricao = colunas - colQuantidade - colTotal;

		// Cria o cabecalho da grade na impressao
		let texto = this.tipoDescritivo().substr(0, colDescricao).rpad(colDescricao, " ");
		texto += "Qtde".substr(0, colQuantidade).cpad(colQuantidade, " ");
		texto += "Total".substr(0, colTotal).lpad(colTotal, " ");
		await this.props.Printer.texto(texto, "left", true);

		// Alimenta classe da impressora
		for(let i in res.rows){
			let row = res.rows[i];
			let descricao = row.descricao.removeSpecial();
			let quantidade = row.quantidade.format(0, ",", ".");
			let total = row.total.format(2, ",", ".");

			let texto = descricao.substr(0, colDescricao).rpad(colDescricao, " ");
			texto += quantidade.substr(0, colQuantidade).cpad(colQuantidade, " ");
			texto += total.substr(0, colTotal).lpad(colTotal, " ");
			await this.props.Printer.texto(texto);
		}
		await this.props.Printer.alimentar(2);

		// Atualiza o State com os dados
		this.setState({
			dados: res.rows
		});
	}

	componentWillUpdate(nextProps){
		if(nextProps !== this.props){
			this.carregarDados(nextProps);
		}
	}

	tipoDescritivo(){
		switch(this.props.tipo){
			case "categoria":
				return "Categoria";
			case "formapagamento":
				return "Forma de pagamento";
			case "produto":
				return "Produto";
			default:
				return this.props.tipo;
		}
	}

	render(){
		if(!this.props.ativar || this.props.tipo === null){
			return null;
		}

		let t_quantidade = 0;
		let t_total = 0;

		return (
			<Row className="mt-5">
				<Col size="8" offset="2">
					<table className="table table-striped">
						<thead>
							<tr>
								<th>{this.tipoDescritivo()}</th>
								<th className="text-center">Quantidade</th>
								<th className="text-right">Total</th>
							</tr>
						</thead>
						<tbody>
							{this.state.dados.map((e, i) => {
								t_quantidade += parseFloat(e.quantidade);
								t_total += parseFloat(e.total);

								return (
									<tr key={i}>
										<td>{e.descricao}</td>
										<td className="text-center">{e.quantidade.format(0, ",", ".")}</td>
										<td className="text-right">{"R$ " + e.total.format(2, ",", ".")}</td>
									</tr>
								)
							})}
						</tbody>
						<tfoot>
							<tr>
								<th></th>
								<th className="text-center">{t_quantidade.format(0, ",", ".")}</th>
								<th className="text-right">{"R$ " + t_total.format(2, ",", ".")}</th>
							</tr>
						</tfoot>
					</table>
				</Col>
			</Row>
		);
	}
}

class FechamentoResumo extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			totalbruto: 0,
			totalcancelado: 0,
			qtdecancelado: 0,
			totalativo: 0,
			qtdeativo: 0,
			totalorcamento: 0
		};

		this.carregarDados = this.carregarDados.bind(this);
	}

	async carregarDados(props){
		props = (props === undefined ? this.props : props);

		// Verifica se deve executar a instrucao
		if(!props.ativar){
			return;
		}

		let query = [
			"SELECT COALESCE((SELECT SUM(totaldocumento) FROM documento WHERE dthrcriacao::DATE BETWEEN $1 AND $2 AND operacao IN (" + props.operacaoQuery + ")), 0) AS totalbruto,",
			"  COALESCE((SELECT SUM(totaldocumento) FROM documento WHERE dthrcriacao::DATE BETWEEN $1 AND $2 AND status = 'C' AND operacao IN (" + props.operacaoQuery + ")), 0) AS totalcancelado,",
			"  COALESCE((SELECT COUNT(iddocumento) FROM documento WHERE dthrcriacao::DATE BETWEEN $1 AND $2 AND status = 'C' AND operacao IN (" + props.operacaoQuery + ")), 0) AS qtdecancelado,",
			"  COALESCE((SELECT SUM(totaldocumento) FROM documento WHERE dthrcriacao::DATE BETWEEN $1 AND $2 AND status = 'A' AND operacao IN (" + props.operacaoQuery + ")), 0) AS totalativo,",
			"  COALESCE((SELECT COUNT(iddocumento) FROM documento WHERE dthrcriacao::DATE BETWEEN $1 AND $2 AND status = 'A' AND operacao IN (" + props.operacaoQuery + ")), 0) AS qtdeativo,",
			"  COALESCE((SELECT SUM(totaldocumento) FROM documento WHERE dthrcriacao::DATE BETWEEN $1 AND $2 AND status = 'A' AND operacao IN ('OR')), 0) AS totalorcamento",
		].join(" ");

		// Executa comando SQL
		let res = await props.Pool.query(query, [props.dtinicial, props.dtfinal]);
		let row = res.rows[0];

		// Monta impressao do resumo
		let colResumo2 = 15;
		let colResumo1 = this.props.Printer.colunas - colResumo2;
		await this.props.Printer.texto("RESUMO", "center", true);
		await this.props.Printer.texto("Total bruto das vendas".rpad(colResumo1, " ") + row.totalbruto.format(2, ",", ".").lpad(colResumo2, " "));
		await this.props.Printer.texto("Total de vendas canceladas".rpad(colResumo1, " ") + row.totalcancelado.format(2, ",", ".").lpad(colResumo2, " "));
		await this.props.Printer.texto("Quantidade de vendas canceladas".rpad(colResumo1, " ") + row.qtdecancelado.format(0, ",", ".").lpad(colResumo2, " "));
		await this.props.Printer.texto("Total liquido das vendas".rpad(colResumo1, " ") + row.totalativo.format(2, ",", ".").lpad(colResumo2, " "));
		await this.props.Printer.texto("Quantidade de vendas".rpad(colResumo1, " ") + row.qtdeativo.format(0, ",", ".").lpad(colResumo2, " "));
		await this.props.Printer.texto("Total liquido das vendas".rpad(colResumo1, " ") + (row.totalativo / row.qtdeativo).format(2, ",", ".").lpad(colResumo2, " "));
		await this.props.Printer.texto("Total bruto dos orcamentos".rpad(colResumo1, " ") + row.totalorcamento.format(2, ",", ".").lpad(colResumo2, " "));
		await this.props.Printer.alimentar(2);

		// Atualiza o State com o dados
		this.setState({
			totalbruto: row.totalbruto,
			totalcancelado: row.totalcancelado,
			qtdecancelado: row.qtdecancelado,
			totalativo: row.totalativo,
			qtdeativo: row.qtdeativo,
			totalorcamento: row.totalorcamento
		});
	}

	componentWillUpdate(nextProps){
		if(nextProps !== this.props){
			this.carregarDados(nextProps);
		}
	}

	render(){
		if(!this.props.ativar || this.props.dtinicial === null || this.props.dtfinal === null){
			return null;
		}

		return (
			<div className="mb-5">
				<SubTitle text="Resumo" />
				<Row>
					<Col size="8" offset="2">
						<table className="table table-striped">
							<tbody>
								<tr>
									<td>Total bruto das vendas</td>
									<td className="text-right">{"R$ " + this.state.totalbruto.format(2, ",", ".")}</td>
								</tr>
								<tr>
									<td>Total de vendas canceladas</td>
									<td className="text-right">{"R$ " + this.state.totalcancelado.format(2, ",", ".")}</td>
								</tr>
								<tr>
									<td>Quantidade de vendas canceladas</td>
									<td className="text-right">{this.state.qtdecancelado}</td>
								</tr>
								<tr>
									<td>Total liquido de vendas</td>
									<td className="text-right">{"R$ " + this.state.totalativo.format(2, ",", ".")}</td>
								</tr>
								<tr>
									<td>Quantidade de vendas</td>
									<td className="text-right">{this.state.qtdeativo}</td>
								</tr>
								<tr>
									<td>Ticket médio das vendas</td>
									<td className="text-right">{"R$ " + (this.state.totalativo / this.state.qtdeativo).format(2, ",", ".")}</td>
								</tr>
								<tr>
									<td>Total dos orçamentos</td>
									<td className="text-right">{"R$ " + this.state.totalorcamento.format(2, ",", ".")}</td>
								</tr>
							</tbody>
						</table>
					</Col>
				</Row>
			</div>
		);
	}
}
