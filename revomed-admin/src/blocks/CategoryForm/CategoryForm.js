import { useState, useEffect, useRef  } from "react";
import { FormValidation } from "../../utils/FormValidation";
import API from "../../utils/API";
import GeneralModal from "../../utils/GeneralModal/GeneralModal";
import ContentModal from "../../utils/ContentModal/ContentModal";

// components
import Input from "../../atoms/Input/Input";

// graphics
import trashIcon from "./trashIcon.svg";

// styles
import "./CategoryForm.scss";

let CategoryForm = (props) => {
	// GENERAL MODAL
	let [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	let [generalModalHeader, setGeneralModalHeader] = useState("");
	let [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL


	// CONTENT MODAL
	let [contentModalIsOpen, setContentModalIsOpen] = useState(false);
	let [contentModalHeader, setContentModalHeader] = useState("Вы уверенны, что хотите удалить категорию?");
	// END OF CONTENT MODAL

	let [checkboxState, setCheckboxState] = useState(false);
	let [checkboxValue, setCheckboxValue] = useState(false);
	

	//UPDATE CHECKBOX
	let updateCheckbox = (item) => {
		!checkboxState ? setCheckboxState(true) : setCheckboxState(false)
		!checkboxValue ? setCheckboxValue(true) : setCheckboxValue(false)
	}
	//END OF UPDATE CHECKBOX

	// ON LOAD PAGE
	useEffect(() => {
		!props.info.license ? setCheckboxState(false) : setCheckboxState(true);
		!props.info.license ? setCheckboxValue(false) : setCheckboxValue(true);
	}, [])
	// END OF ON LOAD PAGE

	
	// DELETE CATEGORY REQUEST
	let deleteCategory = async (name) => {
		let res = await API.delete("/categories/"+name);
		return await res.data;
	}
	let deleteCategoryProcess = (e) => {
		e.preventDefault();
		deleteCategory(props.info.name).then((result) => {
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
		<div className="CategoryForm w-100 position-ralative p-sm-4 row mt-4">
			<div className="col-12 col-lg-6 mb-4">
				<Input name="name" label="Название на английском" defaultValue={props.info.name} disabled={!props.info.new ? "disabled" : false}/>
			</div>
			<div className="col-12 col-lg-6 mb-4">
				<Input name="nameRu" label="Название" defaultValue={props.info.nameRu} />
			</div>
			<div className="col-12 col-md-6 col-lg-4 mb-4">
				<Input name="price" label="Цена" defaultValue={props.info.price} />
			</div>
			<div className="col-12 col-md-6 col-lg-4 mb-4">
				<Input name="interval" label="Интервал (мин)" defaultValue={props.info.interval} />
			</div>
			<div className="col-12 col-md-6 col-lg-4 mb-4">
				<Input name="duration" label="Продолжительность (мин)" defaultValue={props.info.duration} />
			</div>
			<div className="col-12 mb-4 d-flex justify-content-between align-items-center">
				<label className="d-flex align-items-center">
					<input type="checkbox" className="checkbox" name="license" value={checkboxValue} checked={checkboxState} onChange={updateCheckbox}/>
					<span>Лицензируема</span>
				</label>
				{
					!props.info.new 
					?
					<button className="trash-button" onClick={(e) => {e.preventDefault(); setContentModalIsOpen(true)}}><img src={trashIcon} alt=""/></button>
					:
					""
				}
				
			</div>
		</div>
		<ContentModal contentClassName="ttt" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => setContentModalIsOpen(state)} modalHeader={contentModalHeader}>
			<div className="d-flex justify-content-center align-items-center">
				<button className="main-button mr-4" onClick={(e)=>{e.preventDefault(); setContentModalIsOpen(false)}}>Нет</button>
				<button className="secondary-button" onClick={(e) => deleteCategoryProcess(e)}>Да</button>
			</div>
		</ContentModal>
		<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
		</>
	);
}

export default CategoryForm;