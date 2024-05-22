import { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from 'swiper/core';
import API from "../utils/API";
import ENVIRONMENT from '../utils/ENVIRONMENT';
import SEO from "../utils/SEO";
import ContentModal from "../utils/ContentModal/ContentModal";
import { browserName, browserVersion, osVersion, osName } from 'react-device-detect';

// components
import Description from "../blocks/Description/Description";
import DoctorCard from "../blocks/DoctorCard/DoctorCard";
import ReviewsSlider from "../blocks/ReviewsSlider/ReviewsSlider";
import OwnBlog from "../blocks/OwnBlog/OwnBlog";

import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

//graphics
import chevronLeftIcon from './img/chevronLeftIcon.svg';
import chevronRightIcon from './img/chevronRightIcon.svg';
import filials from './img/filials.svg';

// styles
import './Clinic.scss';

// slider init
import 'swiper/swiper.scss';
SwiperCore.use([Navigation]);

let Clinic = (props) => {
	const [clinicData, setClinicData] = useState(null);
	const [checkups, setCheckups] = useState([])

	const [adresses, setAdresses] = useState([{name: "44 филиал", value: "г Москва, Ленинградский проспект, 13"}, {name: "Основный филиал", value: "г Москва, Ленинградский проспект, 13"}, {name: "Филиал Химки", value: "г Химки, Главный проспект, 133"}]);
	const [contentModalIsOpen, setContentModalIsOpen] = useState(false);
  	const [contentModalHeader] = useState("Адреса клиники");

	// ON PAGE LOAD
	let history = useHistory();
	useEffect(() => {
		document.cookie = "bookingInfo=;max-age=-1";
		// get clinic catalog
		let getClinic = async () => {
			let res = await API.get('/clinics/'+props.match.params.clinicId, {params: {public: true}});
			return await res.data;
		}
		getClinic().then((result) => setClinicData(result.clinic), (error) => error.response.status === 404 ? history.replace("/404") : null)

		let getCheckups = async () => {
			let res = await API.get('/clinics/checkups', {params: {idClinic: props.match.params.clinicId}});
			return await res.data;
		}
		getCheckups().then((result) => setCheckups(result.checkups), (error) => {
			setCheckups([]);
		})
	}, [history, props.match.params.clinicId])
	// END OF ON PAGE LOAD

	let declOfNum = (n, text_forms) => {  
	    n = Math.abs(n) % 100; 
	    var n1 = n % 10;
	    if (n > 10 && n < 20) { return text_forms[2]; }
	    if (n1 > 1 && n1 < 5) { return text_forms[1]; }
	    if (n1 == 1) { return text_forms[0]; }
	    return text_forms[2];
	}

  return (
    <div className="Clinic">
    	
    	<div className="container py-7">
    	{clinicData ? <>
    		<SEO pageProps={{
				title: "Клиника " + clinicData.name + " — REVOMED",
				thumbnail: clinicData.logo,
				url: ENVIRONMENT.frontendURL+props.location.pathname}} 
			/>
      	<div className="row">
			<div className="col-lg-8">
				<div className="d-flex flex-wrap flex-md-nowrap text-center text-md-left mb-0 mb-md-0">
					<div className="Clinic__avatar flex-shrink-0 mx-auto mx-md-0 mb-5 mb-md-0" style={{"background": (browserName === "Safari" && +browserVersion < 15) ? "url("+clinicData.logo+")" : "url("+clinicData.logoWebp+")", "backgroundSize": "cover", "backgroundPosition": "center"}}></div>
						<div className="ml-md-5 d-md-flex justify-content-between flex-column w-100">
							<div>
								<div className="mb-3 d-flex align-items-center justify-content-center justify-content-md-start">
									<h1 className="Clinic__name mb-0">{clinicData.name}</h1>
      							</div>
								<span className="pr-4">Клиника</span>
								<span className="Doctor__address">{clinicData.country}, {clinicData.city}</span>
							</div>
							<div className="indicators d-flex align-items-center mt-3 justify-content-center justify-content-md-start">
								<div className="indicators__info d-none d-md-block">
									<span>Всего специалистов: {clinicData.doctorsTotal}</span>
									<span>Всего отзывов: {clinicData.reviewsTotal}</span>
								</div>
							</div>
						</div>
					</div>
					{clinicData.adresses.length > 0
					&&
					<div>
						<button onClick={() => setContentModalIsOpen(true)} className="adresses-button d-flex align-items-center mt-5"><img src={filials} className="mr-3" alt="" />Посмотреть адреса клиники</button>
					</div>
					}
					
				</div>
			</div>

				<div className="row mt-4 mt-md-6">
					<div className="col-8 col-lg-auto w-57 order-2 order-lg-0">
						<Description title="Описание" description={clinicData.description} />
					</div>
					<div className="col-8 col-lg-auto w-43 mb-4 mb-md-0">
						<div className="Clinic__directions text-center text-md-left">
							{clinicData.directions.map((item, key) => 
								<span key={key} className="Clinic__directions-item d-inline-block mb-3 mr-3">{item}</span>
							)}
						</div>
					</div>
				</div>

				{checkups && checkups.length ?
				<>
				<div className="row mt-6">
					<div className="col-8">
						<div className="header p-5 w-100 d-flex justify-content-between align-items-center">
							<h2 className="mb-0">Доступные обследования в этой клинике</h2>
							<div className="d-flex">
								<button className="swiper-button-prev d-flex align-items-center justify-content-center mr-3"><img src={chevronLeftIcon} alt="" /></button>
								<button className="swiper-button-next d-flex align-items-center justify-content-center"><img src={chevronRightIcon} alt="" /></button>
							</div>
						</div>
					</div>
				</div>
				<div className="row mt-6">
					<div className="col-8">
						<Swiper slidesPerColumnFill="row" spaceBetween={30} slidesPerView={1} breakpoints={{768: {slidesPerView: 2.5}}} navigation={{prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next'}} >
							{checkups.map((item, key) => 
								<SwiperSlide>
									<div className="checkup p-5">
										<h3>{item.name}</h3>
										<p className="pb-4 mb-0">{item.annotation}</p>
										<div className="d-flex flex-wrap pb-4">
											<span className="d-block w-100 pb-1">Стоимость</span>
											<span className="price">{item.price}₽</span>
										</div>
										<div className="surveys p-4">
											<span className="d-block w-100 pb-1">• {item.surveys.length} {declOfNum(item.surveys.length, ["обследование", "обследования", "обследований"])}</span>
											{item.consultation 
												? 
												<span className="d-block w-100">• 1 консультация с врачём</span>
												:
												<span className="d-block w-100">• Нет консультации с врачём</span>
											}
										</div>
										<Link to={"/checkup/"+item.idCheckup} className="mt-4 m-btn w-100 d-inline-block">Узнать подробнее</Link>
									</div>
								</SwiperSlide>
							)}
						</Swiper>
					</div>
				</div>
				</>
				: "" }

				{clinicData.doctors.length ?
				<>
				<div className="row mt-6">
					<div className="col-8">
						<div className="header p-5 w-100">
							<h2 className="mb-0">Специалисты клиники</h2>
						</div>
					</div>
				</div>
				<div className="row mt-6">
						{clinicData.doctors.map((item, key) => 
							<div className={`col-8 pt-sm-0 ${key !== clinicData.doctors.length-1 ? "pb-5" : ""}`} key={key}>
								<DoctorCard doctorData={item} />
							</div>
						)}
				</div>
				</>
				: "" }

				{clinicData.reviews.length ?
				<div className="row mt-6">
					<div className="col-8">
			    		<ReviewsSlider reviews={clinicData.reviews} slidesPerRow={2} />
			    	</div>
				</div>
				: "" }

				{clinicData.posts.length ?
				<>
				<div className="mt-5">
					<OwnBlog posts={clinicData.posts} />
				</div>
				</>
				: "" }
		</> : <BigLoadingState text="Загружаем данные клиники" />}
      </div>

      <ContentModal customOverlayClass="ClinicAdresses-overlay" contentClassName="ClinicAdresses-modal" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => setContentModalIsOpen(state)} modalHeader={contentModalHeader}>
        <div className="adresses text-left">
        	{clinicData ? 
        		clinicData.adresses.map((item, key) => 
        		<div className={`py-3 adresses__item ${key+1 !== clinicData.adresses.length ? "border--true" : ""}`}>
        			<span className="name d-block w-100">{item.name}</span>
        			<span className="value d-block w-100">{item.adress}</span>
        		</div>
        	) : ""}
        </div>
      </ContentModal>

    </div> 
  );
}

export default Clinic;