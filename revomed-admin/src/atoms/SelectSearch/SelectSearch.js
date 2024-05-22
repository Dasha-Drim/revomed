import { useState, useEffect, useRef } from "react";
import Select from "react-select"

// styles
import "./SelectSearch.scss";

let SelectSearch = (props) => {
	let [currentSelectedItem, setCurrentSelectedItem] = useState(props.defaultValue);

  // GET CURRENT SELECTED ITEM
  useEffect(() => {
    if (props.updateUseSelect) {
      props.updateUseSelect(currentSelectedItem.value);
    }
  }, [currentSelectedItem]);
  //END OF GET CURRENT SELECTED ITEM

  useEffect(() => {
    setCurrentSelectedItem(props.options.find(item => item.value === props.setSelectedVariantByValue) || props.options[0]);
  }, [props.options]);

  // ON LOAD PAGE
  useEffect(() => {
    setCurrentSelectedItem(props.options.find(item => item.value === props.setSelectedVariantByValue) || props.options[0]);
  }, [])
  //END OF ON LOAD PAGE

	return (
		<Select classNamePrefix="select" name={props.name} value={currentSelectedItem} defaultValue={currentSelectedItem} options={props.options} onChange={(e) => {setCurrentSelectedItem(e)}}/>
	);
}

export default SelectSearch;

