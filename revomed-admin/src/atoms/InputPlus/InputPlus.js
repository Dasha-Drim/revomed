import { useState, useEffect } from "react";

import plusIcon from './plusIcon.svg';
import crossIcon from './crossIcon.svg';
import './InputPlus.scss';

let InputPlus = (props) => {
	/*
	props.label - label
	props.name - input's name attribute
	props.validation - validation method
	props.errors - validation errors
	*/
	let [additionalInputs, setadditionalInputs] = useState([]);
	let addAdditionalInput = (e) => {
		e.preventDefault();
		let additionalInputsArray = additionalInputs.slice(0);
		additionalInputsArray.push(additionalInputsArray[additionalInputsArray.length-1]+1 || 0)
		setadditionalInputs(additionalInputsArray);

	}
	let deleteAdditionalInput = (e, newInputId) => {
		e.preventDefault();
		let additionalInputsArray = additionalInputs.filter(inputId => inputId !== newInputId);
		setadditionalInputs(additionalInputsArray);
	}
	let [errors, setErrors] = useState(props.errors);
	useEffect(() => {
		setErrors(props.errors);
	}, [props.errors])
  return (
  	<>
  		<div className="row mb-4">
		    <label className="InputPlus col-6">
		      <input name={props.name} required className={errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""} data-validation={props.validation} onChange={() => setErrors(null)}/>
		      <span className="Input__label">{props.label}</span>
		    </label> 
		    <label className="InputPlus col-2">
		      <input name={props.name} required className={errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""} data-validation={props.validation} onChange={() => setErrors(null)}/>
		      <span className="Input__label">Начало</span>
		    </label> 
		    <label className="InputPlus col-2">
		      <input name={props.name} required className={errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""} data-validation={props.validation} onChange={() => setErrors(null)}/>
		      <span className="Input__label">Конец</span>
		    </label>
		    { props.limit !== additionalInputs.length ? <img src={plusIcon} alt="plus" onClick={(e) => addAdditionalInput(e)} /> : "" }
	    </div>
	    {additionalInputs.map((newInputId) => 
	    	<div className="row mb-4">
			    <label className="InputPlus col-6" key={newInputId}>
			      <input name={props.name} required className={errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""} data-validation={props.validation} onChange={() => setErrors(null)}/>
			      <span className="Input__label">{props.label}</span>
			    </label> 
			    <label className="InputPlus col-2" key={newInputId+10}>
			      <input name={props.name} required className={errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""} data-validation={props.validation} onChange={() => setErrors(null)}/>
			      <span className="Input__label">Начало</span>
			    </label> 
			    <label className="InputPlus col-2" key={newInputId+100}>
			      <input name={props.name} required className={errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""} data-validation={props.validation} onChange={() => setErrors(null)}/>
			      <span className="Input__label">Конец</span>
			    </label>
			    <img src={crossIcon} alt="cross" className="cross" onClick={(e) => deleteAdditionalInput(e, newInputId)} />
		    </div>
		)}

	</>
  );
}

export default InputPlus;
