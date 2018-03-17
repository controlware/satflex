import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import "floatthead";

import "../css/DataGrid.css";

export default class DataGrid extends React.Component {
	constructor(props){
		super(props);

		this.calcBlankSpace = this.calcBlankSpace.bind(this);
		this.elementScroll = this.elementScroll.bind(this);
		this.onClickHeadCell = this.onClickHeadCell.bind(this);
		this.onScroll = this.onScroll.bind(this);
		this.updateBlankSpace = this.updateBlankSpace.bind(this);
		this.updateReceivedProps = this.updateReceivedProps.bind(this);

		var nextProps = this.updateReceivedProps(props.header, props.data);

		this.state = {
			data: nextProps.data,
			header: nextProps.header,
			limit: 100,
			offset: 0,
			blankSpace: {
				bottom: 0,
				top: 0
			}
		};

		this.scrollActive = true;
		this.longScroll = false;
	}

	componentDidMount(){
		this.elementScroll().addEventListener("scroll", this.onScroll);
		this.element = ReactDOM.findDOMNode(this);
	}

	componentWillUnmount(){
		this.elementScroll().removeEventListener("scroll", this.onScroll);
	}

	componentDidUpdate(){
		if(this.referenceElement && !this.longScroll){
			var eScroll = this.elementScroll();
			var eRefTop = $(this.referenceElement.element).position().top;
			this.scrollActive = false;
			$(eScroll).scrollTop($(eScroll).scrollTop() - (eRefTop - this.referenceElement.top));
			this.scrollActive = true;
		}

		if(this.firstUpdateBlankSpace !== true){
			this.firstUpdateBlankSpace = true;
			this.updateBlankSpace();
		}

		$(this.element).children("table").floatThead();
		$(this.element).children("table").floatThead("reflow");
	}

	componentWillUpdate(){
		var table = $(this.element).children("table"); // Corpo da grade
		var tr = $(table).children("tbody").children(); // Lista com todas as linhas da grade, inclusive o BlankSpace
		var tr50 = $(tr).eq(Math.floor(this.state.limit * 0.5));
		if($(tr50).length > 0){
			this.referenceElement = {
				element: tr50,
				top: $(tr50).position().top
			};
		}
	}

	componentWillReceiveProps(nextProps){
		// Trata os dados recebidos
		nextProps = this.updateReceivedProps(nextProps.header, nextProps.data);

		// Atualiza os dados
		this.setState({
			header: nextProps.header,
			data: nextProps.data
		});

		// Atualiza o tamanho dos BlankSpaces
		this.firstUpdateBlankSpace = false;
	}

	elementIsVisibleByScroll(elem, parent){
		if(!$(this.element).is(":visible")){
			return false;
		}

		parent = (parent === undefined ? window : parent);

		var parentTop = $(parent).scrollTop();
		var parentBottom = parentTop + $(parent).height();

		var elemTop = (parent === window ? $(elem).offset().top : $(elem).position().top);
		var elemBottom = elemTop + $(elem).height();

		if(elemTop < parentTop && elemBottom > parentTop){
			return true;
		}else if(elemTop > parentTop && elemBottom < parentBottom){
			return true;
		}else if(elemTop < parentBottom && elemBottom > parentBottom){
			return true;
		}else{
			return false;
		}
	}

	elementScroll(){
		if(this.props.height === undefined){
			return window;
		}else{
			return ReactDOM.findDOMNode(this);
		}
	}

	onClickHeadCell(e){
		// Captura a chave do elemento clicado
		var key = $(e.target).attr("cellkey");

		// Atualiza a ordenacao no grid
		var cell = null;
		var hIndex = null;
		var hOrder = null;
		var header = this.state.header;
		for(var i in header){
			cell = header[i];
			if(cell.key === key){
				hIndex = i;
				hOrder = (cell.order === 1 ? -1 : 1);
				cell.order = hOrder;
			}else{
				cell.order = 0;
			}
			header[i] = cell;
		}

		// Atualiza a ordem dos dados
		var data = this.state.data;
		data.sort(function(a, b){
			if(a[hIndex]["text"] < b[hIndex]["text"])
				return (hOrder === 1 ? -1 : 1);
			if(a[hIndex]["text"] > b[hIndex]["text"])
				return (hOrder === 1 ? 1 : -1);
			return 0;
		});

		// Atualiza o header no state
		this.setState({
			header: header,
			data: data
		});
	}

