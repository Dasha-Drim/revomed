import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from 'swiper/core';
import { DateTime } from 'luxon';

// graphics
import chevronLeftIcon from './chevronLeftIcon.svg';
import chevronRightIcon from './chevronRightIcon.svg';
import starFilledIcon from './starFilledIcon.svg';
import starStrokedIcon from './starStrokedIcon.svg';

// styles
import './ReviewsSlider.scss';

// slider init
import 'swiper/swiper.scss';
SwiperCore.use([Navigation]);

let ReviewsSlider = (props) => {
	/*
	props.reviews - array with reviews data
	props.slidesPerColumn
	props.slidesPerRow
	*/

	return (
		<div className="ReviewsSlider p-5">
			<div className="ReviewsSlider__header d-flex justify-content-between align-items-center">
				<h2 className="mb-0">Отзывы ({props.reviews.length})</h2>
				<div className="ReviewsSlider__control d-flex">
					<button className="swiper-button-prev d-flex align-items-center justify-content-center mr-3"><img src={chevronLeftIcon} alt="" /></button>
					<button className="swiper-button-next d-flex align-items-center justify-content-center"><img src={chevronRightIcon} alt="" /></button>
				</div>
			</div>
			{props.reviews.length ?
			<Swiper className="ReviewsSlider__carousel" slidesPerColumnFill="row" slidesPerColumn={1} spaceBetween={30} slidesPerView={1} breakpoints={{768: {slidesPerView: props.slidesPerRow || 1, slidesPerColumn: props.slidesPerColumn || 1}}} navigation={{prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next'}} >
				{props.reviews.map((item, key) =>
				<SwiperSlide key={key}>
					<div className="carousel-item d-flex flex-wrap py-5">
						<h4 className="carousel-item__author mb-0">{item.clientName}</h4>
						<div className="carousel-item__rating d-flex ml-4">
							<img src={+item.mark >= 1 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
							<img src={+item.mark >= 1.5 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
							<img src={+item.mark >= 2.5 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
							<img src={+item.mark >= 3.5 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
							<img src={+item.mark >= 4.5 ? starFilledIcon : starStrokedIcon} alt="" />
						</div>
						{item.nameDoctor && <span class="d-block w-100 mt-2">Отзыв о специалисте {item.nameDoctor}</span>}
						<p className="reviews-carousel-item__text mt-3 w-100">{item.text}</p>
						<span className="reviews-carousel-item__date">{DateTime.fromISO(item.date, {zone: 'local'}).setLocale('ru').toFormat('dd MMMM yyyy')}</span>
					</div>
				</SwiperSlide>
				)}
			</Swiper>
			: "" }
		</div>
	);
}

export default ReviewsSlider;