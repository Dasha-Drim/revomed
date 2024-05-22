import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Thumbs, Navigation } from 'swiper/core';
import { DateTime, Interval } from 'luxon';
import API from "../../../utils/API";

// components
import EmptyState from "../../../elements/EmptyState/EmptyState";
import BigLoadingState from "../../../elements/BigLoadingState/BigLoadingState";

// graphics
import chevronLeftIcon from './chevronLeftIcon.svg';
import chevronRightIcon from './chevronRightIcon.svg';
import calendarIcon from './calendarIcon.svg';
import inProcessIcon from './inProcessIcon.svg';
import successIcon from './successIcon.svg';
import canceledIcon from './canceledIcon.svg';

// styles
import './UIClinicHistory.scss';

import 'swiper/swiper.scss';
SwiperCore.use([Thumbs, Navigation]);


let UIClinicHistory = () => {
	const [pastConsultations, setPastConsultations] = useState(null);
	const [monthConsultationsProfit, setMonthConsultationsProfit] = useState(Array(13).fill(0));
	const [monthConsultationsCounter, setMonthConsultationsCounter] = useState(Array(13).fill(0));
	const [currentSlideIndex, setCurrentSlideIndex] = useState(null);
	const [monthsInterval, setMonthsInterval] = useState([]);


	// ON PAGE LOAD
	useEffect(() => {
		let getConsultations = async (data) => {
			let res = await API.get('/consultations', data);
			return await res.data;
		}
		getConsultations().then((result) => {
			// generate months
			let startOfThisMonth = DateTime.now().startOf('month');
			let intervals = [];
			for(let i = 12; i >= 0; i--) {
				let month = Interval.fromDateTimes(startOfThisMonth.minus({months: i}), startOfThisMonth.minus({months: i-1}));
				intervals.push(month);
				// all sessions in this month
				let sessionsThisMonth = result.pastConsultations.filter(consultation => !!month.contains(DateTime.fromISO(consultation.date, {zone: 'local'})));
				// get profit for this month
				let profit = sessionsThisMonth.reduce((sum, current) => sum + current.profit, 0);
				setMonthConsultationsProfit(actual => {actual[12-i] = profit; return actual});
				// count transactions for this month
				let counter = sessionsThisMonth.length;
				setMonthConsultationsCounter(actual => {actual[12-i] = counter; return actual});
			}
			setMonthsInterval(intervals)

			return result.success ? setPastConsultations(result.pastConsultations) : [];
		})
	}, [])
	// END OF ON PAGE LOAD


	return (
		<div className="UIClinicHistory">
			<div className="mb-4">
				<h2 className="ui-section-heading mb-0">Поступления {currentSlideIndex !== null ? <> {monthsInterval[currentSlideIndex].s.setLocale('ru').toFormat('LLLL')}: {monthConsultationsProfit[currentSlideIndex]}₽ за {monthConsultationsCounter[currentSlideIndex]} сессий </> : "" }</h2>
			</div>
			<div className="content row mx-0 px-5 py-6">
			{pastConsultations ? <>
				<div className="clinic-history-slider-control d-flex">
					<button className="clinic-history-slider-button-prev d-flex align-items-center justify-content-center"><img src={chevronLeftIcon} alt="" /></button>
					<div className="clinic-history-slider-control__current-month d-flex align-items-center mx-3 px-4">
						<img src={calendarIcon} className="mr-2" alt="" />
						{currentSlideIndex !== null ? <span>{monthsInterval[currentSlideIndex].s.setLocale('ru').toFormat('LLLL yyyy')}</span> : ""}
					</div>
					<button className="clinic-history-slider-button-next d-flex align-items-center justify-content-center"><img src={chevronRightIcon} alt="" /></button>
				</div>
				{monthsInterval.length ?
				<Swiper className="clinic-history-slider" slidesPerView={1} autoHeight={true} onSlideChange={(swiper) => {console.log("swiper.activeIndex", swiper.activeIndex); setCurrentSlideIndex(swiper.activeIndex)}} initialSlide={monthsInterval.length-1} touchStartPreventDefault={false} navigation={{prevEl: '.clinic-history-slider-button-prev', nextEl: '.clinic-history-slider-button-next'}} >
					{monthsInterval.map((monthItem, monthKey, monthArr) => {
						let isSessionsThisMonth = pastConsultations.find(consultation => !!monthItem.contains(DateTime.fromISO(consultation.date, {zone: 'local'})));
						return (
						<SwiperSlide key={monthKey}>
							<div className="clinic-history-slide px-lg-2 w-100 mt-5">
								{pastConsultations.map((item, key) => {
									if( monthItem.contains(DateTime.fromISO(item.date, {zone: 'local'})) ) {
										return (
											<div key={monthArr.length + key+1} className="history-item row justify-content-between align-items-center mb-5">
												<div className="order-0 col-6 col-md-3 col-lg-2">
													<h3 className="history-item__main-heading mb-0">{item.nameDoctor}{item.offline && <span>В клинике</span>}</h3>
													<span className="history-item__inscription">{item.academicDegree}</span>
												</div>
												<div className="mt-4 mt-lg-0 order-2 order-lg-0 col-8 col-lg-4 d-flex justify-content-between">
													<div>
														<h4 className="history-item__heading">Дата сессии</h4>
														<span className="history-item__data">{DateTime.fromISO(item.date, {zone: 'local'}).setLocale('ru').toFormat('dd MMMM yyyy')}</span>
													</div>

													<div className="d-none d-sm-block">
														<h4 className="history-item__heading">Стоимость</h4>
														<span className="history-item__data">{item.price}₽</span>
													</div>

													<div className="d-none d-sm-block">
														<h4 className="history-item__heading">Комиссия</h4>
														<span className="history-item__data">{item.commission}₽</span>
													</div>

													<div>
														<h4 className="history-item__heading">Прибыль</h4>
														<span className="history-item__data">{item.profit}₽</span>
													</div>
												</div>
												<div className="order-1 order-lg-0 col-2 col-md-1 d-flex justify-content-end">
													<div className="history-item__status">
														<img src={inProcessIcon} alt="" />
													</div>
												</div>
											</div>
										)
									} else return ("")
								})}
								{!isSessionsThisMonth ? <EmptyState text="В этом месяце не было консультаций" /> : ""}
							</div>
						</SwiperSlide>
						)})}
				</Swiper>
				: "" }
				</> : <BigLoadingState text="Загружаем историю консультаций" /> }
			</div>
			
		</div>

		
	);
}

export default UIClinicHistory;