	onScroll(){
		if(!this.scrollActive){
			return true;
		}

		if(!$(this.element).is(":visible")){
			return true;
		}

		var eScroll = this.elementScroll(); // Elemento que esta controlando o Scroll (window, ou div principal da grade)
		if(this.currentScroll === undefined || Math.abs(this.currentScroll - $(eScroll).scrollTop()) > 50){
			this.currentScroll = $(eScroll).scrollTop();
		}else{
			return true;
		}

		var datagrid = this.element; // Elemento principal da grade (div)
		var table = $(datagrid).children("table"); // Tabela da grade
		var thead = $(table).children("thead"); // Header da grade
		var tr = $(table).children("tbody").children(); // Lista com todas as linhas da grade, inclusive o BlankSpace
		var bsFirst = $(tr).first(); // BlankSpace superior
		var bsLast = $(tr).last(); // BlankSpace inferior
		var trFirst = $(bsFirst).next(); // Primeira linha da grade, ignorando o BlankSpace
		var trLast = $(bsLast).prev(); // Ultima linha da grade, ignorando o BlankSpace
		var tr20 = $(tr).eq(Math.floor(this.state.limit * 0.2)); // Linha de posicao equivalente a 20% do total de linhas
		var tr80 = $(tr).eq(Math.floor(this.state.limit * 0.8)); // Linha de posicao equivalente a 80% do total de linhas

		var hTop = ($(thead).position().top - $(eScroll).scrollTop()) * -1;
		if(hTop < 0){
			hTop = 0;
		}

		var limit = this.state.limit;
		var offset = this.state.offset;
		var count = this.state.data.length;

		this.longScroll = false;

		if(offset > 0 && (this.elementIsVisibleByScroll(trFirst, eScroll) || this.elementIsVisibleByScroll(tr20, eScroll))){
			offset = offset - Math.floor(limit / 2);
			if(offset < 0){
				offset = 0;
			}
		}else if(offset + limit < count && (this.elementIsVisibleByScroll(trLast, eScroll) || this.elementIsVisibleByScroll(tr80, eScroll))){
			offset = offset + Math.floor(limit / 2);
		}else if((this.elementIsVisibleByScroll(bsFirst, eScroll) || this.elementIsVisibleByScroll(bsLast, eScroll)) && (!this.elementIsVisibleByScroll(trFirst, eScroll) && !this.elementIsVisibleByScroll(trLast, eScroll))){
			var currScroll = null;
			if(eScroll === window){
				currScroll = ($(eScroll).scrollTop() - $(datagrid).offset().top) / $(datagrid).height();
			}else{
				currScroll = $(eScroll).scrollTop() / $(table).height();
			}
			offset = Math.round(this.state.data.length * currScroll);
			this.longScroll = true;
		}

		if(offset > count - limit){
			offset = count - limit;
		}else if(offset < 0){
			offset = 0;
		}

		if(offset !== this.state.offset){
			var blankSpace = this.calcBlankSpace(offset);

			if(this.initialBlankSpace === undefined){
				this.initialBlankSpace = blankSpace;
				this.initialBlankSpace.height = blankSpace.top + blankSpace.bottom;
			}

			this.setState({
				offset: offset,
				blankSpace: blankSpace
			});
		}
	}

