import React from "react";

import {Pool} from "../def/postgresql.js";

import Button from "../com/Button.js";
import ButtonGroup from "../com/ButtonGroup.js";
import Center from "../com/Center.js";
import Content from "../com/Content.js";
import SubTitle from "../com/SubTitle.js";
import Title from "../com/Title.js";

import {defaultMessageBoxError} from "../def/function.js";

import "../css/Estatistica.css";

export default class Estatistica extends React.Component {

	constructor(props){
		super(props);

		this.carregarDados = this.carregarDados.bind(this);
		this.carregarDadosCategoria = this.carregarDadosCategoria.bind(this);
		this.carregarDadosFormaPagamento = this.carregarDadosFormaPagamento.bind(this);
		this.carregarDadosGeral = this.carregarDadosGeral.bind(this);
		this.carregarDadosProduto = this.carregarDadosProduto.bind(this);

		this.state = {
			tabela: null,
			dados: null
		};

		this.LineChart = require("react-chartjs").Line;

		this.Pool = new Pool();
	}

	async carregarDados(tabela){
		try{
			window.Loading.show();

			let dados = null;
			switch(tabela){
				case "categoria":
					dados = await this.carregarDadosCategoria();
					break;
				case "formapagamento":
					dados = await this.carregarDadosFormaPagamento();
					break;
				case "produto":
					dados = await this.carregarDadosProduto();
					break;
				default:
					dados = await this.carregarDadosGeral();
					break;
			}

			this.setState({
				tabela: tabela,
				dados: dados
			});
		}catch(err){
			defaultMessageBoxError(err);
		}finally{
			window.Loading.hide();
		}
	}

