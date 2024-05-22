import { useState, useEffect, useRef  } from "react";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import { Link } from "react-router-dom";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//components
import Navigation from "../blocks/Navigation/Navigation";
import Input from "../atoms/Input/Input";
import Textarea from "../atoms/Textarea/Textarea";
import Select from "../atoms/Select/Select";
import InputPlus from "../elements/InputPlus/InputPlus";
import SelectSearch from "../atoms/SelectSearch/SelectSearch";
import DateInput from "../atoms/DateInput/DateInput";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

//graphics
import array from "./img/array.svg";

// styles
import "./EditReviews.scss";

let EditReviews = (props) => {

	let [errors, setErrors] = useState({});

	// GENERAL MODAL
	let [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	let [generalModalHeader, setGeneralModalHeader] = useState("");
	let [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL
	
	let [section, setSection] = useState("doctor"); //clinic
	let [doctorsArraySelect, setDoctorsArraySelect] = useState(null);
	let [clinicsArray, setClinicsArray] = useState(null);
	let [doctorsArray, setDoctorsArray] = useState(null);

	// ON PAGE LOAD
	useEffect(() => {

		let getDoctors = async () => {
			let res = await API.get("/doctors");
			return await res.data;
		}

		let getClinics = async () => {
			let res = await API.get("/clinics");
			return await res.data;
		}

		getDoctors().then((result) => {
			let arrDoctors = [{label: "ФИО врача", value: ""}];
			result.doctors.forEach((doctor) => {
				let doctorsArrayItem = {
					label: doctor.fio,
					value: doctor.id
				}
				arrDoctors.push(doctorsArrayItem);
			})
			setDoctorsArraySelect(arrDoctors);
			setDoctorsArray(result.doctors);
		})

		getClinics().then((result) => {
			let arrClinic = [{label: "Название клиники", value: ""}];
			result.clinics.forEach((clinic) => {
				let clinicArrayItem = {
					label: clinic.name,
					value: clinic.id,
				}
				arrClinic.push(clinicArrayItem);
			})
			setClinicsArray(arrClinic);
			
		})



	}, []);
	// END OF ON PAGE LOAD



	let updateSelectClinic = (value) => {
		if (value === "") {
			let arrDoctors = [{label: "ФИО врача", value: ""}];
			doctorsArray.forEach((doctor) => {
				let doctorsArrayItem = {
					label: doctor.fio,
					value: doctor.id
				}
				arrDoctors.push(doctorsArrayItem);
			})
			setDoctorsArraySelect(arrDoctors)
		}
		else {
			let arr = doctorsArray.filter(item => {
				if (item.clinic) return +item.clinic.id === +value
			});
			let arrDoctors = [{label: "ФИО врача", value: ""}];
			arr.forEach((doctor) => {
				let doctorsArrayItem = {
					label: doctor.fio,
					value: doctor.id
				}
				arrDoctors.push(doctorsArrayItem);
			})
			setDoctorsArraySelect(arrDoctors)
		}
	}



	// EDIT PROFILE FORM
	let editProfileForm = useRef(null);
	let postEditProfile = async (data) => {
		let res = await API.post("/reviews", data);
		return await res.data;
	}	  
	let editProfileFormHandler = (e) => {
		e.preventDefault();

		let currentFormErrors = FormValidation(editProfileForm);
		setErrors(currentFormErrors);
		if (Object.keys(currentFormErrors).length) return;
		let postData = new FormData(editProfileForm.current);

		postEditProfile(postData).then((result) => {
			if (result.success) {
				setGeneralModalHeader("Успешно");
				setGeneralModalText("Вы успешно добавили отзыв");
				setGeneralModalIsOpen(true);
			} else {
				setGeneralModalHeader("Ошибка");
				setGeneralModalText(result.message);
				setGeneralModalIsOpen(true);
			}
		})
	}
	// END OF EDIT PROFILE FORM

	let [checkboxState, setCheckboxState] = useState(false);
	

	//UPDATE CHECKBOX
	let updateCheckbox = (item) => {
		!checkboxState ? setCheckboxState(true) : setCheckboxState(false);
		let arrDoctors = [{label: "ФИО врача", value: ""}];
			doctorsArray.forEach((doctor) => {
				let doctorsArrayItem = {
					label: doctor.fio,
					value: doctor.id
				}
				arrDoctors.push(doctorsArrayItem);
			})
			setDoctorsArraySelect(arrDoctors)
	}
	//END OF UPDATE CHECKBOX

	let updateClinic = () => {
		let doctorValue = "";
	}


	return (
		<>
			<Navigation page="reviews" useAuth={props.useAuth} />
			<div className="EditReviews">
				<div className="container-fluid">
					<div className="row px-2 py-3 p-md-5">
					{(clinicsArray && doctorsArraySelect) ? <>
						<div className="col-12 mb-5 d-flex align-items-center justify-content-between">
							<h1><Link to="/reviews" className="mr-4"><img src={array} alt=""/></Link>Добавление отзыва</h1>
						</div>
						<form onSubmit={editProfileFormHandler} ref={editProfileForm} className="col-12 py-5" noValidate>
							<div className="row">

								<div className="col-12 mb-4">
									<h3>Получатель отзыва</h3>
								</div>
								
								<div className="col-12 mb-4 d-flex align-items-center justify-content-between">
									<div className="d-flex botton-holer">
										<button type="button" className={`py-1 px-3 ${section === "doctor" ? "active" : ""}`} onClick={() => setSection("doctor")}>Врач</button>
										<button type="button" className={`py-1 px-3 ${section === "clinic" ? "active" : ""}`} onClick={() => setSection("clinic")}>Клиника</button>
									</div>
								</div>


								{
									section === "doctor" ? 
									<>
										<div className="col-12 mb-3 d-flex justify-content-between align-items-center checkbox_holder">
										<label className="d-flex align-items-center">
											<input type="checkbox" className="checkbox" name="clicnicDoctor" value={checkboxState} checked={checkboxState} onChange={updateCheckbox}/>
											<span>Врач клиники, показать фильтр</span>
										</label>
									</div>


									{
										checkboxState ? 
										<>
										<div className="col-12 mb-4">
											<div className="row">
												<div className="col-12 col-md-6">
													<SelectSearch name="idClinic" defaultValue={{label: "Название клиники", value: ""}} options={clinicsArray} updateUseSelect={(value) => updateSelectClinic(value)}/>
												</div>
											</div>
										</div>

										<div className="col-12 mb-4">
											<div className="row">
												<div className="col-12 col-md-6">
													<SelectSearch defaultValue={{label: "ФИО врача", value: ""}} name="idDoctor" options={doctorsArraySelect}  />
												</div>
											</div>
										</div>
										</>
										:
										<div className="col-12 mb-4">
											<div className="row">
												<div className="col-12 col-md-6">
													<SelectSearch defaultValue={{label: "ФИО врача", value: ""}} name="idDoctor" options={doctorsArraySelect}  />
												</div>
											</div>
										</div>
									}
									

									
									</>
									:
									<div className="col-12 mb-4">
										<div className="row">
											<div className="col-12 col-md-6">
												<SelectSearch name="idClinic" defaultValue={{label: "Название клиники", value: ""}} options={clinicsArray} updateUseSelect={(value) => updateSelectClinic(value)}/>
											</div>
										</div>
									</div>
								}
								

								<div className="col-12 mb-4 mt-3">
									<h3>Основная информация</h3>
								</div>
								<div className="col-6 mb-4">
									<Input name="clientName" label="Имя автора" defaultValue={""} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<DateInput name="date" placeholder="Дата отзыва" value="" />
								</div>
								<div className="col-6 mb-4">
									<Input name="mark" label="Оценка" defaultValue={""} validation="notEmpty onlyNums mark" errors={errors} />
								</div>


								<div className="col-12 mb-4">
									<Textarea name="description" defaultValue={""} placeholder="Текст отзыва..."/>
								</div>

								
								
								<div className="col-12 d-flex justify-content-between flex-wrap pt-5 border-top">
									<div></div>
									<button type="submit" className="secondary-button">Сохранить</button>
								</div>
							</div>
						</form>
						<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
						</> : <BigLoadingState text="Загружаем данные"/>}
					</div>
				</div>
			</div>
		</>
	);
}

export default EditReviews;