import { useState, useEffect, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import API from "../utils/API";
import ENVIRONMENT from '../utils/ENVIRONMENT';
import SEO from "../utils/SEO";
import { browserName, browserVersion, osVersion, osName } from 'react-device-detect';

// components
import Rating from "../elements/Rating/Rating";
import Description from "../blocks/Description/Description";
import TimeLine from "../blocks/TimeLine/TimeLine";
import DoctorTimetable from "../elements/DoctorTimetable/DoctorTimetable";
import ReviewsSlider from "../blocks/ReviewsSlider/ReviewsSlider";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";
import ContentModal from "../utils/ContentModal/ContentModal";

// graphics
import PennonIcon from "./img/PennonIcon";
import video from './img/Doctor/video.svg';
import videoActive from './img/Doctor/videoActive.svg';
import clinic from './img/Doctor/clinic.svg';
import clinicActive from './img/Doctor/clinicActive.svg';
import prompt from './img/Doctor/prompt.svg';
import promptActive from './img/Doctor/promptActive.svg';

import procent from '../blocks/DoctorCard/procent.svg';
import checked from '../blocks/DoctorCard/checked.svg';

// styles
import './Doctor.scss';

let Doctor = (props) => {
	const [doctorData, setDoctorData] = useState(null);
	const [doctorIsAddedToFavourites, setDoctorIsAddedToFavourites] = useState(null);
	const [offline, setOffline] = useState(false);
	const [promtOpen, setPromtOpen] = useState(false);

	const [contentModalIsOpen, setContentModalIsOpen] = useState(false);
  	const [contentModalHeader] = useState("Накопительная скидка");
  	const [currentCumulativeSale, setCurrentCumulativeSale] = useState(null);
 	const [currentCategory, setCurrentCategory] = useState(null);
	const [currentNameDoctor, setCurrentNameDoctor] = useState(null);

	// ON PAGE LOAD
	let history = useHistory();
	useEffect(() => {
		document.cookie = "bookingInfo=;max-age=-1";
		// get doctor data
		let getDoctor = async (id) => {
			let res = await API.get('/doctors/'+id, {params: {public: true}});
			return await res.data;
		}
		getDoctor(props.match.params.docId).then((result) => {
			setDoctorData(result.doctor);
			setDoctorIsAddedToFavourites(result.doctor.isInFavoritesNow);
		}, (error) => error.response.status === 404 ? history.replace("/404") : null)
	}, [history, props.match.params.docId])
	// END OF ON PAGE LOAD


	// DOCTOR ADD TO FAVOURITES
	let postFavorites = async (data) => {
		let res = await API.post('/clients/favorites', data);
		return await res.data;
	}
	let addToFavourites = (e) => {
		e.preventDefault();
		postFavorites({type: "doctor", id: doctorData.id}).then((result) => result.success ?setDoctorIsAddedToFavourites(result.isInFavoritesNow) : null);
	}
	// END OF DOCTOR ADD TO FAVOURITES

	// PLURAL
	let plural = (number) => {return ['год', 'года', 'лет'][ (number%100>4 && number%100<20)? 2 : [2, 0, 1, 1, 1, 2][(number%10<5)?number%10:5] ] };
	// END OF PLURAL

	let promtOpenRef = useRef(null)

	let closePrompt = () => {
		setPromtOpen(false)
	}
	let listener = event => {
      	// operators list
      	console.log("promtOpenRef", promtOpenRef)
      	console.log("promtOpenRef22", event.target)
      	if (!promtOpenRef.current) return;
      	if (!promtOpenRef.current.contains(event.target)) {
      		closePrompt();
      	}
      };

      let openModalCumulativeSale = (data, category, doctor) => {
	    setCurrentCumulativeSale(data);
	    setCurrentCategory(category);
	    setCurrentNameDoctor(doctor);
	    setContentModalIsOpen(true);
	  }

      useEffect(() => {
      	document.addEventListener('click', listener, false);
      	return () => {
      		document.removeEventListener('click', listener, false);
      	}
      }, [])

	return (
		<div className="Doctor">
			<div className="container py-7">
				{doctorData ? <>
				<SEO pageProps={{
					title: doctorData.name + " — REVOMED",
					thumbnail: doctorData.avatar,
					url: ENVIRONMENT.frontendURL+props.location.pathname}} 
				/>

				<span className="Doctor__category d-inline-block py-2 px-4 mb-5">{doctorData.category}, консультация {doctorData.duration} мин</span>
				<div className="row">
					<div className="col-lg-5">
						<div className="d-flex flex-column flex-md-row align-items-center align-items-md-start flex-wrap flex-md-nowrap text-center text-md-left mb-5 mb-md-0">
							<div className="Doctor__avatar flex-shrink-0 mb-5 mb-md-0" style={{"background": (browserName === "Safari" && +browserVersion < 15) ? "url("+doctorData.avatar+")" : "url("+doctorData.avatarWebp+")", "backgroundSize": "cover", "backgroundPosition": "center"}}></div>
							<div className="ml-md-5">
								<div className="mb-3 d-flex align-items-center justify-content-center justify-content-md-start">
									<h1 className="Doctor__name mb-0">{doctorData.name}</h1>
									{doctorIsAddedToFavourites !== null ? <button className={`Doctor__add-to-favourites ml-3 ${doctorIsAddedToFavourites ? "added" : ""}`} onClick={(e) => addToFavourites(e)}>
		      							<PennonIcon />
		      						</button> : ""}
	      						</div>
      						
								{doctorData.academicDegree ? <span className="Doctor__academic-degree pr-4">{doctorData.academicDegree}</span> : ""}
								<span className="Doctor__experience">Стаж: {doctorData.experience} {plural(doctorData.experience)}</span>
							
								{doctorData.clinic ? <Link to={"/clinic/"+doctorData.clinic.id} className="d-block">Клиника "{doctorData.clinic.name}"</Link> : ""}
								<div className="Doctor__directions">
									{doctorData.directions.map((item, key) => 
										<span key={key} className="Doctor__directions-item d-inline-block mt-3 mr-3">{item}</span>
									)}
								</div>
							</div>
						</div>
						<div className="indicators w-100">
							<div className="indicators d-flex align-items-center mt-3 mt-md-5 justify-content-center justify-content-md-start">
								<Rating rating={doctorData.rating} />
								<div className="indicators__info pl-4 d-none d-md-block">
								{
									doctorData.patientsTotal !== 0 &&
									<>
									<span>Всего пациентов: {doctorData.patientsTotal}</span>
									<span>Всего отзывов: {doctorData.reviewsTotal}</span>
									</>
								}
								</div>
							</div>
						</div>
					</div>
					
				</div>

				<div className="row mt-6">

					<div className="col-8 col-lg-auto w-57 order-2 order-lg-0">
						<div className="mt-5 mt-lg-0">
							<Description title="О враче / частном специалисте" description={doctorData.description} />
						</div>

						<div className="mt-5">
							<TimeLine heading="Образование" timeline={doctorData.education} />
						</div>

						<div className="mt-5">
							<TimeLine heading="Опыт" timeline={doctorData.workExperience} />
						</div>

						<div className="mt-5">
							<ReviewsSlider reviews={doctorData.reviews} slidesPerColumn={2} />
						</div>
					</div>

					<div className="col-8 col-lg-auto w-43">
						{doctorData.sale && doctorData.sale.name === "revomed" ? <span className="consultation-sale d-block text-center p-3">-10% на первую консультацию</span> : ""}
						<div className={`get-consultation py-5 px-4 px-sm-6 ${!doctorData.sale || (doctorData.sale && doctorData.sale.name !== "revomed") ? "no-sale" : ""}`}>
							<div>
							{doctorData.cumulativeSale.on ? <button className="cumulative-sale position-relative" onClick={() => openModalCumulativeSale(doctorData.cumulativeSale, doctorData.category, doctorData.name)}><span><div className="procent-img"><img src={procent} alt="" /></div>Накопительная скидка</span></button> : ""}
							</div>
							<div className="type mt-3">
					            <span>Тип приема</span>
					      		<div className="d-flex mt-1 position-relative">
					                <div onClick={()=>{setOffline(false)}} className={`button position-relative ${doctorData.sale ? "isSale" : ""} ${!offline ? "active" : ""}`}>
						                <div className="d-flex align-items-center mb-2">
						                		{!offline ? <img src={videoActive} alt=""  className="mr-2"/> : <img src={video} alt=""  className="mr-2"/>}
						                		<span>Онлайн</span>
						                </div>
						                <div>
						                		<span className="price pr-2">{doctorData.price}₽</span>
						                		{doctorData.oldPrice && <span className="crossed-out">{doctorData.oldPrice}₽</span>}
						                </div>
						                {doctorData.sale &&
	                    					<div className="sale">
	                      						<span>
	                        						{doctorData.sale.name === "fixed" && doctorData.clinic 
	                        						? "-" + doctorData.sale.sum + "% от клиники" 
	                        						: doctorData.sale.name === "fixed" && !doctorData.clinic
	                        						? "-" + doctorData.sale.sum + "% от врача"
	                        						: doctorData.sale.name === "cumulative"
	                        						? "-" + doctorData.sale.sum + "% накопительная"
	                        						: "-" + doctorData.sale.sum + "% от Revomed"
	                        						}
	                      						</span>
	                    					</div>
	                  					}
					                </div>
					                {
					                  (doctorData.offline && doctorData.adress) &&
					                  	<div className="ml-4 position-relative">
					                  		<div onClick={()=>{setOffline(true)}} className={`p-3 button position-relative ${offline ? "active" : ""}`}>
						                  		<div className="d-flex align-items-center mb-2">
						                  				{offline ? <img src={clinicActive} alt=""  className="mr-2"/> : <img src={clinic} alt=""  className="mr-2"/>}
						                  				<span>В клинике</span>
						                  		</div>
						                  		<div>
						                  				<span className="price">{doctorData.priceOffline}₽</span>
						                  		</div>
					                  		</div>
					                		<div className={`prompt ${offline ? "active" : ""}`} ref={promtOpenRef} onClick={() => {setPromtOpen(true)}}>{offline ? <img src={promptActive} alt="" /> : <img src={prompt} alt="" />}  <div className={`${promtOpen ? "d-block" : "d-none"} prompt__info position-absolute p-4`}><span className="d-block clinicName">Клиника "{doctorData.clinic.name}"</span><span className="d-block adress">{doctorData.adress.adress}</span></div></div>
					                	</div>
					                }
					            </div>

					      	</div>

							

							<div className="get-consultation__timetable mt-5">
								<DoctorTimetable docId={doctorData.id} timetable={doctorData.timetable} price={doctorData.price} oldPrice={doctorData.oldPrice} priceOffline={doctorData.priceOffline} offline={offline}/>
							</div>
						</div>
					</div>
						 <ContentModal customOverlayClass="CumulativeSale-overlay" contentClassName="CumulativeSale-modal" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => setContentModalIsOpen(state)} modalHeader={contentModalHeader}>
        <div className="cumulativeSale-data text-left">
          {currentCumulativeSale &&
            <div>
              <div className="d-flex align-items-center mb-4">
                <div className="checked"><img src={checked} alt="" /></div>
                <p>{currentCumulativeSale.clinic ? "Проходите консультации клиники " + currentCumulativeSale.clinic + " у врачей в категории " + currentCategory : "Проходите консультации у врача " + currentNameDoctor + " категории " + currentCategory}</p>
              </div>
              <div className="d-flex align-items-center mb-4">
               <div className="checked"><img src={checked} alt="" /></div>
                <p>Скидка начнётся после {currentCumulativeSale.numConsultation} сеанса и составит {currentCumulativeSale.minSale}%</p>
              </div>
              <div className="d-flex align-items-center">
               <div className="checked"><img src={checked} alt="" /></div>
                <p>После каждого завершенного сеана Ваша скидка будет увеличиваться на {currentCumulativeSale.step}%. Максимальный размер — {currentCumulativeSale.maxSale}%</p>
              </div>
              <button className="m-btn d-block d-md-inline-block w-100 mt-5" onClick={() => setContentModalIsOpen(false)}>Хорошо</button>
            </div>
          }
        </div>
      </ContentModal>
				</div>
				</> : <BigLoadingState text="Загружаем страницу врача" />}
			</div>
		</div>
	);
}

export default Doctor;


/*
{doctorData.oldPrice ? <h2 className="get-consultation__heading mb-1">Стоимость консультации — {doctorData.price}₽ <span className="oldPrice">{doctorData.oldPrice}₽</span></h2>
							: <h2 className="get-consultation__heading mb-1">Стоимость консультации — {doctorData.price}₽</h2> }
							<span className="get-consultation__subheading">Выберите дату и время сессии</span>

*/
