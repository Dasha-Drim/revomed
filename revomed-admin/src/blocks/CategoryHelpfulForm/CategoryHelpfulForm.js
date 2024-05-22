import { useState, useEffect, useRef  } from "react";
import { FormValidation } from "../../utils/FormValidation";
import API from "../../utils/API";
import GeneralModal from "../../utils/GeneralModal/GeneralModal";
import ContentModal from "../../utils/ContentModal/ContentModal";

// components
import Input from "../../atoms/Input/Input";
import InputPlusCategory from "../../atoms/InputPlusCategory/InputPlusCategory";

// graphics
import trashIcon from "./trashIcon.svg";

// styles
import "./CategoryHelpfulForm.scss";

let CategoryHelpfulForm = (props) => {
	// GENERAL MODAL
	let [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	let [generalModalHeader, setGeneralModalHeader] = useState("");
	let [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL

	let [subcategories, setSubcategories] = useState(props.info.subcategories ? props.info.subcategories : [{name: "", photo: null}]);

	let [errors, setErrors] = useState({});
	let [deleted, setDeleted] = useState(null);


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
	let deleteCategory = async (id) => {
		let res = await API.delete("/subcategories/"+id, {params: {action: "category"}});
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
		<div className="CategoryHelpfulForm w-100 position-ralative p-sm-4 row mt-4 justify-content-between">
			<div className="col-10 col-sm-11 col-lg-6 mb-4">
				<Input name="name" label="Название" defaultValue={props.info.name}/>
			</div>
			{props.info.id && <input type="hidden" name="idCategory" value={props.info.id} />}
			<div className="col-1 mb-4 d-flex justify-content-end align-items-center">
				{
					!props.info.new 
					?
					<button className="trash-button" onClick={(e) => {e.preventDefault(); setDeleted(props.info.id); setContentModalIsOpen(true)}}><img src={trashIcon} alt=""/></button>
					:
					""
				}
			</div>
			<div className="col-12 mb-4">
				<InputPlusCategory index={props.index} name="subcategories" value={subcategories} errors={errors} label="Название" validation="notEmpty"/>
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

export default CategoryHelpfulForm;