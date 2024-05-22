import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from "swiper";
import API from "../../../utils/API";
import { DateTime } from 'luxon';

// components
import SliderControl from "../../elements/SliderControl/SliderControl";
import EmptyState from "../../../elements/EmptyState/EmptyState";
import BigLoadingState from "../../../elements/BigLoadingState/BigLoadingState";

// graphics
import starFilledIcon from './starFilledIcon.svg';
import starStrokedIcon from './starStrokedIcon.svg';

// styles
import './UIReviews.scss'
// slider init
import 'swiper/swiper.scss';
SwiperCore.use([ Navigation]);

let UIReviews = () => {
	const [reviews, setReviews] = useState(null);

	// ON PAGE LOAD
	useEffect(() => {
		let getConsultations = async () => {
			let res = await API.get('/reviews');
			return await res.data;
		}
		getConsultations().then((result) => result.success ? setReviews(result.reviews) : [])
	}, [])
	// END OF ON PAGE LOAD
	
	return (
		<div className="UIReviews">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h2 className="ui-section-heading mb-0">Отзывы ({reviews ? reviews.length : 0})</h2>
				<SliderControl sliderName="UIReviews" />
			</div>
			{reviews ? <>
				{reviews.length ?
				<Swiper className="UIReviews__carousel" modules={[Navigation]} spaceBetween={15} slidesPerView={1.2} breakpoints={{450: {slidesPerView: 1.6}, 576: {slidesPerView: 1.1}, 992: {slidesPerView: 2}}} navigation={{prevEl: '.UIReviews-button-prev', nextEl: '.UIReviews-button-next'}} >
					{reviews.map((item, key) =>
					<SwiperSlide key={key}>
						<div className="UIReviews-item p-4">
							<div className="UIReviews-item__header d-flex flex-wrap justify-content-between align-items-baseline">
								<h3 className="UIReviews-item__name mb-2 mr-4">Отзыв для {item.doctorName}</h3>
								<div className="UIReviews-item__rating d-flex mb-2">
									<img src={+item.mark >= 1 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
									<img src={+item.mark >= 1.5 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
									<img src={+item.mark >= 2.5 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
									<img src={+item.mark >= 3.5 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
									<img src={+item.mark >= 4.5 ? starFilledIcon : starStrokedIcon} alt="" />
								</div>
							</div>
							<p className="UIReviews-item__text mt-2 w-100">{item.text}</p>
							<span className="UIReviews-item__date">{DateTime.fromISO(item.date, {zone: 'local'}).setLocale('ru').toFormat('dd MMMM yyyy')}</span>
						</div>
					</SwiperSlide>
					)}
				</Swiper>
				: <EmptyState text="Вы пока не оставляли отзывов" />}
			</> : <BigLoadingState text="Загружаем ваши отзывы" /> }
		</div>
	);
}

export default UIReviews; 