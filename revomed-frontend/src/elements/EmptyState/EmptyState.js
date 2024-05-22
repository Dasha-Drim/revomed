// graphics
import mascot from './mascot.svg';

// styles
import './EmptyState.scss';

let EmptyState = (props) => {
	/*
	props.text
	*/
	
	return (
		<div className="EmptyState h-100 w-100 d-flex justify-content-center align-items-center text-center py-6">
			<div className="text-center">
				<img src={mascot} alt="" />
				<span className="d-block mt-3">{props.text}</span>
			</div>
		</div>
	);
}

export default EmptyState;