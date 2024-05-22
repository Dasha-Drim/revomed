import { useState, useEffect } from "react";

import plusIcon from './plusIcon.svg';
import crossIcon from './crossIcon.svg';
import uploadFileIcon from './uploadFileIcon.svg';
import './InputPlusCategory.scss';

import FileInput from '../FileInput/FileInput'
import GeneralModal from "../../utils/GeneralModal/GeneralModal";
import ContentModal from "../../utils/ContentModal/ContentModal";

import API from "../../utils/API";

let InputPlusCategory = (props) => {
	/*
	props.label - label
	props.name - input's name attribute
	props.validation - validation method
	props.errors - validation errors
	*/
	const [data, setData] = useState(props.value);

	const [deleted, setDeleted] = useState(null);

    // CONTENT MODAL
	let [contentModalIsOpen, setContentModalIsOpen] = useState(false);
	let [contentModalHeader, setContentModalHeader] = useState("Вы уверенны, что хотите удалить категорию?");
	// END OF CONTENT MODAL

	// GENERAL MODAL
	let [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	let [generalModalHeader, setGeneralModalHeader] = useState("");
	let [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL

	let [errors, setErrors] = useState(props.errors);
	useEffect(() => {
		setErrors(props.errors);
	}, [props.errors])

	useEffect(() => {
		setData(props.value);
	}, [props.value])

	let addAdditionalInput = (e) => {
		e.preventDefault();
		let dataArray = data.slice(0);
		dataArray.push({name: "", photo: null})
		setData(dataArray);
		
	}

	let deleteAdditionalInput = (e, key, id = null) => {
		e.preventDefault();
		if (id) {
			setContentModalIsOpen(true);
			setDeleted(id);
		}
		else {
			let dataArray = data.slice(0);
			dataArray = dataArray.filter((item, k) => k !== key);
			setData(dataArray);
		}
	}



	// DELETE CATEGORY REQUEST
	let deleteCategory = async (id) => {
		let res = await API.delete("/subcategories/"+id, {params: {action: "subcategory"}});
		return await res.data;
	}
	let deleteCategoryProcess = (e) => {
		e.preventDefault();
		deleteCategory(deleted).then((result) => {
			if (result.success) {
				setGeneralModalHeader("Успешно");
				setGeneralModalText("Вы успешно удалили категорию. Обновите страницу");
				setGeneralModalIsOpen(true);
			} else {
				setGeneralModalHeader("Ошибка");
				setGeneralModalText(result.message);
				setGeneralModalIsOpen(true);
			}
		})
	}
	// END OF DELETE CATEGORY REQUEST



  return (
  	<>
		{data.map((item, key) =>
			<div key={key} className="row mb-4 InputPlusCategory">
				<label className=" col-6 mb-0">
				    <input defaultValue={item.name} name={props.name} required className={errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""} data-validation={props.validation} onChange={() => setErrors(null)}/>
				    <span className="Input__label">{props.label}</span>
				</label>
				<div className="col-5">
					<FileInput value={item.photo} name={"photo_"+props.index+"_"+key}/>
				</div>
				{item.id && <input type="hidden" name="idSubcategory" value={item.id} />}
				{ key === 0 ? <>{(data.length >= 1 && item.id) && <img src={crossIcon} alt="cross" className="cross mr-3" onClick={(e) => deleteAdditionalInput(e, key, item.id)} /> }<img className="plus" src={plusIcon} alt="plus" onClick={(e) => addAdditionalInput(e)} /></> : "" }
				{ key !== 0 ? <img src={crossIcon} alt="cross" className="cross" onClick={(e) => deleteAdditionalInput(e, key, item.id)} /> : "" }
			</div>
		)}

		<ContentModal contentClassName="ttt" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => setContentModalIsOpen(state)} modalHeader={contentModalHeader}>
			<div className="d-flex justify-content-center align-items-center">
				<button className="main-button mr-4" onClick={(e) => {e.preventDefault(); setContentModalIsOpen(false)}}>Нет</button>
				<button className="secondary-button" onClick={(e) => deleteCategoryProcess(e)}>Да</button>
			</div>
		</ContentModal>
		<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
	</>
  );
}

export default InputPlusCategory;
