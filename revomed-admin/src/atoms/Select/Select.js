import { useState, useEffect, useRef } from "react";

// styles
import './Select.scss';

let Select = (props) => {
  /*
  props.name - select's name attribute
  props.onChange - action on option change (optional)
  props.variants - object with options {name: XXX, value: YYY}
  props.validation - method of validation (optional)
  props.errors - errors of validation (optional)
  props.defaultVariant - index of the object element that will be set by default (optional)
  props.defaultVariantIsPlaceholder - is defaultVariant is placeholder (optional)
  props.disabled
  */

  const [selectIsOpen, setSelectIsOpen] = useState(false);
  const [currentSelectedItem, setCurrentSelectedItem] = useState(props.defaultVariant !== -1 ? props.variants[props.defaultVariant] : {name: "Выберите", value: ""});
  const [errors, setErrors] = useState(props.errors);

  // ON START SELECT
  let startSelect = () => {
    if(props.disabled) return;
    setSelectIsOpen(!selectIsOpen);
  }
  // END OF ON START SELECT


  // ON SELECT ITEM
  let selectItem = (item) => {
    setCurrentSelectedItem(item);
    setErrors(null);
    setSelectIsOpen(!selectIsOpen);
    if(props.onChange) props.onChange({name: props.name, value: item.value});
  }
  // END OF ON SELECT ITEM


  // CLOSE SELECT ON CLICK OUTSIDE 
  const wrapperRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSelectIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // END OF CLOSE SELECT ON CLICK OUTSIDE 


  // ERRORS SETTER
  useEffect(() => {
    setErrors(props.errors);
  }, [props.errors])
  // END OF ERRORS SETTER
  
  return (
    <label ref={wrapperRef} className="Select w-100">
      <input name={props.name} type="hidden" value={currentSelectedItem.value} data-validation={props.validation} disabled={props.disabled}/>
      <div className={`select-head ${selectIsOpen ? "open" : ""} ${props.disabled ? "disabled" : ""} ${errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""}`} onClick={() => startSelect()}>
        <span>{currentSelectedItem.name}</span>
      </div>
      {selectIsOpen ?
      <ul className="select-list">
        {props.variants.map((item, key) => 
        <li key={key} className={`select-list__item ${ key === 0 && props.defaultVariantIsPlaceholder ? "no-active" : ""}`} data-value={item.value} onClick={() => {return (key !== 0 || !props.defaultVariantIsPlaceholder) ? selectItem(item) : true}}>{item.name}</li>
        )}
      </ul>
      : ""}
    </label> 
  );
}

export default Select;
