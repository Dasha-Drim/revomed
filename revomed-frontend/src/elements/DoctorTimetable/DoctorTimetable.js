import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { useHistory, Link, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Thumbs, Navigation, Controller } from 'swiper/core';
import { DateTime } from 'luxon';
import API from "../../utils/API";
import ContentModal from "../../utils/ContentModal/ContentModal";
import GeneralModal from "../../utils/GeneralModal/GeneralModal";
import Carousel from '../../utils/Carousel/Carousel';


// components
import EmptyState from '../../elements/EmptyState/EmptyState';

// graphics
import rightChevronIcon from './rightChevronIcon.svg';

// styles
import './DoctorTimetable.scss';

// slider init
import 'swiper/swiper.scss';
SwiperCore.use([Thumbs, Navigation, Controller]);

//const { DateTime } = lazy(() => import('luxon'));

let DoctorTimetable = (props) => {
	/*
	props.timetable - timetable array
	price.price - price of booking for all dates
	*/

	const [paymentLink, setPaymentLink] = useState("");
	const [thumbsSwiper, setThumbsSwiper] = useState(null);
	const [mainSwiper, setMainSwiper] = useState(null);
	const [buttonStartBookingIsDisabled, setButtonStartBookingIsDisabled] = useState(true);
	const [buttonWaiting, setButtonWaiting] = useState(true);
	const [currentBookingDate, setCurrentBookingDate] = useState("");
	const [currentBookingTime, setCurrentBookingTime] = useState("");
	const [currentBookingPrice, setCurrentBookingPrice] = useState("");

	// GENERAL MODAL
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL

	// WAITING LIST MODAL
	const [waitingModalHeader, setWaitingModalHeader] = useState("");
	const [waitingModalText, setWaitingModalText] = useState("");
	const [waitingModalIsOpen, setWaitingModalIsOpen] = useState(false);
	// END OF WAITING LIST MODAL

	// BOOKING MODAL
	const [contentModalIsOpen, setContentModalIsOpen] = useState(false);
	const [contentModalHeader, setContentModalHeader] = useState("Запись на консультацию");
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
	const [buttonWaitingIsLoading, setButtonWaitingIsLoading] = useState(false);
	// END OF BOOKING MODAL

	let history = useHistory();
	let location = useLocation();

	useEffect(() => {
		console.log("location", location.pathname)
	}, [])


	// POST CONSULTATIONS
	let postBookConsultation = async (data) => {
	    let res = await API.post('/consultations', data);
	    return await res.data;
	}
	// END OF POST CONSULTATIONS

	// POST WAITING LIST
	let postWaitingList = async (data) => {
	    let res = await API.post('/doctors/waiting', data);
	    return await res.data;
	}
	// END OF POST WAITING LIST


	let closeModalBookingOffline = (state) => {
		setContentModalIsOpen(state);
		if(!state) {
			document.cookie = "bookingInfo=;max-age=-1";
			history.push("/lk");
		}
	}

	let waitingRequest = () => {
		setButtonWaitingIsLoading(true);
		console.log("lll");
		let postData = new FormData();
		postData.append("idDoctor", props.docId);
		document.cookie = "bookingInfo=" + props.docId;
		postWaitingList(postData).then((result) => {
			setButtonWaitingIsLoading(false);
			if(result.success) {
				document.cookie = "bookingInfo=;max-age=-1";
				if (location.pathname === "/continue-booking") {
					setWaitingModalHeader("Успешно");
					setWaitingModalText("Врач получил вашу заявку и скоро выставит расписание. Мы уведомим Вас по СМС, когда у врача появятся свободные часы приема");
					setWaitingModalIsOpen(true);
				} else {
					setGeneralModalHeader("Успешно");
					setGeneralModalText("Врач получил вашу заявку и скоро выставит расписание. Мы уведомим Вас по СМС, когда у врача появятся свободные часы приема");
					setGeneralModalIsOpen(true);
				}
			}
			else {
				if (result.message === "Вы не авторизованы") {
					history.push("/auth");
				} else {
					document.cookie = "bookingInfo=;max-age=-1";
					setGeneralModalHeader("Ошибка");
					setGeneralModalText(result.message);
					setGeneralModalIsOpen(true);
				}
			}
		})
	}


	// BOOKING FORM HANDLER
	const bookingForm = useRef(null);
	let bookingFormHandler = (e) => {
		e.preventDefault();
		let postData = new FormData(bookingForm.current);
		postData.append("idDoctor", props.docId);
		postData.append("offline", props.offline);
		setFormSubmitButtonIsLoading(true);
		document.cookie = "bookingInfo=" + props.docId;
		postBookConsultation(postData).then((result) => {
			setFormSubmitButtonIsLoading(false);
			if(result.success) {
				setContentModalIsOpen(true);
				setPaymentLink(result.link);
				setContentModalHeader("Запись на консультацию");
			}
			else {
				if (result.message === "Забронировать консультацию может только зарегистрированный пользователь") {
					history.push("/auth");
				} else {
					document.cookie = "bookingInfo=;max-age=-1";
					setGeneralModalHeader("Ошибка");
					setGeneralModalText(result.message);
					setGeneralModalIsOpen(true);
				}
			}
		}, 
		(error) => {
			setFormSubmitButtonIsLoading(false);
			setGeneralModalHeader("Ошибка");
			setGeneralModalText("Что-то пошло не так. Мы не смогли связаться с сервером, обновите страницу и попробуйте ещё раз.");
			setGeneralModalIsOpen(true);
		})
	}
	// END OF ON BOOKING FORM HANDLER


	// POST CONSULTATIONS
	let postCancelConsultation = async (data) => {
	    let res = await API.post('/cancel/consultations', data);
	    return await res.data;
	}
	// END OF POST CONSULTATIONS


	let deleteCookie = () => {
		document.cookie = "bookingInfo=;max-age=-1";
	}


	// ON CANCEL BOOKING
	let cancelBooking = () => {
		document.cookie = "bookingInfo=;max-age=-1";
		let postData = new FormData(bookingForm.current);
		postData.append("idDoctor", props.docId);
		postCancelConsultation(postData);
	}
	// END OF ON CANCEL BOOKING


	// ON START BOOKING
	let startBooking = (dayISO, timeISO, price, priceOffline) => {
		setCurrentBookingDate(DateTime.fromISO(dayISO, {zone: 'local'}).setLocale('ru').toFormat('dd MMMM, EEEE'));
		setCurrentBookingTime(DateTime.fromISO(timeISO, {zone: 'local'}).setLocale('ru').toFormat('HH:mm'));
		setCurrentBookingPrice(price)
		setButtonStartBookingIsDisabled(false)
	}
	// END OF ON START BOOKING

	return (
		<>
		<div className="DoctorTimetable w-100">

			{props.timetable && props.timetable.length ? <>
			{props.offline && <p>Выберите время приема для визита врача в клинике и нажмите "Записаться". Оплата производится в клинике.</p>} 
			<form ref={bookingForm} onSubmit={bookingFormHandler} className="d-flex flex-column justify-content-between h-100">
				<div className="timetable-carousel">
					<Carousel className="timetable-carousel__secondary" onCarousel={(carousel) => setThumbsSwiper(carousel)} onSlideChange={(slideIndex) => {if(mainSwiper) mainSwiper.slideTo(slideIndex)}} spaceBetween={30} slidesOffsetAfter={30} >
						<slides>
							{[0,1,2,3,4,5,6].map((item, key) => 
							<span key={key} >{DateTime.now().plus({ days: item }).setLocale('ru').toFormat('dd MMMM, EEE')}</span>
							)}
						</slides>
						<next>
							<div className="d-flex align-items-center"><img src={rightChevronIcon} alt="" /></div>
						</next>
					</Carousel>
					{thumbsSwiper ?
					<Swiper className="timetable-carousel__primary" autoHeight={true} onSwiper={setMainSwiper} slidesPerView={1} onSlideChange={(swiper) => {thumbsSwiper.slideTo(swiper.activeIndex)}} >
						{[0,1,2,3,4,5,6].map((item, dayKey) =>
						<SwiperSlide key={dayKey}>
							<div className="d-flex flex-wrap py-5 day-timetable">
								{props.timetable.map((time, key) => {
									if(DateTime.fromISO(time, {zone: 'local'}).toISODate() === DateTime.now().plus({ days: dayKey }).toISODate()) {
										return (
									<label className="mr-4" key={key}>
										<input type="radio" name="date" value={time} onChange={() => startBooking(time, time, props.price, props.priceOffline)} />
										<span>{DateTime.fromISO(time, {zone: 'local'}).setLocale('ru').toFormat('HH:mm')}</span>
									</label>
									)
								} else return ("")
								})}
							</div>
						</SwiperSlide>
						)}
					</Swiper>
					: ""}
				</div>
				<div className="timetable-booking d-md-flex align-items-center justify-content-between">
					<span className="d-flex justify-content-center justify-content-md-end DoctorTimetable__timezone">Ваш часовой пояс: {DateTime.now().zoneName}</span>
					<div className="order-md-2 btn_enter text-right">
						<button type="submit" className="m-btn d-block d-md-inline-block w-100" disabled={buttonStartBookingIsDisabled}>
							<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Записаться <span className="pr-2">{!props.offline ? props.price : props.priceOffline}₽</span>{(props.oldPrice && !props.offline) && <span className="crossed-out">{props.oldPrice}₽</span>}</span>
						</button>
					</div>
					<div className={`timetable-booking__info text-center text-md-left mt-3 mt-md-0 ${currentBookingDate && currentBookingTime && currentBookingPrice ? "visible" : "invisible"}`}>
						<span>{currentBookingDate}</span>
						<span>{currentBookingTime}, {!props.offline ? props.price : props.priceOffline}₽</span>
					</div>
				</div>
			</form>
			</> : 
			<div className="d-flex flex-wrap justify-content-center py-6 text-center align-items-center">
				<p className="d-block mb-5">К сожалению, у врача нет свободных слотов для записи. Оставьте заявку. Как только специалист освободится, мы сразу же уведомим Вас по СМС</p>
				<div>
					<button className="m-btn d-block d-md-inline-block w-100" onClick={() => {waitingRequest()}}>
						<div className={!buttonWaitingIsLoading ? "d-none" : "mini-loader"}></div>
						<span className={buttonWaitingIsLoading ? "invisible" : ""}>Оставить заявку</span>
					</button>
				</div>
			</div> 
		}
		</div>

		{!paymentLink 
			?
			<ContentModal contentClassName="DoctorTimetable-modal" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => {closeModalBookingOffline(state) }} modalHeader={contentModalHeader}>
				<p className="mb-4">{currentBookingDate}, {currentBookingTime}, {currentBookingPrice}₽</p>
				<p className="mb-4">Вы забронировали очную консультацию, вы можете посмотреть всю информацию в личном кабинете</p>
	      		<a href="https://dev.unicreate.ru:3010/lk" className="m-btn d-inline-block w-100" onClick={() => {deleteCookie()}}>Перейти в личный кабинет</a>
			</ContentModal>
			:
			<ContentModal contentClassName="DoctorTimetable-modal" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => {setContentModalIsOpen(state); if(!state) cancelBooking() }} modalHeader={contentModalHeader}>
				<p className="mb-4">{currentBookingDate}, {currentBookingTime}, {currentBookingPrice}₽</p>
	      		<a href={paymentLink} className="m-btn d-inline-block w-100" onClick={() => {deleteCookie()}}>Оплатить</a>
			</ContentModal>
	}

		<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />

		<ContentModal contentClassName="DoctorTimetable-modal" modalIsOpen={waitingModalIsOpen} modalHeader={waitingModalHeader}>
			<p className="mb-4">{waitingModalText}</p>
			<Link to="/lk" className="m-btn d-inline-block w-100" onClick={() => {deleteCookie()}}>Хорошо</Link>
		</ContentModal>

		</>
	);
}

export default DoctorTimetable;

//</> : <EmptyState text="К сожалению, у врача нет свободных дат для записи" /> }
