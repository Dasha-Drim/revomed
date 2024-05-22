import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from 'swiper/core';
import ContentModal from "../../../utils/ContentModal/ContentModal";
import Carousel from '../../../utils/Carousel/Carousel';
import { DateTime } from 'luxon';
import API from "../../../utils/API";
import BigLoadingState from "../../../elements/BigLoadingState/BigLoadingState";

// components
import SliderControl from "../../elements/SliderControl/SliderControl";
import EmptyState from '../../../elements/EmptyState/EmptyState';

// graphics
import chevronRightIcon from './chevronRightIcon.svg';
import rightChevronCarouselIcon from './rightChevronCarouselIcon.svg';
import CalendarIcon from './CalendarIcon';
import ClockIcon from './ClockIcon';
import alert from './alert.svg';

// styles
import './UIDocConsultations.scss';
// slider init
import 'swiper/swiper.scss';
SwiperCore.use([ Navigation]);

let UIDocConsultations = () => {
	const [consultations, setConsultations] = useState(null);
	const [thumbsSwiper, setThumbsSwiper] = useState(null);
	const [mainSwiper, setMainSwiper] = useState(null);

	// ATTACH FILES MODAL
	const [consultationId, setConsultationId] = useState(null);
	const [contentModalIsOpen, setContentModalIsOpen] = useState(false);
	const [contentModalHeader] = useState("Просмотр файлов");
	const [filesAlreadyAttached, setFilesAlreadyAttached] = useState([]);
	// END OF ATTACH FILES MODAL


	// ON PAGE LOAD
	useEffect(() => {
		let getConsultations = async (data) => {
			let res = await API.get('/consultations', data);
			return await res.data;
		}
		getConsultations().then((result) => {
			setConsultations(result.futureConsultations);
			result.futureConsultations.forEach(item => {
				setFilesAlreadyAttached(actual => {actual[item.idConsultation] = item.files; return actual});
			})
		})
	}, [])
	// END OF ON PAGE LOAD

	return (
		<>
		<div className="UIDocConsultations">
      				<h2 className="ui-section-heading d-lg-none mb-4">Консультации ({consultations ? consultations.length : 0})</h2>
      				{consultations ? <>
	      				{consultations.length ? <>
	      				<div className="UIDocConsultations__header mb-4 d-none d-lg-flex justify-content-between align-items-center">
	      					<span>У вас назначено {consultations.length} сеанса</span>
	      					<SliderControl sliderName="UIDocConsultations" />
	      				</div>
	      				<Swiper className="UIDocConsultations__carousel" modules={[Navigation]} spaceBetween={15} slidesPerView={1.2} breakpoints={{992: {slidesPerView: 1}}} navigation={{prevEl: '.UIDocConsultations-button-prev', nextEl: '.UIDocConsultations-button-next'}} >
									{consultations.map((item, key) =>
										<SwiperSlide key={key}>

											<div className="UIDocConsultations-item">
												{item.offline &&
													<div className="info_offline w-100 p-4">
														<span className="d-flex align-items-center"><img src={alert} alt="" className="mr-3"/>Обратите внимание, что пациент записался на очный прием в клинику</span>
													</div>
												}
												<div className="d-flex flex-wrap text-center text-lg-left justify-content-center justify-content-lg-start py-5 px-4">
													<div className="d-inline-block d-lg-flex align-items-center align-content-center justify-content-between w-100">
														<h3 className="UIDocConsultations-item__name mb-3 mb-lg-0">{item.nameClient}</h3>
														<div className="UIDocConsultations-item__info d-flex justify-content-center justify-content-lg-start">
															<span className="d-flex align-items-center mr-4"><CalendarIcon color="#fff" className="mr-2" /> {DateTime.fromISO(item.date, {zone: 'local'}).setLocale('ru').toFormat('dd.LL.yyyy')}</span>
															<span className="d-flex align-items-center"><ClockIcon color="#fff" className="mr-2" /> {DateTime.fromISO(item.date, {zone: 'local'}).setLocale('ru').toFormat('HH:mm')}</span>
														</div>
													</div>
													<span className="UIDocConsultations__timezone w-100 mt-2">Часовой пояс пациента: {item.timezone}</span>
													{
														!item.offline &&
														<div className="d-lg-flex w-100 mt-4">
															<Link className="ui-main-button w-100" to={"/room/"+item.link}>Страница видеосвязи <img src={chevronRightIcon} className="ml-2" alt="" /></Link>
															{item.canFilesBeAttached ? <button className="ui-secondary-button mt-3 mt-lg-0 w-100 ml-lg-3" onClick={() => {setConsultationId(item.idConsultation); setContentModalIsOpen(true)}}>Посмотреть файлы</button> : "" }
														</div>
													}
												</div>
											</div>
										</SwiperSlide>
									)}
								</Swiper>
						</> : <EmptyState text="Консультации ещё не забронированы" /> }
					</> : <BigLoadingState text="Загружаем консультации" /> }
      			</div>
      			<ContentModal customOverlayClass="UIDocConsultations-overlay" contentClassName="UIDocConsultations-modal" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => setContentModalIsOpen(state)} modalHeader={contentModalHeader}>
      				{filesAlreadyAttached && consultationId ? <>
      				<p className="mb-4">Для улучшения качества консультации, пациент может загрузить файлы, которые могут помочь вам лучше провести консультацию</p>
      				{!filesAlreadyAttached[consultationId].length ?
      					<>
      					<span className="d-block">Пациент ещё не прикреплял файлы</span>
      					</>
      				:
	      				<div>
	      					<Carousel className="files-attached-carousel__secondary" onCarousel={(carousel) => setThumbsSwiper(carousel)} onSlideChange={(slideIndex) => {if(mainSwiper) mainSwiper.slideTo(slideIndex)}} spaceBetween={30} slidesOffsetAfter={30} >
								<slides>
									{filesAlreadyAttached[consultationId].map((item, key) => 
									<span key={key} >{item.name}</span>
									)}
								</slides>
								<next>
									<div className="d-flex align-items-center"><img src={rightChevronCarouselIcon} alt="" /></div>
								</next>
							</Carousel>
							{thumbsSwiper ?
							<Swiper className="files-attached-carousel__primary" autoHeight={true} speed={400} onSwiper={setMainSwiper} slidesPerView={1} onSlideChange={(swiper) => {thumbsSwiper.slideTo(swiper.activeIndex)}} >
								{filesAlreadyAttached[consultationId].map((item, key) => {
		      						let fileType = item.path.split(".").pop();
		      						if(fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg') {
		      							return (
		      								<SwiperSlide key={key}>
												<div className="slide-item d-flex flex-wrap pt-5">
													<img src={item.path} className="w-100" alt="" />
												</div>
											</SwiperSlide>
										);
		      						} else {
		      							return (
		      								<SwiperSlide key={key}>
												<div className="slide-item d-flex flex-wrap pt-5">
													<iframe title={key} className="w-100" src={"https://docs.google.com/gview?url=" + item.path + "&embedded=true"}></iframe>
												</div>
											</SwiperSlide>
										);
		      						}
	      						})}
							</Swiper>
							: "" }
	      				</div>
      				}
      				</> : "" }
      			</ContentModal>
      			</>
	);
}
export default UIDocConsultations;