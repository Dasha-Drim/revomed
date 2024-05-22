import { useState, useEffect } from "react";

// styles
import './Textarea.scss';

let Textarea = (props) => {
  /*
  props.label - label
  props.name - input's name attribute
  props.defaultValue - input's name attribute
  props.validation - validation method
  props.errors - validation errors
  props.maxLength
  props.disabled
  props.tabIndex
  */

	const [errors, setErrors] = useState(props.errors);

  // ERRORS SETTER
	useEffect(() => {
		setErrors(props.errors);
	}, [props.errors])
  // END OF ERRORS SETTER

  return (
    <label className="Textarea w-100">
      <textarea 
      	className={errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""} 
      	name={props.name} 
      	data-validation={props.validation}
      	onChange={() => setErrors(null)}
        maxLength={props.maxLength}
        minLength={props.minLength}
        disabled={props.disabled}
      	required 
        tabIndex={props.tabIndex}
        defaultValue={props.defaultValue}
      ></textarea>
    </label> 
  );
}

export default Textarea;
