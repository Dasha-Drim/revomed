import { useState, useRef, useEffect } from "react";
import { FormValidation } from "../../../utils/FormValidation";
import API from "../../../utils/API";
import GeneralModal from "../../../utils/GeneralModal/GeneralModal";

// components
import Input from "../../../atoms/Input/Input";
import Select from "../../../atoms/Select/Select";
import BigLoadingState from "../../../elements/BigLoadingState/BigLoadingState";

// styles
import './UIClinicConsultationsPrice.scss';

let UIClinicConsultationsPrice = (props) => {
	const [activeOffline, setactiveOffline] = useState(false);
	const [categoriesPrices, setCategoriesPrices] = useState(null);
	const [currentCategory, setCurrentCategory] = useState([]);


	const [variants, setVariants] = useState([{name: "Категория", value: ""}]);
	const [clear] = useState(true);
	

	const [categoriesPricesOffline, setCategoriesPricesOffline] = useState(null);
	const [currentCategoryOffline, setCurrentCategoryOffline] = useState([]);


	const [errors, setErrors] = useState({});
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);

	// GENERAL MODAL
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL

	
	// CATEGORIES AND CONSULTATIONS PRICE
	useEffect(() => {
	  	let getClinics = async () => {
		    let res = await API.get('/clinics/'+props.userId);
		    return await res.data;
		}
	    getClinics().then((result) => {
	    	if(!result.success) return false;
	    	let categories = [];
	    	let categoriesOffline = [];
	    	result.clinic.price.forEach(item => {
	    		categories.push({name: item.title, value: item.category, price: item.price});
	    	})
	    	result.clinic.priceOffline.forEach(item => {
	    		categoriesOffline.push({name: item.title, value: item.category, price: item.price});
	    	})
	      	setCategoriesPrices(categories);
	      	setCategoriesPricesOffline(categoriesOffline);
			setVariants([{name: "Категория", value: ""}].concat(categories));
	    })
	}, [props.userId])
	// END OF CATEGORIES AND CONSULTATIONS PRICE


	useEffect(() => {
		let newVariants;
		if (activeOffline) newVariants = categoriesPricesOffline ? [{name: "Категория", value: ""}].concat(categoriesPricesOffline) : [{name: "Категория", value: ""}];
		if (!activeOffline) newVariants = categoriesPrices ? [{name: "Категория", value: ""}].concat(categoriesPrices) : [{name: "Категория", value: ""}];
		setVariants(newVariants)
		console.log("variants", variants)
	}, [activeOffline])


	// ON CHANGE CATEGORY
	let onCategorySelectChange = (selected) => {
		setCurrentCategory(categoriesPrices.find(cat => cat.value === selected.value))
	}
	// END OF ON CHANGE CATEGORY

	// ON CHANGE CATEGORY OFFLINE
	let onCategorySelectChangeOffline = (selected) => {
		setCurrentCategoryOffline(categoriesPricesOffline.find(cat => cat.value === selected.value))
	}
	// END OF ON CHANGE CATEGORY OFFLINE


	// PUT CONSULTATIONS PRICE
	let putConsultationsPrice = async (data) => {
		let res = await API.put('/clinics', data);
		return await res.data;
	}
	// END OF PUT CONSULTATIONS PRICE


	// CONSULTATIONS PRICE FORM
	const consultationsPriceForm = useRef(null);
	let consultationsPriceFormHandler = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(consultationsPriceForm);
		setErrors(currentFormErrors);
		if(!Object.keys(currentFormErrors).length) {
			setFormSubmitButtonIsLoading(true);
			let price = consultationsPriceForm.current.elements.price.value;
			let category = consultationsPriceForm.current.elements.category.value;
			putConsultationsPrice({price: {category: category, price: price}}).then((result) => {
				setFormSubmitButtonIsLoading(false);
				if(result.success) {
					let categoriesPricesNew = categoriesPrices.slice(0);
					let changedIndex = categoriesPricesNew.findIndex(item => item.name === currentCategory.name);
					categoriesPricesNew[changedIndex].price = price;
					setCategoriesPrices(categoriesPricesNew);
					setGeneralModalHeader("Успешно");
					setGeneralModalText(`Стоимость консультации для категории "${currentCategory.name}" успешно обновлена у всех врачей`);
					setGeneralModalIsOpen(true);
				}
				else {
					setGeneralModalHeader("Ошибка");
					setGeneralModalText(result.message);
					setGeneralModalIsOpen(true);
				}
			}, 
			(error) => {
				setFormSubmitButtonIsLoading(false);
				setGeneralModalHeader("Ошибка");
				setGeneralModalText("Что-то пошло не так. Мы не смогли связаться с сервером, обновите страницу и попробуйте ещё раз.");
				setGeneralModalIsOpen(true);
			})
		}
	}
	// END OF CONSULTATIONS PRICE FORM


	// CONSULTATIONS PRICE FORM
	const consultationsPriceOfflineForm = useRef(null);
	let consultationsPriceOfflineFormHandler = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(consultationsPriceOfflineForm);
		setErrors(currentFormErrors);
		if(!Object.keys(currentFormErrors).length) {
			setFormSubmitButtonIsLoading(true);
			let price = consultationsPriceOfflineForm.current.elements.price.value;
			let category = consultationsPriceOfflineForm.current.elements.categoryOffline.value;
			putConsultationsPrice({priceOffline: {category: category, price: price}}).then((result) => {
				setFormSubmitButtonIsLoading(false);
				if(result.success) {
					let categoriesPricesNew = categoriesPricesOffline.slice(0);
					let changedIndex = categoriesPricesNew.findIndex(item => item.name === currentCategoryOffline.name);
					categoriesPricesNew[changedIndex].price = price;
					setCategoriesPrices(categoriesPricesNew);
					setGeneralModalHeader("Успешно");
					setGeneralModalText(`Стоимость консультации для категории "${currentCategoryOffline.name}" успешно обновлена у всех врачей`);
					setGeneralModalIsOpen(true);
				}
				else {
					setGeneralModalHeader("Ошибка");
					setGeneralModalText(result.message);
					setGeneralModalIsOpen(true);
				}
			}, 
			(error) => {
				setFormSubmitButtonIsLoading(false);
				setGeneralModalHeader("Ошибка");
				setGeneralModalText("Что-то пошло не так. Мы не смогли связаться с сервером, обновите страницу и попробуйте ещё раз.");
				setGeneralModalIsOpen(true);
			})
		}
	}
	// END OF CONSULTATIONS PRICE FORM

	

	return (
		<>
		<div className="UIClinicConsultationsPrice">
			<div className="mb-4">
				<h2 className="ui-section-heading mb-0">Стоимость консультаций</h2>
			</div>
			<div className="UIClinicConsultationsPrice__content px-5 py-6">
			{categoriesPrices ? <>
				{
					props.offline
					?
					<div className="mx-0 row align-items-center align-content-center mb-5">
					<div className="col-8 col-lg-3">
							<div className="UIClinicConsultationsPrice_offline-btns p-4 ">
				              	<span className="d-block">Указать цену для консультаций</span>
				             	<div className="offline-btns__container mt-3">
				                	<button className={`${!activeOffline ? "active" : ""}`} onClick={() => {setactiveOffline(false); setCurrentCategoryOffline([])}}>Онлайн</button>
				                	<button className={`${activeOffline ? "active" : ""}`} onClick={() => {setactiveOffline(true); setCurrentCategory([])}}>В клинике</button>
				              	</div>
				            </div>
				        </div>
			        </div>
			        :
			        ""
				}
		        {
		        	!activeOffline 
		        	?
		        	<form ref={consultationsPriceForm} onSubmit={consultationsPriceFormHandler} className="mx-0 row align-items-center align-content-center">
						<div className="col-8 col-lg-3 mr-lg-3 mb-4 mb-lg-0">
							<Select name="category" label="Категория" onChange={onCategorySelectChange} defaultVariant={0} value="" defaultVariantIsPlaceholder={true} variants={variants} />
						</div>
						<div className="col-8 col-lg-3 mr-lg-6 mb-4 mb-lg-0">
							<Input label="Введите цену консультации" value={currentCategory.price || ""} name="price" minLength={2} errors={errors} validation="onlyNums notEmpty" disabled={!currentCategory.price} />
						</div>
						<button className="ui-r-main-button d-block px-6 col-8 col-lg-auto" type="submit" disabled={!currentCategory.price}>
							<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Сохранить</span>
						</button>
					</form>
					: 
					<form ref={consultationsPriceOfflineForm} onSubmit={consultationsPriceOfflineFormHandler} className="mx-0 row align-items-center align-content-center">
						<div className="col-8 col-lg-3 mr-lg-3 mb-4 mb-lg-0">
							<Select name="categoryOffline" label="Категория" onChange={onCategorySelectChangeOffline} defaultVariant={0} defaultVariantIsPlaceholder={true} variants={variants} clear={clear}/>
						</div>
						<div className="col-8 col-lg-3 mr-lg-6 mb-4 mb-lg-0">
							<Input label="Введите цену консультации" value={currentCategoryOffline.price || ""} name="price" minLength={2} errors={errors} validation="onlyNums notEmpty" disabled={!currentCategoryOffline.price} />
						</div>
						<button className="ui-r-main-button d-block px-6 col-8 col-lg-auto" type="submit" disabled={!currentCategoryOffline.price}>
							<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Сохранить</span>
						</button>
					</form>
		        }
			</> : <BigLoadingState text="Загружаем данные" /> }
			</div>
      	</div>
      	<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
      	</>
	);
}
export default UIClinicConsultationsPrice;