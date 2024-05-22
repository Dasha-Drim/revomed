import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from "swiper";
import { FormValidation } from "../../../utils/FormValidation";
import API from "../../../utils/API";
import ContentModal from "../../../utils/ContentModal/ContentModal";
import GeneralModal from "../../../utils/GeneralModal/GeneralModal";
import { DateTime } from 'luxon';

// components
import SliderControl from "../../elements/SliderControl/SliderControl";
import FileUploadInput from "../../../atoms/FileUploadInput/FileUploadInput";
import EmptyState from "../../../elements/EmptyState/EmptyState";
import BigLoadingState from "../../../elements/BigLoadingState/BigLoadingState";

// graphics
import chevronRightIcon from './chevronRightIcon.svg';
import CalendarIcon from './CalendarIcon';
import ClockIcon from './ClockIcon';

// styles
import './UIUserConsultations.scss';
// slider init
import 'swiper/swiper.scss';
SwiperCore.use([ Navigation]);

let UIUserConsultations = () => {
	const [consultations, setConsultations] = useState(null);
	const [consultationId, setConsultationId] = useState(null);
	const [errors, setErrors] = useState({});
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);

	// ATTACH FILES MODAL
	const [contentModalIsOpen, setContentModalIsOpen] = useState(false);
	const [contentModalHeader] = useState("Прикрепить файлы");
	const [filesAlreadyAttached, setFilesAlreadyAttached] = useState([]);
	// END OF ATTACH FILES MODAL


	// ON PAGE LOAD
	useEffect(() => {
		let getConsultations = async (data) => {
			let res = await API.get('/consultations', data);
			return await res.data;
		}
		getConsultations().then((result) => {
			if(result.success) {
				setConsultations(result.futureConsultations);
				result.futureConsultations.forEach(item => {
					setFilesAlreadyAttached(actual => {actual[item.idConsultation] = !!item.files.length; return actual});
				})
			}
		})
	}, [])
	// END OF ON PAGE LOAD


	// GET POST CONSULTATION FILES
	let postConsultationFiles = async (data) => {
		let res = await API.post('/consultations/files', data);
		return await res.data;
	}
	// END OF GET POST CONSULTATION FILES


	// ATTACH FILES FORM
	const attachFilesForm = useRef(null);
	let attachFilesFormHandler = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(attachFilesForm);
		setErrors(currentFormErrors);
		if(!Object.keys(currentFormErrors).length) {
			setFormSubmitButtonIsLoading(true);
			let postData = new FormData(attachFilesForm.current);
			postConsultationFiles(postData).then((result) => {
				setFormSubmitButtonIsLoading(false);
				setContentModalIsOpen(false);
				if(result.success) {
					setGeneralModalHeader("Успешно");
					setGeneralModalText(result.message);
					setGeneralModalIsOpen(true);
					setFilesAlreadyAttached(actual => {console.log("actual", actual); actual[postData.get("idConsultation")] = true; return actual});
				}
				else {
					setGeneralModalHeader("Ошибка");
					setGeneralModalText(result.message);
					setGeneralModalIsOpen(true);
				}
			}, 
			(error) => {
				setFormSubmitButtonIsLoading(false);
				setContentModalIsOpen(false);
				setGeneralModalHeader("Ошибка");
				setGeneralModalText("Что-то пошло не так. Мы не смогли связаться с сервером, обновите страницу и попробуйте ещё раз.");
				setGeneralModalIsOpen(true);
			})
		}
	}
	// END OF ATTACH FILES FORM

	return (
		<>
		<div className="UIUserConsultations">
      				<h2 className="ui-section-heading d-lg-none mb-4">Консультации ({consultations ? consultations.length : 0})</h2>
      				{consultations ? <>
	      				{consultations.length ? <>
	      				<div className="UIUserConsultations__header mb-4 d-none d-lg-flex justify-content-between align-items-center">
	      					<span>У вас назначено {consultations.length} сеанса</span>
	      					<SliderControl sliderName="UIUserConsultations" />
	      				</div>
	      				<Swiper className="UIUserConsultations__carousel" modules={[Navigation]} spaceBetween={15} slidesPerView={1.2} breakpoints={{992: {slidesPerView: 1}}} navigation={{prevEl: '.UIUserConsultations-button-prev', nextEl: '.UIUserConsultations-button-next'}} >
									{consultations.map((item, key) =>
										<SwiperSlide key={key}>
											<div className="UIUserConsultations-item ">
												{
													item.offline &&
													<div className="info_offline w-100 p-4 d-none d-lg-block">
														<span className="clinicName d-block mb-1">Очный приём в клинике "{item.clinicName}"</span>
														<span className="adress d-block">{item.adress}</span>
													</div>
												}
												<div className="info d-flex flex-wrap text-center text-lg-left justify-content-center justify-content-lg-start mt-lg-0 px-4 pt-lg-4">
													<div className="d-flex">
														<img className="UIUserConsultations-item__avatar" src={item.avatarFile} alt="" />
														<div className="d-inline-block d-lg-flex flex-column justify-content-between ml-lg-4">
															<div className="d-flex flex-wrap justify-content-center justify-content-lg-start">
																<h3 className="UIUserConsultations-item__name mt-3 mb-1">{item.nameDoctor}</h3>
																<span className="UIUserConsultations-item__specialization w-100">{item.category}</span>
															</div>
															<div className="UIUserConsultations-item__info d-flex justify-content-center justify-content-lg-start mb-4 mt-2">
																<div className="mr-2">
																	<h4 className="d-none d-lg-block">Дата сессии</h4>
																	<span className="d-flex align-items-center"><CalendarIcon color="#fff" className="mr-2 d-lg-none" /> {DateTime.fromISO(item.date, {zone: 'local'}).setLocale('ru').toFormat('dd.LL.yyyy')}</span>
																</div>
																<div className="ml-2">
																	<h4 className="d-none d-lg-block">Время</h4>
																	<span className="d-flex align-items-center"><ClockIcon color="#fff" className="mr-2 d-lg-none" /> {DateTime.fromISO(item.date, {zone: 'local'}).setLocale('ru').toFormat('HH:mm')}</span>
																</div>
															</div>
														</div>
													</div>
													<div className="d-lg-flex w-100 mb-4">
														{
															!item.offline ? <>
															<Link className="ui-main-button w-100 mt-4" to={"/room/"+item.link}>Страница видеосвязи <img src={chevronRightIcon} className="ml-2" alt="" /></Link>
															{item.canFilesBeAttached ? <button className="ui-secondary-button w-100 mt-4 ml-lg-3" onClick={() => {setConsultationId(item.idConsultation); setContentModalIsOpen(true)}}>Прикрепить файлы</button> : "" }
															</> : 
															<div className="info_offline w-100 p-3 mt-1 d-lg-none">
																<span className="clinicName d-block mb-1">Очный приём в клинике {item.clinicName}</span>
																<span className="adress d-block">{item.adress}</span>
															</div>
														}
													</div>
												</div>
											</div>
										</SwiperSlide>
									)}
								</Swiper>
						</> : <EmptyState text="Вы ещё не забронировали ни одной консультации" /> }
					</> : <BigLoadingState text="Загружаем консультации" /> }

      			</div>
      			<ContentModal contentClassName="UIUserConsultations-modal" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => setContentModalIsOpen(state)} modalHeader={contentModalHeader}>
      				<p className="mb-4">Для улучшения качества консультации, вы можете загрузить файлы, которые могут помочь врачу лучше провести консультацию с Вами</p>
      				{filesAlreadyAttached[consultationId] ?
      					<>
      					<span className="d-block">Вы уже отправили файлы врачу</span>
      					<button className="button-upload-another-files mt-2" onClick={() => setFilesAlreadyAttached(actual => {actual[consultationId] = false; return actual})}>Отправить файлы заново</button>
      					</>
      				:
	      				<form ref={attachFilesForm} onSubmit={attachFilesFormHandler}>
	      					<input type="hidden" name="idConsultation" value={consultationId} />
	      					<FileUploadInput mergeAttaches={true} label="Прикрепите любые файлы" name="files" errors={errors} validation="fileAttached" />
	      					<button type="submit" className="m-btn w-100 mt-5 d-flex justify-content-center" disabled={formSubmitButtonIsLoading}>
								<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
								<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Отправить</span>
							</button>
	      				</form>
      				}
      			</ContentModal>
      			<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
      			</>
	);
}
export default UIUserConsultations;