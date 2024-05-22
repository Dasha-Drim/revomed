import './TimeLine.scss';

let TimeLine = (props) => {
	/*
	props.timeline - object
	props.heading - heading
	*/
	
	return (
		<div className="TimeLine p-5">
			<h2>{props.heading}</h2>
			{props.timeline.map((item, key) => 
				<div key={key} className={`TimeLine__item ${key ? "mt-3" : ""}`}>
					<h5 className="mb-1">{item.name}</h5>
					<span>{item.start} — {item.end}</span>
				</div>
			)}
		</div>
	);
}

export default TimeLine;