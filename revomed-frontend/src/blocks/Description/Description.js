// components
import EmptyState from "../../elements/EmptyState/EmptyState";

// styles
import './Description.scss';

let Description = (props) => {
	/*
	props.description
	props.title
	*/
	
	return (
		<div className="Description p-5">
			<h2>{props.title}</h2>
			{props.description ? <p>{props.description}</p> : <EmptyState text="Описание ещё не заполнено" />}
		</div>
	);
}

export default Description;