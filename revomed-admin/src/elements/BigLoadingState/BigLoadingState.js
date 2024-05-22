// styles
import './BigLoadingState.scss';

let BigLoadingState = (props) => {
	/*
	props.text
	*/
	return (
		<div className="BigLoadingState w-100 h-100 d-flex justify-content-center align-items-center text-center flex-wrap">
			<div className="BigLoadingState-loader"></div>
			<span className="d-block w-100 mt-3">{props.text}</span>
		</div>
	);
}

export default BigLoadingState;