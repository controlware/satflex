import React from "react";

export default class Content extends React.Component {

	render(){
		return (
			<div id="content" {...this.props}>
				{this.props.children}
			</div>
		)
	}

}
