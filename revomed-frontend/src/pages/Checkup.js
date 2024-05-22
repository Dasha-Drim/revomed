import { useState, useEffect, useRef } from "react";
import { useHistory, Link } from "react-router-dom";
import { DateTime } from 'luxon';
import DatePicker from "react-datepicker";
import API from "../utils/API";
import ENVIRONMENT from '../utils/ENVIRONMENT';
import SEO from "../utils/SEO";
import GeneralModal from "../utils/GeneralModal/GeneralModal";


// components
import SelectCustom from "../atoms/SelectCustom/SelectCustom";
import Select from "../atoms/Select/Select";
import Description from "../blocks/Description/Description";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

//graphics
import point from './img/point.svg';

// styles
import "react-datepicker/dist/react-datepicker.css";
import './Checkup.scss';

let Checkup = (props) => {
	const [checkup, setCheckup] = useState(null)
	const [dates, setDates] = useState([])
	const [startDate, setStartDate] = useState(null);
	const [defaultVariantAdress, setDefaultVariantAdress] = useState(0)
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	const [clearAdress, setClearAdress] = useState(false);
	const [clearTime, setClearTime] = useState(false);

	// ON PAGE LOAD
	let history = useHistory();
	useEffect(() => {
		document.cookie = "bookingInfo=;max-age=-1";
		// get clinic catalog
		let getCheckup = async () => {
			let res = await API.get('/clinics/checkups/'+props.match.params.checkupId);
			return await res.data;
		}
		console.log("checkupId", props.match.params.checkupId)
		getCheckup().then((result) => {
			if (result.success) setCheckup(result.checkup);
			else history.replace("/404");
		}, (error) => error.response.status === 404 ? history.replace("/404") : null)
		
		setDates([
			{name: "9:00-12:00", value: "9:00-12:00"},
			{name: "12:00-15:00", value: "12:00-15:00"},
			{name: "15:00-18:00", value: "15:00-18:00"},
			{name: "18:00-21:00", value: "18:00-21:00"}
		])

	}, [history, props.match.params.checkupId])
	// END OF ON PAGE LOAD

	// ON ADRESS SELECT CHANGE
	

	let postCheckup = async (data) => {
		let res = await API.post('/clinics/checkups/applications', data);
		return await res.data;
	}

	const checkupForm = useRef(null);
	let checkupFormSubmit = (e) => {
		e.preventDefault();
	    	setFormSubmitButtonIsLoading(true);
	    	setClearAdress(false);
	    	setClearTime(false);
	    	let postData = new FormData(checkupForm.current);
	    	postData.append('idCheckup', props.match.params.checkupId);
	    	postCheckup(postData).then((result) => {
				setFormSubmitButtonIsLoading(false);
				if (result.success) {
					setStartDate(null);
					setClearAdress(true);
					setClearTime(true);
					setGeneralModalHeader("Успешно");
					setGeneralModalText("Вы успешно записались на обследование. Вам придет СМС сообщение с информацией.");
					setGeneralModalIsOpen(true);
				} else {
					setGeneralModalHeader("Ошибка");
					if (result.message === "Вы не авторизованы. Записатся на обследование может только зарегистрированный пользователь") setGeneralModalText("Чтобы продолжить запись на обследование, необходимо сначала зарегистрироваться. Нажмите на Вход/Регистрация, затем вернитесь к записи на обследование.");
					else setGeneralModalText(result.message);
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

  return (
    <div className="Checkup">
    	<div className="container py-7">
    	{checkup ? <>
    		<SEO pageProps={{
				title: "Чекап " + checkup.name + " — REVOMED",
				url: ENVIRONMENT.frontendURL+props.location.pathname}} 
			/>
      	
		<div className="row navigation">
			<div className="col-8">
				<Link to={"/clinic/"+checkup.idClinic}>{checkup.nameClinic}</Link>
				<span className="ml-3">•</span>
				<span className="ml-3">{checkup.name}</span>
			</div>
		</div>
		<div className="row my-6 name">
			<div className="col-8">
				<h1 className="mb-2">{checkup.name}</h1>
				<span>Чекап от клиники</span>
			</div>
		</div>
		<div className="row">
			<div className="col-8 col-lg-auto w-57">
				<div className="row">
					<div className="col-8 m-0 mb-6 p-0">
						<Description title="Описание" description={checkup.description} />
					</div>
					<div className="col-8 m-0 mb-6 mb-lg-0 p-0">
						<div className="surveys p-5">
							<h2>Обследования в чекапе</h2>
							{checkup.surveys.map((item, key) => 
								<div className={`${key+1 !== checkup.surveys.length ? "pb-3" : ""}`}>
									<img src={point} alt="" className="mr-3" />
									<span>{item}</span>
								</div>							
							)}
						</div>
					</div>
				</div>
			</div>
			<div className="col-8 col-lg-auto w-43 mb-4 mb-md-0">
				<div className="row">
					<div className="col-8 m-0 mb-6 p-0 pl-lg-5">
						<div className="symptoms p-5">
							<h2>Нужен, если</h2>
							{checkup.symptoms.map((item, key) => 
								<div className={`d-flex p-3 align-items-center symptoms__item ${key+1 !== checkup.symptoms.length ? "mb-3" : ""}`}>
									<span className="num mr-4">{key+1}</span>
									<span>{item}</span>
								</div>							
							)}
						</div>
					</div>
					<div className="col-8 m-0 p-0 pl-lg-5">
						<form className="form p-5" ref={checkupForm} onSubmit={checkupFormSubmit}>
							<p className="mb-4">Выберите желаемую дату и время приёма. Оплачивать сейчас не нужно, оплата в клинике</p>
							<div className="mb-4">
								<SelectCustom name="adress" label="Выберите адрес клиники" clear={clearAdress} defaultVariant={0} variants={checkup.adresses} />
							</div>
							<div className="mb-4">
								<DatePicker
									dateFormat="dd.MM.yyyy"
							      	selected={startDate}
							      	onChange={(date) => setStartDate(date)}
							      	minDate={new Date()}
							      	className="dateSelect"
							      	placeholderText="Желаемая дата приёма"
							      	name="date"
							    />
							</div>
							<div>
								<Select name="time" label="Выберите время приёма" clear={clearTime} defaultVariant={0} defaultVariantIsPlaceholder={true} variants={[{name: "Выберите время приёма", value: ""}].concat(dates)} />
							</div>
							<button className="mt-5 m-btn w-100 d-inline-block" type="submit">
								<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
								<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Записаться {checkup.price}₽</span>
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
		</> : <BigLoadingState text="Загружаем чекап" />}
      </div>
      <GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
    </div> 
  );
}

export default Checkup;