import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from "swiper";
import GeneralModal from "../../../utils/GeneralModal/GeneralModal";
import API from "../../../utils/API";
import { DateTime } from 'luxon';

// components
import SliderControl from "../../elements/SliderControl/SliderControl";
import EmptyState from "../../../elements/EmptyState/EmptyState";
import BigLoadingState from "../../../elements/BigLoadingState/BigLoadingState";

// graphics
import CalendarIcon from './CalendarIcon';
import ClockIcon from './ClockIcon';
import repeatIcon from './repeatIcon.svg';

// styles
import './UIHistory.scss';
// slider init
import 'swiper/swiper.scss';
SwiperCore.use([ Navigation]);

let UIHistory = () => {
	const [history, setHistory] = useState(null);

	// RECOMMENDATION MODAL
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader] = useState("Рекомендация от специалиста");
	const [generalModalText, setGeneralModalText] = useState("");
	// END OF RECOMMENDATION MODAL


	// ON PAGE LOAD
	useEffect(() => {
		let getConsultations = async (data) => {
			let res = await API.get('/consultations', data);
			return await res.data;
		}
		getConsultations().then((result) => result.success ? setHistory(result.pastConsultations) : null)
	}, [])
	// END OF ON PAGE LOAD

	return (
		<>
		<div className="UIHistory">
							<div className="d-flex justify-content-between align-items-center mb-4">
								<h2 className="ui-section-heading mb-0">История ({history ? history.length : 0})</h2>
								<SliderControl sliderName="UIHistory" />
							</div>
							{history ? <>
								{history.length ?
								<Swiper className="UIHistory__carousel" modules={[Navigation]} spaceBetween={15} slidesPerView={1.2} breakpoints={{450: {slidesPerView: 1.6}, 576: {slidesPerView: 1.1}, 992: {slidesPerView: 2}}} navigation={{prevEl: '.UIHistory-button-prev', nextEl: '.UIHistory-button-next'}} >
									{history.map((item, key) =>
										<SwiperSlide key={key}>
											<div className="UIHistory-item p-4">
												<div className="UIHistory-item__header d-flex justify-content-between align-items-baseline">
													<div>
														<h3 className="UIHistory-item__name mb-0">{item.nameDoctor}{item.offline && <span>В клинике</span>}</h3>
														<span className="UIHistory-item__specialization">{item.specialization}</span>
													</div>
													<Link to={"/doctor/"+item.doctorId} className="repeat-button"><img src={repeatIcon} alt="" /></Link>
												</div>
												<div className="UIHistory-item__content mt-4 mb-1 d-flex flex-wrap align-items-center">
													<span className="mr-3 mb-3">{item.price}₽</span>
													<span className="mr-3 mb-3 d-flex align-items-center"><CalendarIcon color="#9B9BAB" className="mr-2" /> {DateTime.fromISO(item.date, {zone: 'local'}).setLocale('ru').toFormat('dd.LL.yyyy')}</span>
													<span className="mr-3 mb-3 d-flex align-items-center"><ClockIcon color="#9B9BAB" className="mr-2" /> {DateTime.fromISO(item.date, {zone: 'local'}).setLocale('ru').toFormat('HH:mm')}</span>
												</div>
												{item.recommendation ? <button onClick={() => {setGeneralModalText(item.recommendation); setGeneralModalIsOpen(true)}} className="ui-secondary-button w-100">Посмотреть рекомендацию</button> : "" }
											</div>
										</SwiperSlide>
									)}
								</Swiper>
								: <EmptyState text="Ещё нет прошедших сеансов" /> }
						</> : <BigLoadingState text="Загружаем прошедшие сеансы" /> }
      			</div>

      			<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
      			</>
	);
}
export default UIHistory;