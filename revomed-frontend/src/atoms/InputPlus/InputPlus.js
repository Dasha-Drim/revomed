import { useState, useEffect } from "react";

// graphics
import plusIcon from './plusIcon.svg';

// styles
import './InputPlus.scss';

let InputPlus = (props) => {
	/*
	props.label - label
	props.name - input's name attribute
	props.validation - validation method
	props.errors - validation errors
	*/
	const [additionalInputs, setadditionalInputs] = useState([]);
	const [errors, setErrors] = useState(props.errors);

	// ADD INPUT
	let addAdditionalInput = (e) => {
		e.preventDefault();
		let additionalInputsArray = additionalInputs.slice(0);
		additionalInputsArray.push(additionalInputsArray[additionalInputsArray.length-1]+1 || 0)
		setadditionalInputs(additionalInputsArray);
	}
	// END OF ADD INPUT


	// DELETE INPUT
	let deleteAdditionalInput = (e, newInputId) => {
		e.preventDefault();
		let additionalInputsArray = additionalInputs.filter(inputId => inputId !== newInputId);
		setadditionalInputs(additionalInputsArray);
	}
	// END OF DELETE INPUT
	

	// ERRORS SETTER
	useEffect(() => {
		setErrors(props.errors);
	}, [props.errors])
	// END OF ERRORS SETTER
  return (
  	<>
	    <label className="InputPlus w-100 d-block">
	      <input name={props.name} required className={errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""} data-validation={props.validation} onChange={() => setErrors(null)}/>
	      <span className="Input__label">{props.label}</span>
	      { props.limit !== additionalInputs.length ? <img src={plusIcon} alt="plus" onClick={(e) => addAdditionalInput(e)} /> : "" }
	    </label> 
	    {additionalInputs.map((newInputId) => 
	    	<label key={newInputId} className="InputPlus w-100 d-block mt-4">
		      <input name={props.name} required />
		      <span className="Input__label">{props.label}</span>
		      <img src={plusIcon} alt="cross" className="cross" onClick={(e) => deleteAdditionalInput(e, newInputId)} />
		    </label> 
		)}
	</>
  );
}

export default InputPlus;
