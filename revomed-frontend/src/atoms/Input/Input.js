import { useState, useEffect } from "react";
import InputMask from "react-input-mask";

// STYLES
import './Input.scss';

let Input = (props) => {
  /*
  props.label - label
  props.name - input's name attribute
  props.defaultValue - input's default value
  props.validation - validation method
  props.errors - validation errors
  props.maxLength
  props.type
  props.disabled
  props.mask
  */

  const [val, setVal] = useState(props.value || "");
  const [errors, setErrors] = useState(props.errors);

  const handleChange = e => {
    setErrors(null);
    setVal(e.target.value)
  };

let onPressKeyboard = (e) => {
  if (props.availableSymbols && props.availableSymbols === "numbers") {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  }
}

  // ADDITIONAL ATTRIBUTES FOR VALUE/DEFAULT_VALUE
  let addAttrs = props.value !== undefined ? {value: val} : {defaultValue: props.defaultValue || ""};
  // END OF ADDITIONAL ATTRIBUTES FOR VALUE/DEFAULT_VALUE

  // VALUE SETTER
  useEffect(() => {
    setVal(props.value);
  }, [props.value])
  // END OF VALUE SETTER


  // ERRORS SETTER
	useEffect(() => {
		setErrors(props.errors);
	}, [props.errors])
  // END OF ERRORS SETTER
  return (
    <label className="Input w-100">
      <InputMask 
      	className={errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""} 
      	name={props.name} 
      	data-validation={props.validation}
        maxLength={props.maxLength}
        minLength={props.minLength}
        type={props.type || "text"}
        disabled={props.disabled}
        mask={props.mask}
      	required
        {...addAttrs}
        onChange={(e) => {handleChange(e)}}
        onKeyPress={(e) => {onPressKeyboard(e)}}
      
      />
      <span className="Input__label">{props.label}</span>
    </label> 
  );
}

export default Input;
