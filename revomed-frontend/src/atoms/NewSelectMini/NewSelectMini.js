import { useState, useEffect, useRef } from "react";
import ReactDOM from 'react-dom'

// graphics
import arrowDown from '../Select/arrowDown.svg'

// styles
import './NewSelectMini.scss';

// body of app
const appBody = document.querySelector('body');

let NewSelectMini = (props) => {
  /*
  props.name - select's name attribute
  props.onChange - action on option change (optional)
  props.setSelectedVariantByValue - set selected variant or first by value
  props.defaultVariant - index of the object element that will be set by default (optional)
  props.defaultVariantIsPlaceholder - is defaultVariant is placeholder (optional)
  props.variants - object with options {name: XXX, value: YYY}
  props.validation - method of validation (optional)
  props.errors - errors of validation (optional)
  props.decoration - object with decoration settings (optional, available params: {icon: 'PATH', disableChevron: true/false})
  props.disabled
  props.position - left or right (by default: left)
  props.closeOnScroll
  */

  const [positionStyles, setPositionStyles] = useState(null);
	const [selectIsOpen, setSelectIsOpen] = useState(false);
	const [currentSelectedItem, setCurrentSelectedItem] = useState(props.variants[props.defaultVariant] || {name: "Выберите", value: ""});
  const [errors, setErrors] = useState(props.errors);

  // ON START SELECT
  let startSelect = () => {
    if(props.disabled) return false;
    // position of select mini wrapper
    setPositionStyles({
      top: wrapperRef.current.getBoundingClientRect().top + wrapperRef.current.getBoundingClientRect().height + window.pageYOffset,
      [props.position || "left"]: props.position ? portalContainerRef.current.getBoundingClientRect().width - wrapperRef.current.getBoundingClientRect().right : wrapperRef.current.getBoundingClientRect().left
    })
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
  // END OF SELECT ITEM


  // CLOSE SELECT ON CLICK OUTSIDE & SET EVENTLISTENERS
  const wrapperRef = useRef(null);
  let portalContainerRef = useRef(document.createElement('div'));
  appBody.insertAdjacentElement("beforeend", portalContainerRef.current);
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target) &&
        portalContainerRef.current && !portalContainerRef.current.contains(event.target)) {
        setSelectIsOpen(false);
      }
      window.addEventListener('resize', () => setSelectIsOpen(false))
      window.addEventListener('scroll', () => props.closeOnScroll ? setSelectIsOpen(false) : null)
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [props.closeOnScroll]);
  // END OF CLOSE SELECT ON CLICK OUTSIDE & SET EVENTLISTENERS


  // SET SELECTED VARIANT
  useEffect(() => {
    setCurrentSelectedItem(props.variants.find(item => item.value === props.setSelectedVariantByValue) || props.variants[0])
  }, [props.setSelectedVariantByValue, props.variants])
  // END OF SET SELECTED VARIANT


  // ERRORS SETTER
  useEffect(() => {
    setErrors(props.errors);
  }, [props.errors])
  // END OF ERRORS SETTER
  return (
    <label ref={wrapperRef} className="NewSelectMini w-100">
      <select name={props.name} value={currentSelectedItem.value} onChange={()=>{}} className="d-none" data-validation={props.validation}>
      {props.variants.map((item, key) => 
        <option key={key} value={item.value}>{item.name}</option>
        )}
      </select>
      <div className={`select-head ${selectIsOpen ? "open" : ""} ${!(props.decoration && props.decoration.disableChevron) ? "has-chevron" : ""} ${props.decoration && props.decoration.icon ? "has-icon" : ""} ${errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""} ${props.disabled ? "disabled" : ""}`} onClick={() => startSelect()}>
      	{props.decoration && props.decoration.icon ? <img src={props.decoration.icon} alt="" className="icon pr-3" /> : ""}
        <span>{currentSelectedItem.name}</span>
      	<img src={arrowDown} alt="" className={props.decoration && props.decoration.disableChevron ? "d-none" : "chevron"} />
      </div>
      {selectIsOpen ?
      ReactDOM.createPortal(<div className="ReactNewSelectMiniPortal"><ul style={positionStyles} className="select-list">
      	{props.variants.map((item, key) => 
      	<li key={key} className={`select-list__item ${ key === 0 && props.defaultVariantIsPlaceholder ? "no-active" : ""}`} onClick={() => {return (key !== 0 || !props.defaultVariantIsPlaceholder) ? selectItem(item) : true}}>{item.name}</li>
      	)}
      </ul></div>, portalContainerRef.current)
  		: ""}
    </label> 
  );
}

export default NewSelectMini;
