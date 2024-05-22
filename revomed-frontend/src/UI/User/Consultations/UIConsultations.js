import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from 'swiper/core';
import { FormValidation } from "../../../utils/FormValidation";
import API from "../../../utils/API";
import ContentModal from "../../../utils/ContentModal/ContentModal";
import GeneralModal from "../../../utils/GeneralModal/GeneralModal";

// components
import SliderControl from "../../elements/SliderControl/SliderControl";
import FileUploadInput from "../../../atoms/FileUploadInput/FileUploadInput";

import chevronRightIcon from './chevronRightIcon.svg';
import CalendarIcon from './CalendarIcon';
import ClockIcon from './ClockIcon';
import './UIConsultations.scss';
// slider init
import 'swiper/swiper.scss';
SwiperCore.use([ Navigation]);

let UIConsultations = () => {
	// ATTACH FILES MODAL
	let [contentModalIsOpen, setContentModalIsOpen] = useState(false);
	let [contentModalHeader, setContentModalHeader] = useState("Прикрепить файлы");
	let [filesAlreadyAttached, setFilesAlreadyAttached] = useState(true);

	useEffect(() => {
		if(!contentModalIsOpen) setFilesAlreadyAttached(true);
	}, [contentModalIsOpen])
	// END OF ATTACH FILES MODAL

	let consultations = [0,1,2];

	// ATTACH FILES FORM
	let [errors, setErrors] = useState({});
	let [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	let [generalModalHeader, setGeneralModalHeader] = useState("");
	let [generalModalText, setGeneralModalText] = useState("");
	let [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
	let attachFilesForm = useRef(null);

	let postConsultationFiles = async (data) => {
		let res = await API.post('/clinics', data);
		return await res.data;
	}
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
		<div className="UIConsultations">
      				<h2 className="ui-section-heading d-lg-none mb-4">Консультации ({consultations.length})</h2>
      				<div className="UIConsultations__header mb-4 d-none d-lg-flex justify-content-between align-items-center">
      					<span>У вас назначено {consultations.length} сеанса</span>
      					<SliderControl sliderName="UIConsultations" />
      				</div>
      				<Swiper className="UIConsultations__carousel" modules={[Navigation]} spaceBetween={15} slidesPerView={1.2} breakpoints={{992: {slidesPerView: 1}}} navigation={{prevEl: '.UIConsultations-button-prev', nextEl: '.UIConsultations-button-next'}} >
								{consultations.map((item, key) =>
									<SwiperSlide key={key}>
										<div className="UIConsultations-item d-flex flex-wrap text-center text-lg-left justify-content-center justify-content-lg-start pb-4 px-4 mt-lg-0 pt-lg-4">
											<img className="UIConsultations-item__avatar" src="https://revomed.ru/uploads/7y018zr-1618321112981.jpeg" alt="" />
											<div className="d-inline-block d-lg-flex flex-column justify-content-between ml-lg-4">
												<div className="d-flex flex-wrap justify-content-center justify-content-lg-start">
													<h3 className="UIConsultations-item__name mt-3 mb-1">Фаттахова Фарида</h3>
													<span className="UIConsultations-item__specialization w-100">Гинекология</span>
												</div>
												<div className="UIConsultations-item__info d-flex justify-content-center justify-content-lg-start mb-4 mt-2">
													<div className="mr-2">
														<h4 className="d-none d-lg-block">Дата сессии</h4>
														<span className="d-flex align-items-center"><CalendarIcon color="#fff" className="mr-2 d-lg-none" /> 23.05.2020</span>
													</div>
													<div className="ml-2">
														<h4 className="d-none d-lg-block">Время</h4>
														<span className="d-flex align-items-center"><ClockIcon color="#fff" className="mr-2 d-lg-none" /> 14:00</span>
													</div>
												</div>
											</div>
											<div className="d-lg-flex w-100 mt-4">
												<Link className="ui-main-button w-100 mb-3 mb-lg-0 mr-lg-3" to="/room">Страница видеосвязи <img src={chevronRightIcon} className="ml-2" alt="" /></Link>
												<button className="ui-secondary-button w-100" onClick={() => setContentModalIsOpen(true)}>Прикрепить файлы</button>
											</div>
										</div>
									</SwiperSlide>
								)}
							</Swiper>
      			</div>
      			<ContentModal contentClassName="UIConsultations-modal" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => setContentModalIsOpen(state)} modalHeader={contentModalHeader}>
      				<p className="mb-4">Для улучшения качества консультации, вы можете загрузить файлы, которые могут помочь врачу лучше провести консультацию с Вами</p>
      				{filesAlreadyAttached ?
      					<>
      					<span className="d-block">Вы уже отправили файлы врачу</span>
      					<a href="#" onClick={() => setFilesAlreadyAttached(false)}>Отправить файлы заново</a>
      					</>
      				:
	      				<form ref={attachFilesForm} onSubmit={attachFilesFormHandler}>
	      					<FileUploadInput label="Прикрепите любые файлы" name="file" errors={errors} validation="fileAttached" />
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
export default UIConsultations;