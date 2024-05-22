import { useState, useEffect } from "react";
import InputNumberReact from 'react-input-number';

// STYLES
import './InputNumber.scss';

let InputNumber = (props) => {
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

  const [val, setVal] = useState(props.defaultValue || "");
  const [errors, setErrors] = useState(props.errors);


  // ADDITIONAL ATTRIBUTES FOR VALUE/DEFAULT_VALUE
  //let addAttrs = props.value !== undefined ? {value: val} : {defaultValue: val};
  // END OF ADDITIONAL ATTRIBUTES FOR VALUE/DEFAULT_VALUE

  // VALUE SETTER
  useEffect(() => {
    console.log("propssssss jjjjjjjjjjj", props)
    if (props.value) setVal(props.value);
  }, [props.value])
  // END OF VALUE SETTER


  // ERRORS SETTER
	useEffect(() => {
		setErrors(props.errors);
	}, [props.errors])
  // END OF ERRORS SETTER
  return (
    <label className="InputNumber w-100">
      
      <InputNumberReact
      className={errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""} 
      name={props.name} 
      data-validation={props.validation}
      min={props.minValue} 
      max={props.maxValue} 
      value={val} 
      onChange={setVal}
      required />

      <span className="InputNumber__label">{props.label}</span>
    </label> 
  );
}

export default InputNumber;
