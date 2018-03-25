import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";

import "../css/Modal.css";

export default class Modal extends React.Component {

	componentDidMount(){
		this.element = ReactDOM.findDOMNode(this);

		$(this.element).on("show.bs.modal", this.props.beforeOpen);
		$(this.element).on("shown.bs.modal", this.props.afterOpen);
		$(this.element).on("hide.bs.modal", this.props.beforeClose);
		$(this.element).on("hidden.bs.modal", this.props.afterClose);

		$(this.element).on("show.bs.modal", () => {
			let zIndex = 1040 + (10 * $(".modal:visible").length);
			$(this.element).css("z-index", zIndex);
			setTimeout(() => {
				$(".modal-backdrop").not(".modal-stack").css("z-index", zIndex - 1).addClass("modal-stack");
			}, 0);
		});
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.show !== this.props.show){
			if(nextProps.show){
				$(this.element).modal("show");
			}else{
				$(this.element).modal("hide");
			}
		}
	}

	shouldComponentUpdate(nextProps){
		return (
			nextProps.size !== this.props.size ||
			nextProps.title !== this.props.title ||
			nextProps.children !== this.props.children
		);
	}

	render(){
		let size = (this.props.size ? this.props.size : "md");

		return (
			<div id={this.props.id} className="modal fade" data-backdrop="static">
				<div className={"modal-dialog modal-" + size}>
					<div className="modal-content">
						<div className="modal-header">
							{this.props.title}
						</div>
						<div className="modal-body">
							{this.props.children}
						</div>
					</div>
				</div>
			</div>
		);
	}
}