	async carregarDadosCategoria(){
		let queryDiario = [
			"SELECT categoria.descricao AS a,",
			"  v_vendaprodutodiario.dtvenda AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendaprodutodiario, produto",
			"LEFT JOIN categoria USING (idcategoria)",
			"WHERE (v_vendaprodutodiario.idproduto IS NULL OR v_vendaprodutodiario.idproduto = produto.idproduto)",
			"  AND v_vendaprodutodiario.dtvenda >= CURRENT_DATE - '30 days'::INTERVAL",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resDiario = await this.Pool.query(queryDiario);
		let dadosDiario = this.prepararDados(resDiario.rows, "D");

		let querySemanal = [
			"SELECT categoria.descricao AS a,",
			"  (EXTRACT(YEAR FROM v_vendaprodutodiario.dtvenda) || '-' || LPAD(EXTRACT(WEEK FROM v_vendaprodutodiario.dtvenda)::TEXT, 2, '0')) AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendaprodutodiario, produto",
			"LEFT JOIN categoria USING (idcategoria)",
			"WHERE (v_vendaprodutodiario.idproduto IS NULL OR v_vendaprodutodiario.idproduto = produto.idproduto)",
			"  AND v_vendaprodutodiario.dtvenda >= CURRENT_DATE - '6 months'::INTERVAL",
			"  AND EXTRACT(WEEK FROM v_vendaprodutodiario.dtvenda) != 0",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resSemanal = await this.Pool.query(querySemanal);
		let dadosSemanal = this.prepararDados(resSemanal.rows, "S");

		let queryMensal = [
			"SELECT categoria.descricao AS a,",
			"  (EXTRACT(YEAR FROM v_vendaprodutodiario.dtvenda) || '-' || LPAD(EXTRACT(MONTH FROM v_vendaprodutodiario.dtvenda)::TEXT, 2, '0')) AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendaprodutodiario, produto",
			"LEFT JOIN categoria USING (idcategoria)",
			"WHERE (v_vendaprodutodiario.idproduto IS NULL OR v_vendaprodutodiario.idproduto = produto.idproduto)",
			"  AND v_vendaprodutodiario.dtvenda >= CURRENT_DATE - '2 years'::INTERVAL",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resMensal = await this.Pool.query(queryMensal);
		let dadosMensal = this.prepararDados(resMensal.rows, "M");

		let queryAnual = [
			"SELECT categoria.descricao AS a,",
			"  (EXTRACT(YEAR FROM v_vendaprodutodiario.dtvenda)) AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendaprodutodiario, produto",
			"LEFT JOIN categoria USING (idcategoria)",
			"WHERE (v_vendaprodutodiario.idproduto IS NULL OR v_vendaprodutodiario.idproduto = produto.idproduto)",
			"  AND v_vendaprodutodiario.dtvenda >= CURRENT_DATE - '10 years'::INTERVAL",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resAnual = await this.Pool.query(queryAnual);
		let dadosAnual = this.prepararDados(resAnual.rows, "Y");

		return {
			diario: dadosDiario,
			semanal: dadosSemanal,
			mensal: dadosMensal,
			anual: dadosAnual
		};
	}

	async carregarDadosFormaPagamento(){
		let queryDiario = [
			"SELECT formapagamento.descricao AS a,",
			"  v_vendapagamentodiario.dtvenda AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendapagamentodiario, formapagamento",
			"WHERE (v_vendapagamentodiario.idformapagamento IS NULL OR v_vendapagamentodiario.idformapagamento = formapagamento.idformapagamento)",
			"  AND (formapagamento.status IS NULL OR formapagamento.status = 'A')",
			"  AND v_vendapagamentodiario.dtvenda >= CURRENT_DATE - '30 days'::INTERVAL",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resDiario = await this.Pool.query(queryDiario);
		let dadosDiario = this.prepararDados(resDiario.rows, "D");

		let querySemanal = [
			"SELECT formapagamento.descricao AS a,",
			"  (EXTRACT(YEAR FROM v_vendapagamentodiario.dtvenda) || '-' || LPAD(EXTRACT(WEEK FROM v_vendapagamentodiario.dtvenda)::TEXT, 2, '0')) AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendapagamentodiario, formapagamento",
			"WHERE (v_vendapagamentodiario.idformapagamento IS NULL OR v_vendapagamentodiario.idformapagamento = formapagamento.idformapagamento)",
			"  AND (formapagamento.status IS NULL OR formapagamento.status = 'A')",
			"  AND v_vendapagamentodiario.dtvenda >= CURRENT_DATE - '6 months'::INTERVAL",
			"  AND EXTRACT(WEEK FROM v_vendapagamentodiario.dtvenda) != 0",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resSemanal = await this.Pool.query(querySemanal);
		let dadosSemanal = this.prepararDados(resSemanal.rows, "S");

		let queryMensal = [
			"SELECT formapagamento.descricao AS a,",
			"  (EXTRACT(YEAR FROM v_vendapagamentodiario.dtvenda) || '-' || LPAD(EXTRACT(MONTH FROM v_vendapagamentodiario.dtvenda)::TEXT, 2, '0')) AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendapagamentodiario, formapagamento",
			"WHERE (v_vendapagamentodiario.idformapagamento IS NULL OR v_vendapagamentodiario.idformapagamento = formapagamento.idformapagamento)",
			"  AND (formapagamento.status IS NULL OR formapagamento.status = 'A')",
			"  AND v_vendapagamentodiario.dtvenda >= CURRENT_DATE - '2 years'::INTERVAL",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resMensal = await this.Pool.query(queryMensal);
		let dadosMensal = this.prepararDados(resMensal.rows, "M");

		let queryAnual = [
			"SELECT formapagamento.descricao AS a,",
			"  (EXTRACT(YEAR FROM v_vendapagamentodiario.dtvenda)) AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendapagamentodiario, formapagamento",
			"WHERE (v_vendapagamentodiario.idformapagamento IS NULL OR v_vendapagamentodiario.idformapagamento = formapagamento.idformapagamento)",
			"  AND (formapagamento.status IS NULL OR formapagamento.status = 'A')",
			"  AND v_vendapagamentodiario.dtvenda >= CURRENT_DATE - '10 years'::INTERVAL",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resAnual = await this.Pool.query(queryAnual);
		let dadosAnual = this.prepararDados(resAnual.rows, "Y");

		return {
			diario: dadosDiario,
			semanal: dadosSemanal,
			mensal: dadosMensal,
			anual: dadosAnual
		};
	}

	async carregarDadosGeral(){
		let queryDiario = [
			"SELECT 'Venda' AS a,",
			"  v_vendaprodutodiario.dtvenda AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendaprodutodiario",
			"WHERE v_vendaprodutodiario.dtvenda >= CURRENT_DATE - '30 days'::INTERVAL",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resDiario = await this.Pool.query(queryDiario);
		let dadosDiario = this.prepararDados(resDiario.rows, "D");

		let querySemanal = [
			"SELECT 'Venda' AS a,",
			"  (EXTRACT(YEAR FROM v_vendaprodutodiario.dtvenda) || '-' || LPAD(EXTRACT(WEEK FROM v_vendaprodutodiario.dtvenda)::TEXT, 2, '0')) AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendaprodutodiario",
			"WHERE v_vendaprodutodiario.dtvenda >= CURRENT_DATE - '6 months'::INTERVAL",
			"  AND EXTRACT(WEEK FROM v_vendaprodutodiario.dtvenda) != 0",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resSemanal = await this.Pool.query(querySemanal);
		let dadosSemanal = this.prepararDados(resSemanal.rows, "S");

		let queryMensal = [
			"SELECT 'Venda' AS a,",
			"  (EXTRACT(YEAR FROM v_vendaprodutodiario.dtvenda) || '-' || LPAD(EXTRACT(MONTH FROM v_vendaprodutodiario.dtvenda)::TEXT, 2, '0')) AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendaprodutodiario",
			"WHERE v_vendaprodutodiario.dtvenda >= CURRENT_DATE - '2 years'::INTERVAL",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resMensal = await this.Pool.query(queryMensal);
		let dadosMensal = this.prepararDados(resMensal.rows, "M");

		let queryAnual = [
			"SELECT 'Venda' AS a,",
			"  (EXTRACT(YEAR FROM v_vendaprodutodiario.dtvenda)) AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendaprodutodiario",
			"WHERE v_vendaprodutodiario.dtvenda >= CURRENT_DATE - '10 years'::INTERVAL",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resAnual = await this.Pool.query(queryAnual);
		let dadosAnual = this.prepararDados(resAnual.rows, "Y");

		return {
			diario: dadosDiario,
			semanal: dadosSemanal,
			mensal: dadosMensal,
			anual: dadosAnual
		};
	}

	async carregarDadosProduto(){
		let queryDiario = [
			"SELECT produto.descricao AS a,",
			"  v_vendaprodutodiario.dtvenda AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendaprodutodiario, produto",
			"WHERE (v_vendaprodutodiario.idproduto IS NULL OR v_vendaprodutodiario.idproduto = produto.idproduto)",
			"  AND v_vendaprodutodiario.dtvenda >= CURRENT_DATE - '30 days'::INTERVAL",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resDiario = await this.Pool.query(queryDiario);
		let dadosDiario = this.prepararDados(resDiario.rows, "D");

		let querySemanal = [
			"SELECT produto.descricao AS a,",
			"  (EXTRACT(YEAR FROM v_vendaprodutodiario.dtvenda) || '-' || LPAD(EXTRACT(WEEK FROM v_vendaprodutodiario.dtvenda)::TEXT, 2, '0')) AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendaprodutodiario, produto",
			"WHERE (v_vendaprodutodiario.idproduto IS NULL OR v_vendaprodutodiario.idproduto = produto.idproduto)",
			"  AND v_vendaprodutodiario.dtvenda >= CURRENT_DATE - '6 months'::INTERVAL",
			"  AND EXTRACT(WEEK FROM v_vendaprodutodiario.dtvenda) != 0",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resSemanal = await this.Pool.query(querySemanal);
		let dadosSemanal = this.prepararDados(resSemanal.rows, "S");

		let queryMensal = [
			"SELECT produto.descricao AS a,",
			"  (EXTRACT(YEAR FROM v_vendaprodutodiario.dtvenda) || '-' || LPAD(EXTRACT(MONTH FROM v_vendaprodutodiario.dtvenda)::TEXT, 2, '0')) AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendaprodutodiario, produto",
			"WHERE (v_vendaprodutodiario.idproduto IS NULL OR v_vendaprodutodiario.idproduto = produto.idproduto)",
			"  AND v_vendaprodutodiario.dtvenda >= CURRENT_DATE - '2 years'::INTERVAL",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resMensal = await this.Pool.query(queryMensal);
		let dadosMensal = this.prepararDados(resMensal.rows, "M");

		let queryAnual = [
			"SELECT produto.descricao AS a,",
			"  (EXTRACT(YEAR FROM v_vendaprodutodiario.dtvenda)) AS x,",
			"  SUM(COALESCE(valor, 0)) AS y",
			"FROM v_vendaprodutodiario, produto",
			"WHERE (v_vendaprodutodiario.idproduto IS NULL OR v_vendaprodutodiario.idproduto = produto.idproduto)",
			"  AND v_vendaprodutodiario.dtvenda >= CURRENT_DATE - '10 years'::INTERVAL",
			"GROUP BY a, x",
			"ORDER BY x, a"
		].join(" ");
		let resAnual = await this.Pool.query(queryAnual);
		let dadosAnual = this.prepararDados(resAnual.rows, "Y");

		return {
			diario: dadosDiario,
			semanal: dadosSemanal,
			mensal: dadosMensal,
			anual: dadosAnual
		};
	}

	componentDidMount(){
		this.carregarDados("categoria");
	}

	prepararDados(rows, tipoData){
		let groups = [];
		let labels = [];
		for(let i in rows){
			let row = rows[i];
			switch(tipoData){
				case "D": // Diario (recebe 'Y-m-d')
					row.x = String(row.x.getDate()).lpad(2, "0") + "/" + String(row.x.getMonth() + 1).lpad(2, "0") + "/" + (row.x.getFullYear());
					break;
				case "S": // Mensal (recebe 'Y-w')
					row.x = row.x.split("-").reverse().join("/");
					break;
				case "M": // Mensal (recebe 'Y-m')
					row.x = row.x.split("-").reverse().join("/");
					break;
				case "Y": // Anual (recebe 'Y')
					break;
				default:
					break;
			}
			rows[i].x = row.x;
			if(labels.indexOf(row.x) === -1){
				labels.push(row.x);
			}
			if(groups.indexOf(row.a) === -1){
				groups.push(row.a);
			}
		}

		let dataGroup = {};
		for(let label of labels){
			for(let group of groups){
				if(dataGroup[group] === undefined) dataGroup[group] = [];

				let found = false;
				for(let row of rows){
					if(row.a === group && row.x === label){
						dataGroup[group].push(row.y);
						found = true;
						break;
					}
				}
				if(!found) dataGroup[group].push(0);
			}
		}

		let datasets = [];
		for(let group in dataGroup){
			// Gera um RGB aleatorio caso seja do tipo Diario
			// O outros tipos de datas utilizam o mesmo gerado pelo Diario
			if(this.cor === undefined) this.cor = {};
			if(tipoData === "D") this.cor[group] = Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255);
			let rgb = this.cor[group];

			// Cria o dataset
			datasets.push({
				label: group,
				fillColor: "rgba("+rgb+",0.2)",
				strokeColor: "rgba("+rgb+",1)",
				pointColor: "rgba("+rgb+",1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba("+rgb+",1)",
				data: dataGroup[group]
			});
		}

		return {
			labels: labels,
			datasets: datasets
		};
	}

	render(){
		let options = {
			legend: {
				display: true
			}
		};

		let chartHeight = "300px";
		let chartWidth = "900px";

		let chartDiario = null;
		if(this.state.dados !== null){
			chartDiario = <this.LineChart data={this.state.dados.diario} options={options} height={chartHeight} width={chartWidth} redraw />
		}

		let chartSemanal = null;
		if(this.state.dados !== null){
			chartSemanal = <this.LineChart data={this.state.dados.semanal} options={options} height={chartHeight} width={chartWidth} redraw />
		}

		let chartMensal = null;
		if(this.state.dados !== null){
			chartMensal = <this.LineChart data={this.state.dados.mensal} options={options} height={chartHeight} width={chartWidth} redraw />
		}

		let chartAnual = null;
		if(this.state.dados !== null){
			chartAnual = <this.LineChart data={this.state.dados.anual} options={options} height={chartHeight} width={chartWidth} redraw />
		}

		return (
			<Content>
				<Title>Estatísticas</Title>
				<Center className="mb-5">
					<ButtonGroup>
						<Button text="Geral" color="green" size="lg" active={this.state.tabela === null} onClick={() => {this.carregarDados(null)}} />
						<Button text="Finalizadora" color="green" size="lg" active={this.state.tabela === "formapagamento"} onClick={() => {this.carregarDados("formapagamento")}} />
						<Button text="Categoria" color="green" size="lg" active={this.state.tabela === "categoria"} onClick={() => {this.carregarDados("categoria")}} />
						<Button text="Produto" color="green" size="lg" active={this.state.tabela === "produto"} onClick={() => {this.carregarDados("produto")}} />
					</ButtonGroup>
					<SubTitle model="2">Venda diária nos últimos 30 dias</SubTitle>
					{chartDiario}
					<SubTitle model="2">Venda semanal nos últimos 6 meses</SubTitle>
					{chartSemanal}
					<SubTitle model="2">Venda mensal nos últimos 2 anos</SubTitle>
					{chartMensal}
					<SubTitle model="2">Venda anual nos últimos 10 anos</SubTitle>
					{chartAnual}
				</Center>
			</Content>
		)
	}
}
