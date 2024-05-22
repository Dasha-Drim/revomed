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
import "./InputPlus.scss";


const CustomInput = forwardRef((datePickerProps, ref) => (
  <input type="text" ref={ref} {...datePickerProps} />
));
CustomInput.displayName = 'CustomInputRef';


let InputPlus = (props) => {
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
		dataArray.push({name: "", start: null, end: null})
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
			<div key={key} className="InputPlusWithDates row align-items-center align-content-center">
				<label className="InputPlusWithDates-group col-12 col-lg-4 d-block">
					<input value={item.name} name={props.name+"_"+key} required data-validation="notEmpty" tabIndex="-1" className={errors && errors.hasOwnProperty(props.name+"_"+key) && errors[props.name+"_"+key] ? "error" : ""} onChange={(e) => {setData(actual => {actual[key].name = e.target.value; return actual}); setErrors(actual => {actual[props.name+"_"+key] = false; return { ...actual };})}} />
					<span className="InputPlusWithDates-group__label">Название</span>
				</label>
				<label className="InputPlusWithDates-group col-6 col-md-3 col-lg-2 d-block">
							    <DatePicker
							    	name={props.name+"Start_"+key}
							    	className={errors && errors.hasOwnProperty(props.name+"Start_"+key) && errors[props.name+"Start_"+key] ? "error" : ""}
									selected={typeof item.start === "string" && item.start.length ? new Date(item.start.split("/")[1], item.start.split("/")[0], 0, 0, 0, 0, 0) : item.start ? item.start : null}
									onChange={(date) => {setData(actual => {actual[key].start = date; return actual;}); setErrors(actual => {actual[props.name+"Start_"+key] = false; return { ...actual };}) }}
									onCalendarOpen={() => setDataCalendarOpenId(key*2)}
									onCalendarClose={() => setDataCalendarOpenId(null)}
									dateFormat="MM/yyyy"
									showMonthYearPicker
									showTwoColumnMonthYearPicker
									autoComplete="off"
									tabIndex="-1"
									required
									customInput={<CustomInput data-validation="notEmpty" />}
								/>
						      	<span className={"InputPlusWithDates-group__label "+(dataCalendarOpenId === key*2 || item.start ? "InputPlusWithDates-group__label--focused" : "")}>C</span>
				</label>
				<label className={"InputPlusWithDates-group col-6 col-md-3 col-lg-2 d-block "+(dataIsCurrentId === key*2+1 && "invisible")}>
						      	<DatePicker
							    	name={props.name+"End_"+key}
							    	className={errors && errors.hasOwnProperty(props.name+"End_"+key) && errors[props.name+"End_"+key] ? "error" : null}
									selected={typeof item.end === "string" && item.end.length ? new Date(item.end.split("/")[1], item.end.split("/")[0], 0, 0, 0, 0, 0) : item.end ? item.end : null}
									onChange={(date) => {setData(actual => {actual[key].end = date; return actual;}); setErrors(actual => {actual[props.name+"End_"+key] = false; return { ...actual };}) }}
									onCalendarOpen={() => setDataCalendarOpenId(key*2+1)}
									onCalendarClose={() => setDataCalendarOpenId(null)}
									dateFormat="MM/yyyy"
									showMonthYearPicker
									showTwoColumnMonthYearPicker
									autoComplete="off"
									tabIndex="-1"
									required
									customInput={<CustomInput data-validation={dataIsCurrentId !== key*2+1 ? "notEmpty" : ""} />}
								/>
								<span className={"InputPlusWithDates-group__label "+(dataCalendarOpenId === key*2+1 || item.end ? "InputPlusWithDates-group__label--focused" : "")}>До</span>
				</label>
				<label className={"InputPlusWithDates-toggle mt-3 mt-md-0 col-6 col-md-5 col-lg-3 d-flex align-items-center "+ (data.length !== (key+1) && "invisible")}>
						    	<input name={props.name+"Current_"+key} type="checkbox" tabIndex="-1" checked={dataIsCurrentId === key*2+1} onChange={(e) => setDataIsCurrentId(e.target.checked ? key*2+1 : null)} />
						    	<span className="InputPlusWithDates-toggle__label ml-3">По наст. время</span>
				</label>
				{ 20 !== data.length && key === 0 ? <div className="InputPlusWithDates-plus col-6 col-md-1 col-lg-1 d-flex justify-content-end"><img src={plusIcon} alt="plus" onClick={(e) => addEduAdditionalInput(e)} /></div> : "" }
				{ 20 !== data.length && key !== 0 ? <div className="InputPlusWithDates-plus col-6 col-md-1 col-lg-1 d-flex justify-content-end"><img src={plusIcon} alt="cross" className="cross" onClick={(e) => deleteEduAdditionalInput(e, key)} /></div> : "" }
			</div>
		)}
	</>
  );
}

export default InputPlus;