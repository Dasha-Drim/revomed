import { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Thumbs, Navigation } from 'swiper/core';

import SliderControl from "../../elements/SliderControl/SliderControl";

// styles
import './SliderSubcategories.scss';

import 'swiper/swiper.scss';
SwiperCore.use([Thumbs, Navigation]);

let SliderSubcategories = (props) => {

  return (
    

    <div className="SliderSubcategories">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h2 className="ui-section-heading mb-0">{props.title}</h2>
				<SliderControl sliderName={"SliderSubcategories"+props.id} />
			</div>
			{props.items ? <>
				{props.items.length ?
				<Swiper className="UIReviews__carousel" spaceBetween={15} slidesPerView={1.6} breakpoints={{450: {slidesPerView: 1.8}, 576: {slidesPerView: 2.2}, 768: {slidesPerView: 3}, 992: {slidesPerView: 4}}} navigation={{prevEl: '.SliderSubcategories'+props.id+'-button-prev', nextEl: '.SliderSubcategories'+props.id+'-button-next'}} >
					{props.items.map((item, key) =>
					<SwiperSlide key={key}>
						<Link to={"/lk/subcategory/"+item.url}>
							<div className="photo__holder position-relative">
								<div className="image" style={{"backgroundColor": "#E9EAFE", "backgroundImage": "url("+item.photo+")", "backgroundSize": "cover", "backgroundPosition": "center"}}></div>
								<div className="position-absolute overlay"></div>
							</div>
							<div className="p-4 name__holder">
								<h3>{item.name}</h3>
							</div>
						</Link>
					</SwiperSlide>
					)}
				</Swiper>
				: ""}
			</> : "" }
		</div>
  );
}

export default SliderSubcategories;