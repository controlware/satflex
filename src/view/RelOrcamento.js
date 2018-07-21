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

export default class RelOrcamento extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			dtinicial: null,
			dtfinal: null
		};

		this.gerar = this.gerar.bind(this);
		this.imprimir = this.imprimir.bind(this);

		this.Pool = new Pool();
		this.Printer = new Printer(this.Pool);
	}

	async gerar(){
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
			dtinicial: $("#dtinicial").val(),
			dtfinal: $("#dtfinal").val()
		});
	}

	async imprimir(){
		await this.Printer.alimentar(3);
		await this.Printer.guilhotina();
		await this.Printer.imprimir();
		window.FastMessage.show("Relatório impresso com sucesso!");
	}

	async prepararImpressao(){
		await this.Printer.reiniciar();

		// Formata as datas
		let dtinicial = $("#dtinicial").val().split("-").reverse().join("/");
		let dtfinal = $("#dtfinal").val().split("-").reverse().join("/");

		// Cabecalho
		await this.Printer.texto(await valorParametro(this.Pool, "EMITENTE", "NOMEFANTASIA"), "center", true);
		await this.Printer.texto("ORÇAMENTOS: " + (dtinicial === dtfinal ? dtinicial : dtinicial + " à " + dtfinal), "center", true);
		await this.Printer.alimentar();
	}

	render(){
		return (
			<Content className="RelOrcamento">
				<Title>Relatório de Orçamento</Title>
				<Row>
					<Col size="6" offset="3">
						<Row>
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
				<RelOrcamentoRelatorio Pool={this.Pool} Printer={this.Printer} dtinicial={this.state.dtinicial} dtfinal={this.state.dtfinal} />
			</Content>
		)
	}
}

class RelOrcamentoRelatorio extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			dados: []
		};
	}

	async carregarDados(props){
		props = (props === undefined ? this.props : props);

		// Monta a query
		let query = [
			"SELECT iddocumento, totalquantidade, totaldocumento, nomeorcamento,",
			"  dthrcriacao::DATE as dtcriacao, dthrcriacao::TIME as hrcriacao",
			"FROM documento",
			"WHERE operacao = $1",
			"  AND dthrcriacao::DATE BETWEEN $2 AND $3",
			"ORDER BY dthrcriacao"
		].join(" ");

		// Executa comando SQL
		let res = await props.Pool.query(query, ["OR", props.dtinicial, props.dtfinal]);

		// Determina o tamanho de cada coluna
		let colunas = this.props.Printer.colunas;
		let colIdDocumento = 7;
		let colTotalQuantidade = 6;
		let colTotalDocumento = 10;
		let colNomeOrcamento = colunas - colIdDocumento - colTotalQuantidade - colTotalDocumento;

		// Cria o cabecalho da grade na impressao
		let texto = "Número".substr(0, colIdDocumento).rpad(colIdDocumento, " ");
		texto += "Cliente".substr(0, colNomeOrcamento).cpad(colNomeOrcamento, " ");
		texto += "Qtde".substr(0, colTotalQuantidade).cpad(colTotalQuantidade, " ");
		texto += "Total".substr(0, colTotalDocumento).lpad(colTotalDocumento, " ");
		await this.props.Printer.texto(texto, "left", true);

		// Alimenta classe da impressora
		let t_totalquantidade = 0;
		let t_totaldocumento = 0;
		for(let i in res.rows){
			let row = res.rows[i];

			let iddocumento = row.iddocumento;
			let nomeorcamento = row.nomeorcamento;
			let totalquantidade = row.totalquantidade;
			let totaldocumento = row.totaldocumento.format(2, ",", ".");

			// Calcula as casas decimais para a quantidade
			let decimal = String(totalquantidade).split(".")[1];
			if(decimal === undefined || decimal.length === 0 || parseInt(decimal) === 0){
				totalquantidade = totalquantidade.format(0, ",", ".");
			}else{
				totalquantidade = totalquantidade.format(3, ",", ".");
			}

			texto = iddocumento.substr(0, colIdDocumento).rpad(colIdDocumento, " ");
			texto += nomeorcamento.substr(0, colNomeOrcamento).rpad(colNomeOrcamento, " ");
			texto += totalquantidade.substr(0, colTotalQuantidade).cpad(colTotalQuantidade, " ");
			texto += totaldocumento.substr(0, colTotalDocumento).lpad(colTotalDocumento, " ");
			await this.props.Printer.texto(texto);

			t_totalquantidade += row.totalquantidade;
			t_totaldocumento += row.totaldocumento;
		}

		// Calcula as casas decimais para a quantidade
		let decimal = String(t_totalquantidade).split(".")[1];
		if(decimal === undefined || decimal.length === 0 || parseInt(decimal) === 0){
			t_totalquantidade = t_totalquantidade.format(0, ",", ".");
		}else{
			t_totalquantidade = t_totalquantidade.format(3, ",", ".");
		}

		// Totalizacao
		texto = "Total".substr(0, (colIdDocumento + colNomeOrcamento)).rpad((colIdDocumento + colNomeOrcamento), " ");
		texto += t_totalquantidade.substr(0, colTotalQuantidade).cpad(colTotalQuantidade, " ");
		texto += t_totaldocumento.substr(0, colTotalDocumento).lpad(colTotalDocumento, " ");
		await this.props.Printer.texto(texto, "left", true);
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
