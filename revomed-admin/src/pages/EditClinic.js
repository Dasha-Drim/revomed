import { useState, useEffect, useRef  } from "react";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import { Link } from "react-router-dom";
import GeneralModal from "../utils/GeneralModal/GeneralModal";

//components
import Navigation from "../blocks/Navigation/Navigation";
import Input from "../atoms/Input/Input";
import Textarea from "../atoms/Textarea/Textarea";
import Select from "../atoms/Select/Select";
import InputPlus from "../elements/InputPlus/InputPlus";
import SelectSearch from "../atoms/SelectSearch/SelectSearch";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

//graphics
import uploadFileIcon from "./img/uploadFileIcon.svg";
import array from "./img/array.svg";

// styles
import "./EditClinic.scss";

let EditClinic = (props) => {
	let [clinicInfo, setClinicInfo] = useState(null);
	let [categoriesArray, setCategoriesArray] = useState([]);
	let [currentPrice, setCurrentPrice] = useState("");
	let [uploadedPhotoProfileStyles, setUploadedPhotoProfileStyles] = useState({});
	let [priceArray, setPriceArray] = useState([]);
	let [currentValueCategoryPrice, setCurrentValueCategoryPrice] = useState("");
	let [currrentFile, setCurrrentFile] = useState(null);
	let [errors, setErrors] = useState({});

	// GENERAL MODAL
	let [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	let [generalModalHeader, setGeneralModalHeader] = useState("");
	let [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL
	
	
	// ON PAGE LOAD
	useEffect(() => {
		let getCategory = async () => {
			let res = await API.get("/categories");
			return await res.data;
		}
		let getClinic = async (id) => {
			let res = await API.get("/clinics/"+id);
			return await res.data;
		}
		getCategory().then((result) => {
			let arrCategories = [];
			result.categories.forEach((category) => {
				let categoriesArrayItem = {
					label: category.nameRu,
					value: category.name
				}
				arrCategories.push(categoriesArrayItem);
			})
			setCategoriesArray(arrCategories);
		})
		getClinic(props.match.params.idSeller).then((result) => {
			setClinicInfo(result.clinic);
			setPriceArray(result.clinic.price);
			setCurrentValueCategoryPrice(result.clinic.price[0].category);
			setCurrentPrice(result.clinic.price[0].price)
			setUploadedPhotoProfileStyles({backgroundImage: "url("+result.clinic.logo+")", backgroundPosition: "center", backgroundSize: "cover"});

			!result.clinic.modules.checkups ? setCheckboxCheckupsState(false) : setCheckboxCheckupsState(true);
			!result.clinic.modules.checkups ? setCheckboxCheckupsValue(false) : setCheckboxCheckupsValue(true);

			!result.clinic.modules.promo ? setCheckboxPromoState(false) : setCheckboxPromoState(true);
			!result.clinic.modules.promo ? setCheckboxPromoValue(false) : setCheckboxPromoValue(true);
		})
	}, []);
	// END OF ON PAGE LOAD


	//CHANGE PRICE
	let changePrice = (item) => {
		setCurrentPrice(item.target.value)
		priceArray.forEach((el, key) => {
			if (el.category === currentValueCategoryPrice) {
				let obj = priceArray[key];
				obj.price = +item.target.value;
				priceArray[key] = obj;
				setPriceArray(priceArray);
			}
		})
	}
	// END OF CHANGE PRICE


	// UPDATE PRICE SELECT
	let updatePriceSelect = (value) => {
		priceArray.forEach((onePrice) => {
			if (value === onePrice.category) {
				setCurrentPrice(onePrice.price);
				setCurrentValueCategoryPrice(value);
			}
		})
	}
	// END OF UPDATE PRICE SELECT


	// UPLOAD FILES
	let [uploadedPhotoProfileName, setUploadedPhotoProfileName] = useState(null);
	let readURL = (input) => {
		console.log(input.target.files)
		if (input.target.files[0]) {
			setCurrrentFile(input.target.files[0])
			let file = input.target.files[0];
			let reader = new FileReader();
			reader.onload = (e) => {
				setUploadedPhotoProfileStyles({
					"backgroundImage": "url("+e.target.result+")",
					"backgroundSize": "cover",
					"backgroundPosition": "center",
					"backgroundRepeat": "no-repeat"
				})
				setUploadedPhotoProfileName(input.target.files[0].name);
			}
			reader.readAsDataURL(input.target.files[0]);
		}
	}
  	// END OF UPLOAD FILES


	// EDIT PROFILE FORM
	let editProfileForm = useRef(null);
	let postEditProfile = async (data) => {
		let res = await API.put("/clinics", data);
		return await res.data;
	}	  
	let editProfileFormHandler = (e) => {
		e.preventDefault();

		let formItems = editProfileForm.current.elements;
		let postData = new FormData();

		[...formItems].forEach(item => {
			if(!item.name) return;
			if ((item.name === "category") || (item.name === "price")) {
				return
			}
			if(item.name === "avatarFile") {
				if (currrentFile) {
					postData.append("avatarFile", currrentFile);
				}
			}
			postData.append(item.name, item.value);
		})
		postData.append("price", JSON.stringify(priceArray));
		postData.append("idClinic", clinicInfo.id);

		postEditProfile(postData).then((result) => {
			if (result.success) {
				setGeneralModalHeader("Успешно");
				setGeneralModalText("Вы успешно изменили данные клиники");
				setGeneralModalIsOpen(true);
			} else {
				setGeneralModalHeader("Ошибка");
				setGeneralModalText(result.message);
				setGeneralModalIsOpen(true);
			}
		})
	}
	// END OF EDIT PROFILE FORM

	let [checkboxCheckupsState, setCheckboxCheckupsState] = useState(false);
	let [checkupsCheckupsValue, setCheckboxCheckupsValue] = useState(false);
	

	//UPDATE CHECKBOX
	let updateCheckboxCheckups = (item) => {
		!checkboxCheckupsState ? setCheckboxCheckupsState(true) : setCheckboxCheckupsState(false)
		!checkupsCheckupsValue ? setCheckboxCheckupsValue(true) : setCheckboxCheckupsValue(false)
	}
	//END OF UPDATE CHECKBOX


	let [checkboxPromoState, setCheckboxPromoState] = useState(false);
	let [checkupsPromoValue, setCheckboxPromoValue] = useState(false);

	//UPDATE CHECKBOX
	let updateCheckboxPromo = (item) => {
		!checkboxPromoState ? setCheckboxPromoState(true) : setCheckboxPromoState(false)
		!checkupsPromoValue ? setCheckboxPromoValue(true) : setCheckboxPromoValue(false)
	}
	//END OF UPDATE CHECKBOX

	return (
		<>
			<Navigation page="applications" useAuth={props.useAuth} />
			<div className="EditClinic">
				<div className="container-fluid">
					<div className="row px-2 py-3 p-md-5">
					{clinicInfo ? <>
						<div className="col-12 mb-5 d-flex align-items-center justify-content-between">
							<h1><Link to="/applications" className="mr-4"><img src={array} alt=""/></Link>Редактирование клиники</h1>
						</div>
						<form onSubmit={editProfileFormHandler} ref={editProfileForm} className="col-12 py-5" noValidate>
							<div className="row">
								<div className="col-12 mb-4 d-flex flex-wrap justify-content-center text-center">
									<div className="avatar mb-3" style={uploadedPhotoProfileStyles}>
										<label className="file">
											<input type="file" name="avatarFile" className="file-input" onChange={(e) => readURL(e)}/>
											<img src={uploadFileIcon} alt=""/>
										</label>
									</div>
									<h2 className="d-block w-100">{clinicInfo.name}</h2>
								</div>
								<div className="col-12 mb-4">
									<h3>Общая информация</h3>
								</div>
								<div className="col-6 mb-4">
									<Input name="name" label="Название клиники" defaultValue={clinicInfo.name} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="country" label="Страна" defaultValue={clinicInfo.country} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="city" label="Город" defaultValue={clinicInfo.city} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="managerFio" label="ФИО менеджера" defaultValue={clinicInfo.managerFio} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="managerPosition" label="Должность" defaultValue={clinicInfo.managerPosition} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="managerEmail" label="Email" defaultValue={clinicInfo.managerEmail} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="licenseNumber" label="Номер лицензии" defaultValue={clinicInfo.licenseNumber} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-12 mb-4 mt-3">
									<h3>Прикрепленные файлы</h3>
								</div>
								<div className="col-12 col-lg-6 mb-4">
									<a href={clinicInfo.licenseFile} className="w-100 d-flex justify-content-center align-items-center main-button link" target="_blank">Сертификат / лицензия</a>
								</div>
								<div className="col-12 mb-4 mt-3">
									<h3>Финансы</h3>
								</div>
								<div className="col-12 col-md-6 mb-4">
									<SelectSearch defaultValue={categoriesArray[0]} updateUseSelect={updatePriceSelect} name="category" options={categoriesArray} />
								</div>
								<div className="col-6 mb-4">
									<label className="holder-input-price w-100">
										<input onChange={changePrice} type="text" name="price" value={currentPrice} className="input-price" required/>
										<span>Цена</span>
									</label>
								</div>
								<div className="col-6 mb-4">
									<Input name="shopID" label="Shop ID (яндекс касса)" defaultValue={clinicInfo.shopID} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-12 mb-4 mt-3">
									<h3>Публичное описание</h3>
								</div>
								<div className="col-12 mb-4 mt-3">
									<Textarea value={clinicInfo.description} name="description" placeholder="Напишите описание..."/>
								</div>
								<div className="col-12 mb-4 mt-3">
									<h3>Модули</h3>
								</div>
								<div className="col-12 mb-3 d-flex justify-content-between align-items-center checkbox_holder">
									<label className="d-flex align-items-center">
										<input type="checkbox" className="checkbox" name="checkups" value={checkupsCheckupsValue} checked={checkboxCheckupsState} onChange={updateCheckboxCheckups}/>
										<span>Чекапы</span>
									</label>
								</div>
								<div className="col-12 mb-5 d-flex justify-content-between align-items-center checkbox_holder">
									<label className="d-flex align-items-center">
										<input type="checkbox" className="checkbox" name="promo" value={checkupsPromoValue} checked={checkboxPromoState} onChange={updateCheckboxPromo}/>
										<span>Промоакции</span>
									</label>
								</div>
								<div className="col-12 d-flex justify-content-between flex-wrap pt-5 border-top">
									<div className="select_status mb-4 mb-lg-0">
										<Select name="status" label="Статус" defaultVariant={([{name: "Статус", value: ""}, {name: "Принят", value: "accepted"}, {name: "Заблокирован", value: "blocked"}, {name: "Новый", value: "new"}].findIndex(item => item.value === clinicInfo.status))} defaultVariantIsPlaceholder={true} variants={[{name: "Статус", value: ""}, {name: "Принят", value: "accepted"}, {name: "Заблокирован", value: "blocked"}, {name: "Новый", value: "new"}]} />
									</div>
									<button type="submit" className="secondary-button">Обновить информацию</button>
								</div>
							</div>
						</form>
						<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
						</> : <BigLoadingState text="Загружаем данные клиники"/>}
					</div>
				</div>
			</div>
		</>
	);
}

export default EditClinic;