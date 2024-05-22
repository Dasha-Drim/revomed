import { useState, useEffect } from "react";
import InputMask from "react-input-mask";

// styles
import "./Input.scss";

let Input = (props) => {
  /*
  props.label - label
  props.name - input"s name attribute
  props.defaultValue - input"s name attribute
  props.validation - validation method
  props.errors - validation errors
  props.maxLength
  props.type
  props.disabled
  props.mask
  */

	let [errors, setErrors] = useState(props.errors);
	useEffect(() => {
		setErrors(props.errors);
	}, [props.errors])
  return (
    <label className="Input w-100">
      <InputMask 
      	className={errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""} 
      	name={props.name} 
      	data-validation={props.validation}
      	onChange={() => setErrors(null)}
        maxLength={props.maxLength}
        minLength={props.minLength}
        type={props.type || "text"}
        defaultValue={props.defaultValue || ""}
        value={props.value || null}
        disabled={props.disabled}
        mask={props.mask}
      	required
      />
      <span className="Input__label">{props.label}</span>
    </label> 
  );
}

export default Input;