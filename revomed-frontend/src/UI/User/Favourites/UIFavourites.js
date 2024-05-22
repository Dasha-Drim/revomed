import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from "swiper";
import API from "../../../utils/API";

// components
import DoctorCardMini from "../../../blocks/DoctorCardMini/DoctorCardMini";
import SliderControl from "../../elements/SliderControl/SliderControl";
import EmptyState from "../../../elements/EmptyState/EmptyState";
import BigLoadingState from "../../../elements/BigLoadingState/BigLoadingState";

// styles
import './UIFavourites.scss';
// slider init
import 'swiper/swiper.scss';
SwiperCore.use([ Navigation]);

let UIFavourites = () => {
	const [favorites, setFavorites] = useState(null);

	// ON PAGE LOAD
	useEffect(() => {
		let getFavorites = async () => {
			let res = await API.get('/clients/favorites');
			return await res.data;
		}
		getFavorites().then((result) => result.success ? setFavorites(result.doctors) : [])
	}, [])
	// END OF ON PAGE LOAD
	return (
		<div className="UIFavourites">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h2 className="ui-section-heading mb-0">В избранном ({favorites ? favorites.length : 0})</h2>
				<SliderControl sliderName="UIFavourites" />
			</div>
			{favorites ? <>
				{favorites.length ?
				<Swiper className="UIFavourites__carousel" spaceBetween={30} modules={[Navigation]} breakpoints={{368: {slidesPerView: 1.5}, 420: {slidesPerView: 1.7}, 480: {slidesPerView: 1.8}, 576: {slidesPerView: 2, spaceBetween: 30}, 768: {slidesPerView: 3}, 992: {slidesPerView: 4}}} slidesPerView={1.2} navigation={{prevEl: '.UIFavourites-button-prev', nextEl: '.UIFavourites-button-next'}} >
					{favorites.map((item, key) =>
					<SwiperSlide key={key} >
						<DoctorCardMini doctorData={item} />
					</SwiperSlide>
					)}
				</Swiper>
				: <EmptyState text="Пока нет врачей в избранном" />}
			</> : <BigLoadingState text="Загружаем избранное" /> }
		</div>
	);
}
export default UIFavourites;