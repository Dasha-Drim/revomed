import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { DateTime } from 'luxon';
import API from "../../../utils/API";
import GeneralModal from "../../../utils/GeneralModal/GeneralModal";

// components
import SelectMini from "../../../atoms/SelectMini/SelectMini";
import Select from "../../../atoms/Select/Select";
import BigLoadingState from "../../../elements/BigLoadingState/BigLoadingState";
import EmptyState from "../../../elements/EmptyState/EmptyState";

// graphics
import ChevronLeftIcon from "./ChevronLeftIcon";
import ChevronRightIcon from "./ChevronRightIcon";
import prompt from "./prompt.svg";

// styles
import 'swiper/swiper.scss';
import './UIClinicTimetable.scss';

let UIClinicTimetable = (props) => {
	const [isDocSelected, setIsDocSelected] = useState(false);
	const [isTimetableEdit, setIsTimetableEdit] = useState(false);
	const [availableWeekTimes, setAvailableWeekTimes] = useState([]);
	const [timetable, setTimetable] = useState([]);
	const [timetableSaved, setTimetableSaved] = useState([]);
	const [clinicDoctors, setClinicDoctors] = useState(null);
	const [adresses, setAdresses] = useState(null);
	const [adressesWithFullObject, setAdressesWithFullObject] = useState(null); // remove
	const [currentDoctorId, setCurrentDoctorId] = useState(null);
	const [currentAdressId, setCurrentAdressId] = useState("");
	const [promtOpen, setPromtOpen] = useState(false);

	// ON PAGE LOAD
	useEffect(() => {
	  	let getClinics = async () => {
			let res = await API.get('/clinics/'+props.userId);
			return await res.data;
		}
	    getClinics().then((result) => {
	    	if(!result.success) return false;
	    	let doctors = [];
	    	result.clinic.doctors.forEach(item => {
	    		doctors.push({name: item.name, value: item.id});
	    	})
	      	setClinicDoctors(doctors);

	      	let adressesArr = [];
	      	let adressesWithFullObjectArr = [];
	      	result.clinic.adresses.forEach(item => {
	    		adressesWithFullObjectArr.push({adress: item.adress, id: item.id}); // remove
	    		adressesArr.push({name: item.adress, value: item.id});
	    	})
	      	setAdresses(adressesArr);
	      	setAdressesWithFullObject(adressesWithFullObjectArr); // remove
	    })
	}, [props.userId])
	// END OF ON PAGE LOAD

	let promtOpenRef = useRef(null)

	let closePrompt = () => {
		setPromtOpen(false)
	}
	let listener = event => {
	    if (!promtOpenRef.current) return;
	    if (!promtOpenRef.current.contains(event.target)) {
	    	closePrompt();
	    }
	};

	useEffect(() => {
		document.addEventListener('click', listener, false);
		return () => {
			document.removeEventListener('click', listener, false);
		}
	}, [])


	// ON DOCTOR SELECT CHANGE
	let onDoctorSelectChange = (selected) => {
	  	setCurrentDoctorId(selected.value)
	}

	// ON ADRESS SELECT CHANGE
	let onAdressSelectChange = (selected) => {
	  	setCurrentAdressId(selected.value);
	}

	useEffect(() => {
		if(!currentDoctorId) return false;
		setIsDocSelected(false);
		let getTimetable = async (data) => {
			let res = await API.get('/doctors/timetables/'+currentDoctorId);
			return await res.data;
		}
		getTimetable().then((result) => {
			setTimetableSaved(result.timetable);
			setTimetable(result.timetable);
			if (result.adress) setCurrentAdressId(result.adress.id);
			if (!result.adress) setCurrentAdressId("");
			let interval = result.interval;
			for (let i = 0; i < 7; i++) {
				let dayStartsAt = DateTime.now().plus({ days: i }).set({hour: 0, minute: 0, second: 0, millisecond: 0});
				let dayEndsAt = DateTime.now().plus({ days: i }).set({hour: 23, minute: 59, second: 59, millisecond: 0});
				let availableTime = [];
				while(dayStartsAt < dayEndsAt) {
					availableTime.push({value: dayStartsAt.toUTC().toISO(), name: dayStartsAt.setLocale('ru').toFormat('HH:mm')})
					dayStartsAt = dayStartsAt.plus({ minutes: interval });
				}
				setAvailableWeekTimes((actual) => {
					actual.push(availableTime);
					return actual;
				});
			}
			setIsDocSelected(true);
			
		})
	}, [currentDoctorId])
	// END OF ON DOCTOR SELECT CHANGE

	useEffect(() => {
		console.log("currentAdressId -- change current adress", currentAdressId);
	}, [currentAdressId])


	// TIMETABLE UPDATE FORM
	let [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	let [generalModalHeader, setGeneralModalHeader] = useState("");
	let [generalModalText, setGeneralModalText] = useState("");
	let [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);

	let updateTimetable = async (data) => {
		let res = await API.put('/doctors/timetables/'+currentDoctorId, data);
		return await res.data;
	}
	let timetableUpdateFormHandler = (e) => {
		e.preventDefault();
		setFormSubmitButtonIsLoading(true);
		let data = [];
		timetable.forEach(item => {
			if (item.time) data.push(item.time);
		})
		updateTimetable(data).then((result) => {
			setFormSubmitButtonIsLoading(false);
			setIsTimetableEdit(false);
			if(result.success) {
				setTimetableSaved(timetable);
				setGeneralModalHeader("Успешно");
				setGeneralModalText(result.message);
				setGeneralModalIsOpen(true);
			}
			else {
				setGeneralModalHeader("Ошибка");
				setGeneralModalText(result.message);
				setGeneralModalIsOpen(true);
			}
		}, 
		(error) => {
			setIsTimetableEdit(false);
			setFormSubmitButtonIsLoading(false);
			setGeneralModalHeader("Ошибка");
			setGeneralModalText("Что-то пошло не так. Мы не смогли связаться с сервером, обновите страницу и попробуйте ещё раз.");
			setGeneralModalIsOpen(true);
		})
	}
	// END OF TIMETABLE UPDATE FORM HANDLER


/*
->
[
{adress: "ул. Иванова 7", id: 3725384},
{adress: "ул. Меньшикова", id: 92733}
]

let item = arr.find(all => all.id = currentId)

<-
{adress: "ул. Меньшикова", id: 92733}
*/




	const editAdressForm = useRef(null);
	let updateAdress = async (data) => {
		let res = await API.put('/doctors', data);
		return await res.data;
	}
	let adressUpdateFormHandler = (e) => {
		console.log("adressUpdateFormHandler", adressUpdateFormHandler)
		e.preventDefault();
		setFormSubmitButtonIsLoading(true);
		let item = adressesWithFullObject.find(all => all.id === currentAdressId);
		let data = {adress: item}; // need to replace with let data = {adress: currentAdressId};
		data.idDoctor = currentDoctorId;
		updateAdress(data).then((result) => {
			setFormSubmitButtonIsLoading(false);
			setIsTimetableEdit(false);
			if(result.success) {
				setTimetableSaved(timetable);
				setGeneralModalHeader("Успешно");
				setGeneralModalText(result.message);
				setGeneralModalIsOpen(true);
			}
			else {
				setGeneralModalHeader("Ошибка");
				setGeneralModalText(result.message);
				setGeneralModalIsOpen(true);
			}
		}, 
		(error) => {
			setIsTimetableEdit(false);
			setFormSubmitButtonIsLoading(false);
			setGeneralModalHeader("Ошибка");
			setGeneralModalText("Что-то пошло не так. Мы не смогли связаться с сервером, обновите страницу и попробуйте ещё раз.");
			setGeneralModalIsOpen(true);
		})
	}





	let onSelectNewTime = (newItem, dayIndex) => {
		if(!newItem.value) return false;
		let currentTimetable = timetable.slice(0);
		currentTimetable.push({time: newItem.value, booked: false});
		setTimetable(currentTimetable);
	}

	let onChangeTime = (oldItemKey, newItem, dayIndex) => { 
		let currentTimetable = timetable.slice(0);
		if(!newItem.value) currentTimetable.splice(oldItemKey, 1);
		else currentTimetable = currentTimetable.map((item, key) => oldItemKey === key ? {time: newItem.value, booked: false} : item)
		setTimetable(currentTimetable);
	}

	return (
		<>
		<div className="mb-4">
			<h2 className="ui-section-heading mb-0">Редактировать расписание</h2>
		</div>
		<div className="UIClinicTimetable ">
			<form onSubmit={timetableUpdateFormHandler} className="row mx-0 align-items-center px-5 pt-6">
				{clinicDoctors ? <>
					{clinicDoctors.length ?
					<div className="col-8 col-lg-3">
						<Select name="category" label="Выберите врача" onChange={onDoctorSelectChange} defaultVariant={0} defaultVariantIsPlaceholder={true} variants={[{name: "Выберите врача", value: ""}].concat(clinicDoctors)} />
					</div>
					: <EmptyState text="Врачи ещё не присоединились к клинике" /> }
				</> : <BigLoadingState text="Загружаем врачей" /> }
				{isDocSelected ?
				<>
				<div className="col-lg-6 col-8 mt-5">
					
					<div className="UIClinicTimetable__carousel-control w-100">
						<div className="control-buttons d-flex justify-content-between d-lg-none w-100">
							<button className={"UIClinicTimetable-button-prev d-flex align-items-center justify-content-center"}><ChevronLeftIcon /></button>
							<button className={"UIClinicTimetable-button-next d-flex align-items-center justify-content-center"}><ChevronRightIcon /></button>
						</div>
					</div>
					<Swiper className="UIClinicTimetable__carousel" touchStartPreventDefault={false} slidesPerView={1} breakpoints={{992: {slidesPerView: "auto"}}} navigation={{prevEl: '.UIClinicTimetable-button-prev', nextEl: '.UIClinicTimetable-button-next'}} >
						{[0,1,2,3,4,5,6].map((dayItem, dayKey, dayArr) =>
							<SwiperSlide key={dayKey}>
								<div className="UIClinicTimetable-day text-center px-lg-2">
									<span className="UIClinicTimetable-day__heading d-inline-block mt-2 mt-lg-0">{DateTime.now().plus({ days: dayKey }).setLocale('ru').toFormat('dd MMMM, EEE')}</span>
									<div className="UIClinicTimetable-day__content mt-5 mt-lg-4">
										{timetable ? timetable.map((timeItem, timeKey) => {
											if(DateTime.fromISO(timeItem.time, {zone: 'local'}).toISODate() === DateTime.now().plus({ days: dayKey }).toISODate()) {
												if(!isTimetableEdit) return (<span className="time-item mb-3 d-block" key={dayArr.length + timeKey}>{DateTime.fromISO(timeItem.time, {zone: 'local'}).setLocale('ru').toFormat('HH:mm')}</span>);
												else {
													return (<div className="mb-3 d-block" key={dayArr.length + timeKey}><SelectMini onChange={(selected) => onChangeTime(timeKey, selected, dayKey)} defaultVariant={0} variants={[{name: "--:--", value: ""}].concat(availableWeekTimes[dayKey])} setSelectedVariantByValue={timeItem.time} disabled={timeItem.booked} /></div>);
												}
											} else return ("")
										}) : ""}
										{isTimetableEdit ?
											<div className="mb-3 d-block"><SelectMini onChange={(selected) => onSelectNewTime(selected, dayKey)} defaultVariant={0} variants={[{name: "--:--", value: ""}].concat(availableWeekTimes[dayKey])} /></div> 
										: ""}
									</div>
								</div>
							</SwiperSlide>
						)}
					</Swiper>
				</div>

				<div className="UIClinicTimetable__control flex-shrink-0 d-flex flex-column col-8 pt-3 pt-lg-0 col-lg-2 pl-lg-3 pl-xl-5">
					{!isTimetableEdit ?
					<button type="button" className="ui-r-main-button px-6" onClick={(e) => {e.preventDefault(); setIsTimetableEdit(true)}}>Редактировать</button>
					:
					<>
						<button className="ui-r-secondary-button d-block px-6 mb-3" onClick={() => {setTimetable(timetableSaved.slice(0)); setIsTimetableEdit(false)}}>Отменить изменения</button>
						<button type="submit" className="ui-r-main-button d-block px-6">
							<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Сохранить</span>
						</button>
					</>
					}
				</div>
				</>
				: ""}
	      	</form>
	      	<form ref={editAdressForm} onSubmit={adressUpdateFormHandler} className={`row mx-0 align-items-center  px-5 pb-6 ${(isDocSelected && props.offline) ? "mt-4 mt-lg-0" : ""}`}>
	      		{isDocSelected ? <>
					{props.offline ? <>
						{adresses ? <>
						<div className="col-8 mt-4">
							<p>Чтобы специалист мог оказывать консультации очно, у него должен быть заполнен адрес</p>
						</div>
						<div className="col-8 col-lg-3 mb-3 mb-lg-0">
							<Select name="adress" label="Выберите адрес" onChange={onAdressSelectChange} defaultVariant={adresses.findIndex(cat => cat.value === currentAdressId) + 1}  variants={[{name: "Выберите адрес", value: ""}].concat(adresses)} />
						</div>
						<div className="prompt ml-2 d-none d-lg-flex" ref={promtOpenRef} onClick={() => {setPromtOpen(true)}}><img src={prompt} alt="" /><div className={`${promtOpen ? "d-block" : "d-none"} prompt__info position-absolute p-4`}><p>Если в выпадающем списке адресов пусто, то необходимо перейти в раздел "Редактирование профиля" клиники и добавить адреса клиники, ее филиала и подразделения.</p></div></div>
						<button type="submit" className="ui-r-main-button d-block px-6 send-adress">
							<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Сохранить</span>
						</button>
						</> : <BigLoadingState text="Загружаем адреса" /> }
					</> : "" }
				</> : "" }
	      	</form>
      	</div>
      	<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
      	</>
	);
}
export default UIClinicTimetable;
