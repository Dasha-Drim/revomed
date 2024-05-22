import { useState, useEffect, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from  "react-datepicker";
import ru from 'date-fns/locale/ru';

// components
import DateInput from "../../atoms/DateInput/DateInput";

// graphics
import plusIcon from "./plusIcon.svg";
import crossIcon from "./crossIcon.svg";

// styles
import "./InputPlusChecking.scss";


const CustomInput = forwardRef((datePickerProps, ref) => (
  <input type="text" ref={ref} {...datePickerProps} />
));
CustomInput.displayName = 'CustomInputRef';


let InputPlusChecking = (props) => {
	/*
	props.label - label
	props.name - input"s name attribute
	props.validation - validation method
	props.errors - validation errors
	props.value - value
	props.currentId
	*/

	let [additionalInputs, setadditionalInputs] = useState([0]);
	let [errors, setErrors] = useState(props.errors);

	// DATA
	const [data, setData] = useState(props.value);
	const [dataCalendarOpenId, setDataCalendarOpenId] = useState(null);
	const [dataIsCurrentId, setDataIsCurrentId] = useState(null);

	let addEduAdditionalInput = (e) => {
		e.preventDefault();
		let dataArray = data.slice(0);
		dataArray.push({shop: "", link: ""})
		setData(dataArray);
		setDataIsCurrentId(null);
	}
	let deleteEduAdditionalInput = (e, key) => {
		e.preventDefault();
		let dataArray = data.slice(0);
		console.log("dataArray1", dataArray);
		dataArray = dataArray.filter((item, k) => k !== key);
		console.log("dataArray2", dataArray);
		setData(dataArray);
		setDataIsCurrentId(null);
	}

	useEffect(() => {
		setData(props.value);
		setDataIsCurrentId(props.currentId);
	}, [props.value, props.currentId])
	// END OF DATA

	
	useEffect(() => {
		setErrors(props.errors);
	}, [props.errors])
	
  return (
  	<>
	    {data.map((item, key) =>
			<div key={key} className={`InputPlusChecking row align-items-center align-content-center ${key !== data.length-1 ? "mb-3" : ""}`}>
				<label className="InputPlusChecking-group col-12 col-sm-5 col-lg-4 mb-3 mb-sm-0 d-block mb-0">
					<input value={item.shop} name={props.name+"_"+key} required data-validation="notEmpty" tabIndex="-1"  />
					<span className="InputPlusChecking-group__label">Название магазина</span>
				</label>
				<label className="InputPlusChecking-group col-10 col-sm-5 col-lg-4 d-block mb-0">
					<input value={item.link} name={props.name+"_"+key} required data-validation="notEmpty" tabIndex="-1"  />
					<span className="InputPlusChecking-group__label">Ссылка на магазин</span>
				</label>
			</div>
		)}
	</>
  );
}

export default InputPlusChecking;