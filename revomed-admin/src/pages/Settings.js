import { useState, useEffect, useRef  } from "react";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import GeneralModal from "../utils/GeneralModal/GeneralModal";

//components
import Navigation from "../blocks/Navigation/Navigation";
import CategoryForm from "../blocks/CategoryForm/CategoryForm";
import CategoryHelpfulForm from "../blocks/CategoryHelpfulForm/CategoryHelpfulForm";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// styles
import "./Settings.scss";

let Settings = (props) => {
	// GENERAL MODAL
	let [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	let [generalModalHeader, setGeneralModalHeader] = useState("");
	let [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL

	let [arrCategories, setArrCategories] = useState(null)
	let [arrHelpfulCategories, setArrHelpfulCategories] = useState(null)
	let [errors, setErrors] = useState({});

	let [section, setSection] = useState("consultation"); //helpful

	// ON PAGE LOAD
	useEffect(() => {
		let getCategories = async (data) => {
			let res = await API.get("/categories", data);
			return await res.data;
		}
		getCategories().then((result) => {
			setArrCategories(result.categories);
		})

		let getSubcategories = async (data) => {
			let res = await API.get("/subcategories", data);
			return await res.data;
		}
		getSubcategories().then((result) => {
			if (!result.categories.length) {
				setArrHelpfulCategories([{name: ""}])
			} else setArrHelpfulCategories(result.categories);
		})
	}, []);
	// END OF ON PAGE LOAD


	// ADD CATEGORY
	let addCategory = (e) => {
		e.preventDefault();
		let arr = arrCategories.slice(0);
		arr.push({nameRu: "", name: "", duration: "", interval: "", price: "", license: false, new: true});
		setArrCategories(arr);
	}
	// END OF ADD CATEGORY

	let addHelpfulCategory = (e) => {
		e.preventDefault();
		let arr = arrHelpfulCategories.slice(0);
		arr.push({name: "", new: true});
		setArrHelpfulCategories(arr);
	}


	// EDIT CATEGORY FORM
	let updateCategory = async (data) => {
		let res = await API.post("/categories", data);
		return await res.data;
	}
	let editCategoryForm = useRef(null);
	let editCategoryFormHandler = (e) => {
		e.preventDefault();

		let formItems = editCategoryForm.current.elements;
		let postData= new FormData();
			
		let categoriesArr = [];
		[...formItems].forEach(item => {
			if(!item.name) return;
			if(item.name.split("_")[0] === "name") return categoriesArr.push({name: item.value});
			if(item.name.split("_")[0] === "nameRu") return categoriesArr[categoriesArr.length-1].nameRu = item.value;
			if(item.name.split("_")[0] === "duration") return categoriesArr[categoriesArr.length-1].duration = item.value;
			if(item.name.split("_")[0] === "interval") return categoriesArr[categoriesArr.length-1].interval = item.value;
			if(item.name.split("_")[0] === "price") return categoriesArr[categoriesArr.length-1].price = item.value;
			if(item.name.split("_")[0] === "license") return categoriesArr[categoriesArr.length-1].license = item.value;
		})
		postData.append("categories", JSON.stringify(categoriesArr));

		updateCategory(postData).then((result) => {
			console.log(result)
			if (result.success) {
				setGeneralModalHeader("Успешно");
				setGeneralModalText("Вы успешно сохранили категории");
				setGeneralModalIsOpen(true);
			} else {
				setGeneralModalHeader("Ошибка");
				setGeneralModalText(result.message);
				setGeneralModalIsOpen(true);
			}
		})
	}
	// END OF EDIT CATEGORY FORM

	// EDIT SUBCATEGORY FORM
	let updateSubcategory = async (data) => {
		let res = await API.post("/subcategories", data);
		return await res.data;
	}
	let editSubcategoryForm = useRef(null);
	let editSubcategoryFormHandler = (e) => {
		e.preventDefault();

		let formItems = editSubcategoryForm.current.elements;
		let postData= new FormData(editSubcategoryForm.current);
			
		let categoriesArr = [];
		[...formItems].forEach(item => {
			if(!item.name) return;
			if(item.name.split("_")[0] === "name") return categoriesArr.push({name: item.value, subcategories: []});
			if(item.name.split("_")[0] === "idCategory") return categoriesArr[categoriesArr.length-1].id = item.value;
			if(item.name.split("_")[0] === "subcategories") return categoriesArr[categoriesArr.length-1].subcategories.push({name: item.value})
			if(item.name.split("_")[0] === "idSubcategory") return categoriesArr[categoriesArr.length-1].subcategories[categoriesArr[categoriesArr.length-1].subcategories.length-1].id = item.value
		})
		postData.append("categories", JSON.stringify(categoriesArr));

		updateSubcategory(postData).then((result) => {
			console.log(result)
			if (result.success) {
				setGeneralModalHeader("Успешно");
				setGeneralModalText("Вы успешно сохранили категории");
				setGeneralModalIsOpen(true);
			} else {
				setGeneralModalHeader("Ошибка");
				setGeneralModalText(result.message);
				setGeneralModalIsOpen(true);
			}
		})
	}
	// END OF EDIT SUBCATEGORY FORM

	return (
		<>
			<Navigation page="settings" useAuth={props.useAuth} />
			<div className="Settings">
				<div className="container-fluid">
					<div className="row px-2 py-3 p-md-5">
					{arrCategories && arrHelpfulCategories ? <>
						<div className="col-12 mb-5 d-flex align-items-center justify-content-between">
							<h1>Настройки</h1>
						</div>
						<div className="col-12 mb-5 d-flex align-items-center justify-content-between">
							<div className="d-flex botton-holer">
								<button className={`py-1 px-3 ${section === "consultation" ? "active" : ""}`} onClick={() => setSection("consultation")}>Категории консультаций</button>
								<button className={`py-1 px-3 ${section === "helpful" ? "active" : ""}`} onClick={() => setSection("helpful")}>Категории полезного</button>
							</div>
						</div>
						{
							section === "consultation" ?
							<form onSubmit={editCategoryFormHandler} ref={editCategoryForm} className="col-12 py-5">
								<div className="row">
									<div className="col-12 mb-4 mt-3">
										<h3>Редактирование категорий</h3>
									</div>
									{
										arrCategories.map((item, key) => 
											<div className="col-12 pb-4" key={key}>
												<CategoryForm info={item}/>
											</div>
										)
									}
									<div className="col-12 d-flex justify-content-between flex-wrap pt-5">
										<button type="button" onClick={(e) => addCategory(e)} className="main-button mb-3">Добавить категорию</button>
										<button type="submit" className="secondary-button mb-3">Сохранить категорию</button>
									</div>
								</div>
							</form>
							:
							<form onSubmit={editSubcategoryFormHandler} ref={editSubcategoryForm} className="col-12 py-5">
								<div className="row">
									<div className="col-12 mb-4 mt-3">
										<h3>Редактирование категорий</h3>
									</div>
									{
										arrHelpfulCategories.map((item, key) => 
											<div className="col-12 pb-4" key={key}>
												<CategoryHelpfulForm info={item} index={key}/>
											</div>
										)
									}
									<div className="col-12 d-flex justify-content-between flex-wrap pt-5">
										<button type="button" onClick={(e) => addHelpfulCategory(e)} className="main-button mb-3">Добавить категорию</button>
										<button type="submit" className="secondary-button mb-3">Сохранить категорию</button>
									</div>
								</div>
							</form>
						}
						
						<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
						</> : <BigLoadingState text="Загружаем категории"/>}
					</div>
				</div>
			</div>
		</>
	);
}

export default Settings;