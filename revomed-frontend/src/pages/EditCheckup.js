import { useState, useEffect, useRef } from "react";
import { useHistory, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from 'swiper/core';
import API from "../utils/API";
import ENVIRONMENT from '../utils/ENVIRONMENT';
import SEO from "../utils/SEO";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import ContentModal from "../utils/ContentModal/ContentModal";


// components
import Input from "../atoms/Input/Input";
import Textarea from "../atoms/Textarea/Textarea";

import SelectCustom from "../atoms/SelectCustom/SelectCustom";
import Select from "../atoms/Select/Select";
import Description from "../blocks/Description/Description";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// graphics
import pencilEditIcon from './img/LkUser/pencilEditIcon.svg';
import trash from './img/trash.svg';


import crossIcon from './img/LkUserEdit/crossIcon.svg';
import crossIconClinic from './img/LkUserEdit/crossIconClinic.svg';
import plusIconClinic from './img/LkUserEdit/plusIconClinic.svg';

// styles
import './EditCheckup.scss';

// slider init
import 'swiper/swiper.scss';
SwiperCore.use([Navigation]);

let EditCheckup = (props) => {
	
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	const [errors, setErrors] = useState({});
	const [checkup, setCheckup] = useState(null);

	const [symptoms, setsymptoms] = useState([""]);
	const [sympromIsCurrentId, setSympromIsCurrentId] = useState(null);

	const [contentModalIsOpen, setContentModalIsOpen] = useState(false);
	const [contentModalText, setContentModalText] = useState(false);

	let addSympromAdditionalInput = (e) => {
		e.preventDefault();
		let newArr = symptoms.slice(0);
		newArr.push("")
		setsymptoms(newArr);
		setSympromIsCurrentId(null);
	}
	let deleteSympromAdditionalInput = (e, key) => {
		e.preventDefault();
		let newArr = symptoms.slice(0);
		console.log("eduArray1", newArr);
		newArr = newArr.filter((item, k) => k !== key);
		console.log("eduArray2", newArr);
		setsymptoms(newArr);
		setSympromIsCurrentId(null);
	}

	let updatesymptoms = (e, id) => {
		let result = symptoms.map(function(item, index, array) {
  			if (index === id) return e.target.value;
  			else return item;
		});
		console.log("result", result);
		setsymptoms(result);
	}

	const [surveys, setSurveys] = useState([""]); //!!!
	const [surveyIsCurrentId, setSurveyIsCurrentId] = useState(null); //!!!

	let addSurveyAdditionalInput = (e) => {
		e.preventDefault();
		let newArr = surveys.slice(0);
		newArr.push("")
		setSurveys(newArr);
		setSurveyIsCurrentId(null);
	}
	let deleteSurveyAdditionalInput = (e, key) => {
		e.preventDefault();
		let newArr = surveys.slice(0);
		console.log("eduArray1", newArr);
		newArr = newArr.filter((item, k) => k !== key);
		console.log("eduArray2", newArr);
		setSurveys(newArr);
		setSurveyIsCurrentId(null);
	}

	let updateSurveys = (e, id) => {
		let result = surveys.map(function(item, index, array) {
  			if (index === id) return e.target.value;
  			else return item;
		});
		console.log("result", result);
		setSurveys(result);
	}



	// ON PAGE LOAD
	let history = useHistory();
	useEffect(() => {
		document.cookie = "bookingInfo=;max-age=-1";
		// get clinic catalog
		let getCheckup = async () => {
			let res = await API.get('/clinics/checkups/'+props.match.params.checkupId);
			return await res.data;
		}
		if (props.match.params.checkupId) {
			getCheckup().then((result) => {
				setCheckup(result.checkup);
				setsymptoms(result.checkup.symptoms);
				setSurveys(result.checkup.surveys);
			}, (error) => error.response.status === 404 ? history.replace("/404") : null);			
		} else {
			setCheckup({id: null});
		}
		


	}, [history, props.match.params.checkupId])
	// END OF ON PAGE LOAD

	let postCheckup = async (data) => {
		let res = await API.post('/clinics/checkups', data);
		return await res.data;
	}
	let putCheckup = async (data) => {
		let res = await API.put('/clinics/checkups', data);
		return await res.data;
	}

	const postCheckupForm = useRef(null);
	let postCheckupRequest = (e) => {
		e.preventDefault();
	    	setFormSubmitButtonIsLoading(true);
	    	let postData = new FormData(postCheckupForm.current);
	    	postData.append('surveys', JSON.stringify(surveys));
	    	postData.append('symptoms', JSON.stringify(symptoms));
	    	if (!checkup.idCheckup) {
	    		postCheckup(postData).then((result) => {
					setFormSubmitButtonIsLoading(false);
					if (result.success) {
						setContentModalText("Вы успешно добавили новый чекап");
						setContentModalIsOpen(true);
					} else {
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
	    	} else {
	    		postData.append('id', checkup.idCheckup);
	    		putCheckup(postData).then((result) => {
					setFormSubmitButtonIsLoading(false);
					if (result.success) {
						setContentModalText("Вы успешно обновили данные чекапа");
						setContentModalIsOpen(true);
					} else {
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

  return (
    <div className="EditCheckup">
    	<div className="container py-7">
		{checkup ? <>
			<div className="row my-6 header">
				<div className="col-8 text-center">
					<h1 className="mb-4">{checkup.name ? "Редактирование чекапа" : "Новый чекап"}</h1>
					<Link to="/lk/checkup" className="d-inline-block reset-btn"><img src={crossIcon} className="mr-2" alt="" /> Отменить изменения</Link>
				</div>
			</div>
			
			<div className="row mb-7">
	      	 	<div className="col-8">
					<form onSubmit={postCheckupRequest} ref={postCheckupForm}>
						<div className="row px-5 py-6 mx-0">
							<div className="col-8 mb-4">
								<h2>Основные данные</h2>
							</div>
							<div className="col-8 col-lg-4 mb-4 pr-lg-4">
				      			<Input name="name" label="Название" validation="notEmpty" defaultValue={checkup.name} errors={errors} />
				      		</div>
				      		<div className="col-8 col-lg-4 mb-4 pl-lg-4">
				      			<Input name="price" label="Стоимость (в руб.)" defaultValue={checkup.price} validation="notEmpty onlyNumbers" errors={errors} />
				      		</div>
				      		<div className="col-8 mb-4 mt-4">
								<h2>Мини-описание (120 символов)</h2>
							</div>
							<div className="col-8 mb-4 mini-textarea">
				      			<Textarea tabIndex="-1" label="Мини-описание" name="annotation" defaultValue={checkup.annotation} maxLength={120} />
				      		</div>
				      		<div className="col-8 mb-4 mt-4">
								<h2>Полное описание</h2>
							</div>
							<div className="col-8 mb-4">
				      			<Textarea tabIndex="-1" label="Полное описание" defaultValue={checkup.description} name="description" />
				      		</div>
				      		<div className="col-8 mb-4 mt-4">
								<h2>Нужен, если</h2>
							</div>
				      		<div className="col-8 mb-4">
				      			{symptoms.map((item, key) =>
				      				<div className={`InputPlusWithDates row align-items-center align-content-center ${key+1 !== symptoms.length ? "mb-3" : ""}`} key={key}>
						      			<label className="InputPlusWithDates-group col-7 d-block">
									      	<input value={item} name={"symprom_"+key} required placeholder="Например: Вы чувствуете постоянную усталость, вялость и слабость" data-validation="notEmpty" tabIndex="-1" className={errors && errors.hasOwnProperty("symprom_"+key) && errors["symprom_"+key] ? "error" : ""} onChange={(e) => {updatesymptoms(e, key); setErrors(actual => {actual["symprom_"+key] = false; return { ...actual };})}} />
									    </label>
								    	{ 20 !== symptoms.length && key === 0 ? <div className="InputPlusWithDates-plus col-2 col-md-1 d-flex justify-content-end"><div className="icon plus" onClick={(e) => addSympromAdditionalInput(e)}><img src={plusIconClinic} alt="plus" /></div></div> : "" }
							    		{ 20 !== symptoms.length && key !== 0 ? <div className="InputPlusWithDates-plus col-2 col-md-1 d-flex justify-content-end"><div className="icon cross" onClick={(e) => deleteSympromAdditionalInput(e, key)}><img src={crossIconClinic} alt="cross" className="cross" /></div></div> : "" }
							    	</div>
				      			)}
							</div>
				      		<div className="col-8 mb-4 mt-4">
								<h2>Обследования в чекапе</h2>
							</div>
				      		<div className="col-8">
				      			{surveys.map((item, key) =>
				      				<div className="InputPlusWithDates row align-items-center align-content-center mb-3" key={key}>
						      			<label className="InputPlusWithDates-group col-7 d-block">
									      	<input value={item} name={"survey_"+key} required placeholder="Введите название анализа" data-validation="notEmpty" tabIndex="-1" className={errors && errors.hasOwnProperty("survey_"+key) && errors["survey_"+key] ? "error" : ""} onChange={(e) => {updateSurveys(e, key); setErrors(actual => {actual["survey_"+key] = false; return { ...actual };})}} />
									    </label>
								    	{ 20 !== surveys.length && key === 0 ? <div className="InputPlusWithDates-plus col-2 col-md-1 d-flex justify-content-end"><div className="icon plus" onClick={(e) => addSurveyAdditionalInput(e)}><img src={plusIconClinic} alt="plus" /></div></div> : "" }
							    		{ 20 !== surveys.length && key !== 0 ? <div className="InputPlusWithDates-plus col-2 col-md-1 d-flex justify-content-end"><div className="icon cross" onClick={(e) => deleteSurveyAdditionalInput(e, key)}><img src={crossIconClinic} alt="cross" className="cross" /></div></div> : "" }
							    	</div>
				      			)}
							</div>
							<div className="col-8 mb-4">
								<label className="InputPlusWithDates-toggle  d-flex align-items-center ">
						    		<input name="consultation" type="checkbox" tabIndex="-1" defaultChecked={checkup.consultation} />
						    		<span className="InputPlusWithDates-toggle__label ml-3">Консультация врача включена в чекап</span>
						    	</label>
							</div>

							<div className="col-8 mt-6">
				      			<button type="submit" className="ui-r-main-button px-6 mx-auto d-flex justify-content-center" disabled={formSubmitButtonIsLoading}>
									<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
									<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Сохранить</span>
								</button>
				      		</div>
						</div>
					</form>
				</div>
			</div>
			</> : <div className="mb-7"><BigLoadingState text="Загружаем данные чекапов" /></div> }
		
      	</div>
      	<ContentModal contentClassName="Checkup-modal" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => {setContentModalIsOpen(state) }} modalHeader="Успешно">
			<p className="mb-4">{contentModalText}</p>
			<Link to="/lk/checkup" className="m-btn d-inline-block w-100">Хорошо</Link>
		</ContentModal>
      	<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
    </div> 
  );
}

export default EditCheckup;