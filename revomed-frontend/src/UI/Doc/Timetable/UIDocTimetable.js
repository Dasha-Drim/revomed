import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from 'swiper/core';
import { DateTime } from 'luxon';
import API from "../../../utils/API";
import GeneralModal from "../../../utils/GeneralModal/GeneralModal";

// components
import SelectMini from "../../../atoms/SelectMini/SelectMini";

// graphics
import ChevronLeftIcon from "./ChevronLeftIcon";
import ChevronRightIcon from "./ChevronRightIcon";

// styles
import './UIDocTimetable.scss';
// slider init
import 'swiper/swiper.scss';
SwiperCore.use([ Navigation]);

let UIDocTimetable = (props) => {
	const [isTimetableEdit, setIsTimetableEdit] = useState(false);
	const [availableWeekTimes, setAvailableWeekTimes] = useState([]);
	const [timetable, setTimetable] = useState([]);
	const [timetableSaved, setTimetableSaved] = useState([]);

	// ON PAGE LOAD
	useEffect(() => {
		let getTimetable = async (data) => {
			let res = await API.get('/doctors/timetables/'+props.userId);
			return await res.data;
		}
		getTimetable().then((result) => {
			setTimetableSaved(result.timetable);
			setTimetable(result.timetable);
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
		})
	}, [props.userId])
	// END OF ON PAGE LOAD


	// TIMETABLE UPDATE FORM
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);

	let updateTimetable = async (data) => {
		let res = await API.put('/doctors/timetables/'+props.userId, data);
		return await res.data;
	}
	let timetableUpdateFormHandler = (e) => {
		e.preventDefault();
		setFormSubmitButtonIsLoading(true);
		let data = [];
		timetable.forEach(item => {
			data.push(item.time);
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
	// END OF TIMETABLE UPDATE FORM

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
		<div className="UIDocTimetableContainer">
		<div className="mb-4">
			<h2 className="ui-section-heading mb-0">Редактировать расписание</h2>
		</div>
		<form onSubmit={timetableUpdateFormHandler} className="UIDocTimetable row mx-0 align-items-center px-5 py-6">
			<div className="col-lg-6 col-8">
				<div className="UIDocTimetable__carousel-control w-100">
					<div className="control-buttons d-flex justify-content-between d-lg-none w-100">
						<button className={"UIDocTimetable-button-prev d-flex align-items-center justify-content-center"}><ChevronLeftIcon /></button>
						<button className={"UIDocTimetable-button-next d-flex align-items-center justify-content-center"}><ChevronRightIcon /></button>
					</div>
				</div>
				<Swiper className="UIDocTimetable__carousel"  modules={[Navigation]} touchStartPreventDefault={false} slidesPerView={1} breakpoints={{992: {slidesPerView: "auto"}}} navigation={{prevEl: '.UIDocTimetable-button-prev', nextEl: '.UIDocTimetable-button-next'}} >
					{[0,1,2,3,4,5,6].map((dayItem, dayKey, dayArr) =>
						<SwiperSlide key={dayKey}>
							<div className="UIDocTimetable-day text-center px-lg-2">
								<span className="UIDocTimetable-day__heading d-inline-block mt-2 mt-lg-0">{DateTime.now().plus({ days: dayKey }).setLocale('ru').toFormat('dd MMMM, EEE')}</span>
								<div className="UIDocTimetable-day__content mt-5 mt-lg-4">
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

			<div className="UIDocTimetable__control flex-shrink-0 d-flex flex-column col-8 pt-3 pt-lg-0 col-lg-2 pl-lg-3 pl-xl-5">
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
      	</form>
      	</div>
      	<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
      	</>
	);
}
export default UIDocTimetable;

/*{DateTime.fromISO(item.date, {zone: 'local'}).setLocale('ru').toFormat('dd MMMM yyyy')}*/