	calcBlankSpace(offset){
		offset = (offset === undefined ? this.state.offset : offset);

		var data = this.state.data;
		var limit = this.state.limit;

		var table = $(this.element).children(".table"); // Tabela da grade
		var tr = $(table).children("tbody").children(); // Lista com todas as linhas da grade, inclusive o BlankSpace
		var bsFirst = $(tr).first(); // BlankSpace superior
		var trFirst = $(bsFirst).next(); // Primeira linha da grade, ignorando o BlankSpace
		var trHeight = $(trFirst).height();

		var top = offset * trHeight;
		var bottom = (data.length - offset - limit) * trHeight;

		if(this.longScroll && this.initialBlankSpace !== undefined){
			var eScroll = this.elementScroll();

			var rowsHeight = $(tr).not(":first, :last").map(function(){
				return $(this).height();
			}).get().reduce(((a, b) => a + b), 0);

			top = $(eScroll).scrollTop() - (trHeight * 10);
			bottom = $(table).height() - rowsHeight - top;

			if(top > this.initialBlankSpace.height){
				top = this.initialBlankSpace.height;
			}
			if(bottom > this.initialBlankSpace.height){
				bottom = this.initialBlankSpace.height;
			}
		}

		if(top < 0){
			top = 0;
		}
		if(bottom < 0){
			bottom = 0;
		}

		return {
			top: top,
			bottom: bottom
		};
	}

	updateBlankSpace(){
		this.setState({
			blankSpace: this.calcBlankSpace()
		});
	}

	updateReceivedProps(header, data){
		header = (header === undefined ? this.state.header : header);
		data = (data === undefined ? this.state.data : data);

		// Declare variaveis multiuso
		var cell, i = null;

		// Trata os dados do cabecalho
		for(i in header){
			cell = header[i];

			if(typeof cell === "string"){
				cell = {
					"text": cell
				};
			}

			cell = $.extend({
				align: "left",
				key: i,
				order: 0,
				text: ""
			}, cell);

			header[i] = cell;
		}

		// Trata os dados principais da grade
		var key = 0;
		for(i in data){
			for(var j in data[i]){
				cell = data[i][j];

				if(typeof cell === "string"){
					cell = {
						"text": cell
					};
				}

				cell = $.extend({
					align: "left",
					key: key++,
					text: "",
					width: null
				}, cell);

				data[i][j] = cell;
			}
		}

		return {header: header, data: data};
	}

	render(){
		var data = this.state.data.slice(this.state.offset, (this.state.offset + this.state.limit));
		return (
			<div className="DataGrid" style={{height: this.props.height}}>
				<table className={"DataGridTable table table-striped table-hover " + this.props.className}>
					<DataGridHead header={this.state.header} onClickHeadCell={this.onClickHeadCell} />
					<DataGridBody data={data} blankSpace={this.state.blankSpace} />
				</table>
			</div>
		);
	}
}

class DataGridBody extends React.Component {
	render(){
		return (
			<tbody>
				<DataGridBlankSpace height={this.props.blankSpace.top} />
					{this.props.data.map(function(row, i){
						return <DataGridBodyRow row={row} key={i} />
					})}
				<DataGridBlankSpace height={this.props.blankSpace.bottom} />
			</tbody>
		)
	}
}

class DataGridBodyCell extends React.Component {
	render(){
		return (
			<td className={"text-" + this.props.cell.align} onClick={this.props.cell.onClick} style={{width: this.props.cell.width}}>{this.props.cell.text}</td>
		)
	}
}

class DataGridBodyRow extends React.Component {
	render(){
		return (
			<tr>
				{this.props.row.map(function(cell, i){
					return <DataGridBodyCell cell={cell} key={i} />
				})}
			</tr>
		)
	}
}

class DataGridHead extends React.Component {
	render(){
		return (
			<thead>
				<tr>
					{this.props.header.map((cell, i) => {
						return <DataGridHeadCell cell={cell} onClick={this.props.onClickHeadCell} key={i} />
					})}
				</tr>
			</thead>
		)
	}

}

class DataGridHeadCell extends React.Component {
	render(){
		return (
			<th className={"text-"+this.props.cell.align + " DataGridHeadCellOrder-"+this.props.cell.order} onClick={this.props.onClick} cellkey={this.props.cell.key}>
				{this.props.cell.text}
			</th>
		)
	}
}

class DataGridBlankSpace extends React.Component {
	render(){
		var height = (this.props.height === undefined ? 0 : this.props.height);

		return (
			<tr>
				<td style={{border: 0, height: height, padding: 0}}></td>
			</tr>
		)
	}
}
