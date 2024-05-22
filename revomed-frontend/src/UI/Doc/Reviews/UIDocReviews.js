import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from 'swiper/core';
import { DateTime } from 'luxon';
import API from "../../../utils/API";

// components
import SliderControl from "../../elements/SliderControl/SliderControl";
import EmptyState from '../../../elements/EmptyState/EmptyState';
import BigLoadingState from "../../../elements/BigLoadingState/BigLoadingState";

// graphics
import starFilledIcon from './starFilledIcon.svg';
import starStrokedIcon from './starStrokedIcon.svg';

// styles
import './UIDocReviews.scss'
// slider init
import 'swiper/swiper.scss';
SwiperCore.use([ Navigation]);

let UIDocReviews = () => {
	const [reviews, setReviews] = useState(null);

	// ON PAGE LOAD
	useEffect(() => {
		let getReviews = async (data) => {
			let res = await API.get('/reviews', data);
			return await res.data;
		}
		getReviews().then((result) => result.success ? setReviews(result.reviews) : null)
	}, [])
	// END OF ON PAGE LOAD

	return (
		<div className="UIDocReviews">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h2 className="ui-section-heading mb-0">Отзывы ({reviews ? reviews.length : 0})</h2>
				<SliderControl sliderName="UIDocReviews" />
			</div>
			{reviews ? <>
				{reviews.length ?
				<Swiper className="UIDocReviews__carousel" modules={[Navigation]} spaceBetween={15} slidesPerView={1.2} breakpoints={{450: {slidesPerView: 1.6}, 576: {slidesPerView: 1.1}, 992: {slidesPerView: 2}}} navigation={{prevEl: '.UIDocReviews-button-prev', nextEl: '.UIDocReviews-button-next'}} >
					{reviews.map((item, key) =>
					<SwiperSlide key={key}>
						<div className="UIDocReviews-item p-4">
							<div className="UIDocReviews-item__header d-flex flex-wrap justify-content-between align-items-baseline">
								<h3 className="UIDocReviews-item__name mb-2 mr-4">{item.clientName} — отзыв</h3>
								<div className="UIDocReviews-item__rating d-flex mb-2">
									<img src={+item.mark >= 1 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
									<img src={+item.mark >= 1.5 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
									<img src={+item.mark >= 2.5 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
									<img src={+item.mark >= 3.5 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
									<img src={+item.mark >= 4.5 ? starFilledIcon : starStrokedIcon} alt="" />
								</div>
							</div>
							<p className="UIDocReviews-item__text mt-2 w-100">{item.text}</p>
							<span className="UIDocReviews-item__date">{DateTime.fromISO(item.date, {zone: 'local'}).setLocale('ru').toFormat('dd MMMM yyyy')}</span>
						</div>
					</SwiperSlide>
					)}
				</Swiper>
				: <EmptyState text="Вам ещё не оставили отзывов" />}
			</> : <BigLoadingState text="Загружаем ваши отзывы" /> }
		</div>
	);
}

export default UIDocReviews; 