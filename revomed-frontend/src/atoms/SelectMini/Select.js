import { useState, useEffect, useRef } from "react";

import arrowDown from './arrowDown.svg'
import './Select.scss';

function Select(props) {
	let [selectIsOpen, setSelectIsOpen] = useState(false);
	let [currentSelectedItem, setCurrentSelectedItem] = useState({name: "Выберите", value: ""});
	let startSelect = () => {
		setSelectIsOpen(!selectIsOpen);
	}
	let selectItem = (item) => {
		setCurrentSelectedItem(item);
    setErrors(null);
		setSelectIsOpen(!selectIsOpen);
	}

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

  let [errors, setErrors] = useState(props.errors);
  useEffect(() => {
    setErrors(props.errors);
  }, [props.errors])
  return (
    <label ref={wrapperRef} className="Select w-100">
      <input name={props.name} type="hidden" value={currentSelectedItem.value} data-validation={props.validation}/>
      <div className={`select-head ${selectIsOpen ? "open" : ""} ${errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""}`} onClick={() => startSelect()}>
      	<span>{currentSelectedItem.name}</span>
      	<img src={arrowDown} alt="" />
      </div>
      {selectIsOpen ?
      <ul className="select-list">
      	{props.variants.map((item, key) => 
      	<li key={key} className="select-list__item" data-value={item.value} onClick={() => selectItem(item)}>{item.name}</li>
      	)}
      </ul>
  		: ""}
    </label> 
  );
}

export default Select;
