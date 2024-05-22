import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/API";
import LazyLoad from 'react-lazy-load';
import { browserName, browserVersion, osVersion, osName } from 'react-device-detect';

//components
import Rating from "../../elements/Rating/Rating";
import DoctorTimetable from "../../elements/DoctorTimetable/DoctorTimetable";
import ContentModal from "../../utils/ContentModal/ContentModal";

// graphics
import PennonIcon from './pennonIcon';
import video from './video.svg';
import videoActive from './videoActive.svg';
import clinic from './clinic.svg';
import clinicActive from './clinicActive.svg';
import prompt from './prompt.svg';
import promptActive from './promptActive.svg';
import procent from './procent.svg';
import checked from './checked.svg';

// styles
import './DoctorCard.scss';

let DoctorCard = (props) => {
	/*
	props.doctorData
	*/
	const [doctorIsAddedToFavourites, setDoctorIsAddedToFavourites] = useState(props.doctorData.isInFavoritesNow);
  const [offline, setOffline] = useState(props.online || props.online === false ? !props.online : false);
  const [promtOpen, setPromtOpen] = useState(false);
  const [promtOpenSecond, setPromtOpenSecond] = useState(false);

  const [contentModalIsOpen, setContentModalIsOpen] = useState(false);
  const [contentModalHeader] = useState("Накопительная скидка");
  const [currentCumulativeSale, setCurrentCumulativeSale] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentNameDoctor, setCurrentNameDoctor] = useState(null);

	// DOCTOR ADD TO FAVOURITES
	let postFavorites = async (data) => {
		let res = await API.post('/clients/favorites', data);
		return await res.data;
	}
	let addToFavourites = (e) => {
		e.preventDefault();
    setDoctorIsAddedToFavourites(actual => !actual);
		postFavorites({type: "doctor", id: props.doctorData.id}).then((result) => result.success ?setDoctorIsAddedToFavourites(result.isInFavoritesNow) : null);
	}
	// END OF DOCTOR ADD TO FAVOURITES


  let promtOpenRef = useRef(null)
  let promtOpenRefSecond = useRef(null)

  let closePrompt = () => {
    setPromtOpen(false)
  }
  let closePromptSecond = () => {
    setPromtOpenSecond(false)
  }
  let listener = event => {
      // operators list;
      if (!promtOpenRef.current) return;
      if (!promtOpenRef.current.contains(event.target)) {
        closePrompt();
      }
      if (!promtOpenRefSecond.current) return;
      if (!promtOpenRefSecond.current.contains(event.target)) {
        closePromptSecond();
      }
  };

  let openModalCumulativeSale = (data, category, doctor) => {
    setCurrentCumulativeSale(data);
    setCurrentCategory(category);
    setCurrentNameDoctor(doctor);
    setContentModalIsOpen(true);
  }

  useEffect(() => {
    console.log("offline", offline)
    //console.log(" props.doctorData",  props.doctorData)
    document.addEventListener('click', listener, false);
    return () => {
      document.removeEventListener('click', listener, false);
    }
  }, [])


  // PLURAL
  let plural = (number) => {return ['год', 'года', 'лет'][ (number%100>4 && number%100<20)? 2 : [2, 0, 1, 1, 1, 2][(number%10<5)?number%10:5] ] };
  // END OF PLURAL

  return (
    <div className="DoctorCard d-lg-flex justify-content-between p-4 p-sm-6">
    {props.doctorData ? <>
      <span className="DoctorCard__category">{props.doctorData.category}, {props.doctorData.duration} мин</span>
      
      <div className="DoctorCard__content">
      	<div className="doctor-profile-info d-md-flex">
      		<LazyLoad><div className="doctor-profile-info__avatar flex-shrink-0 m-auto m-md-0" style={{"backgroundImage": (browserName === "Safari" && +browserVersion < 15) ? "url("+props.doctorData.avatar+")" : "url("+props.doctorData.avatarWebp+")", "backgroundPosition": "center", "backgroundSize": "cover"}}></div></LazyLoad>
      		<div className="doctor-profile-info__main pl-md-5">
      			<h2 className="d-flex align-items-center justify-content-center justify-content-md-start mt-4 mt-md-0">
      				<Link to={"/doctor/"+props.doctorData.id} className="doctor-profile-info__name">{props.doctorData.name}</Link>
      				{doctorIsAddedToFavourites !== null ? <button className={`doctor-profile-info__add-to-favourites ml-3 ${doctorIsAddedToFavourites ? "added" : ""}`} onClick={(e) => addToFavourites(e)}>
						    <PennonIcon />
              </button> : ""}
      			</h2>
      			<div className="doctor-profile-info__facts mt-3 text-center text-md-left">
      				{props.doctorData.academicDegree ? <span className="pr-4">{props.doctorData.academicDegree}</span> : '' }
      				<span>Стаж: {props.doctorData.experience} {plural(props.doctorData.experience)}</span>
              <div className="facts__block d-md-flex d-lg-block d-xl-flex">
        				{props.doctorData.clinic ? <Link to={"/clinic/"+props.doctorData.clinic.id} className="d-block mr-md-4 mr-lg-0 mr-xl-4 mb-2 mb-md-0 mb-lg-2 mb-xl-0">Клиника "{props.doctorData.clinic.name}"</Link> : ""}
                {props.doctorData.cumulativeSale.on ? <button className="cumulative-sale position-relative" onClick={() => openModalCumulativeSale(props.doctorData.cumulativeSale, props.doctorData.category, props.doctorData.name)}><span><div className="procent-img"><img src={procent} alt="" /></div>Накопительная скидка</span></button> : ""}
              </div>
      			</div>



      			<div className="type mt-3 d-none d-lg-block">
              <span>Тип приема</span>
      				<div className="d-flex mt-1 position-relative align-items-start">
                <div onClick={()=>{setOffline(false)}} className={`button position-relative ${props.doctorData.sale ? "isSale" : ""} ${!offline ? "active" : ""}`}>
                  <div className="d-flex align-items-center mb-2">
                    {!offline ? <img src={videoActive} alt=""  className="mr-2"/> : <img src={video} alt=""  className="mr-2"/>}
                    <span>Онлайн</span>
                  </div>
                  <div>
                    <span className="price pr-2">{props.doctorData.price}₽</span>
                    {props.doctorData.oldPrice && <span className="crossed-out">{props.doctorData.oldPrice}₽</span>}
                  </div>
                  {props.doctorData.sale &&
                    <div className="sale">
                      <span>
                        {props.doctorData.sale.name === "fixed" && props.doctorData.clinic 
                        ? "-" + props.doctorData.sale.sum + "% от клиники" 
                        : props.doctorData.sale.name === "fixed" && !props.doctorData.clinic
                        ? "-" + props.doctorData.sale.sum + "% от врача"
                        : props.doctorData.sale.name === "cumulative"
                        ? "-" + props.doctorData.sale.sum + "% накопительная"
                        : "-" + props.doctorData.sale.sum + "% от Revomed"
                        }
                      </span>
                    </div>
                  }
                </div>
                {
                  (props.doctorData.offline && props.doctorData.adress) && 
                  <div className="ml-4 position-relative">
                    <div onClick={()=>{setOffline(true)}} className={`p-3 button ${offline ? "active" : ""}`}>
                      <div className="d-flex align-items-center mb-2">
                        {offline ? <img src={clinicActive} alt=""  className="mr-2"/> : <img src={clinic} alt=""  className="mr-2"/>}
                        <span>В клинике</span>
                      </div>
                      <div>
                        <span className="price">{props.doctorData.priceOffline}₽</span>
                        </div>
                    </div>
                    <div className={`prompt ${offline ? "active" : ""}`} ref={promtOpenRef} onClick={() => {setPromtOpen(true)}}>{offline ? <img src={promptActive} alt="" /> : <img src={prompt} alt="" />}<div className={`${promtOpen ? "d-block" : "d-none"} prompt__info position-absolute p-4`}><span className="d-block clinicName">Клиника "{props.doctorData.clinic.name}"</span><span className="d-block adress">{props.doctorData.adress.adress}</span></div></div>
                  </div>
                }
              </div>
      			</div>




      		</div>

      	</div>
      	<div className="indicators d-flex align-items-center mt-3 mt-md-5 justify-content-center justify-content-md-start">
      		<Rating rating={props.doctorData.rating} />
      			<div className="indicators__info pl-4 d-none d-md-block">
              { props.doctorData.patientsTotal !== 0 &&
                <>
                <span>Всего пациентов: {props.doctorData.patientsTotal}</span>
                <span>Всего отзывов: {props.doctorData.reviewsTotal}</span>
                </>
              }
			     </div>
      	</div>

        {
          offline &&
          <div className="mt-5">
            <span className="d-block clinicName">Клиника "{props.doctorData.clinic.name}"</span>
            <span className="d-block adress">{props.doctorData.adress.adress}</span>
          </div>
        }
        <div className="type mt-3 в-block d-lg-none">
          <span>Тип приема</span>
          <div className="d-flex mt-1 align-items-start">
            <div onClick={()=>{setOffline(false)}} className={`button position-relative ${props.doctorData.sale ? "isSale" : ""} ${!offline ? "active" : ""}`}>
              <div className="d-flex align-items-center mb-2">
                {!offline ? <img src={videoActive} alt=""  className="mr-2"/> : <img src={video} alt=""  className="mr-2"/>}
                <span>Онлайн</span>
              </div>
              <div>
                <span className="price pr-2">{props.doctorData.price}₽</span>
                {props.doctorData.oldPrice && <span className="crossed-out">{props.doctorData.oldPrice}₽</span>}
              </div>
              {props.doctorData.sale &&
                    <div className="sale">
                      <span>
                        {props.doctorData.sale.name === "fixed" && props.doctorData.clinic 
                        ? "-" + props.doctorData.sale.sum + "% от клиники" 
                        : props.doctorData.sale.name === "fixed" && !props.doctorData.clinic
                        ? "-" + props.doctorData.sale.sum + "% от врача"
                        : props.doctorData.sale.name === "cumulative"
                        ? "-" + props.doctorData.sale.sum + "% накопительная"
                        : "-" + props.doctorData.sale.sum + "% от Revomed"
                        }
                      </span>
                    </div>
                  }
            </div>
            {
              (props.doctorData.offline && props.doctorData.adress) && <>
              <div onClick={()=>{setOffline(true)}} className={`ml-4 p-3 button position-relative ${offline ? "active" : ""}`}>
                <div className="d-flex align-items-center mb-2">
                  {offline ? <img src={clinicActive} alt=""  className="mr-2"/> : <img src={clinic} alt=""  className="mr-2"/>}
                  <span>В клинике</span>
                </div>
                  <div>
                  <span className="price">{props.doctorData.priceOffline}₽</span>
                </div>
              </div>

              <div className="prompt second" ref={promtOpenRefSecond} onClick={() => {setPromtOpenSecond(true)}}>{offline ? <img src={promptActive} alt="" /> : <img src={prompt} alt="" />}<div className={`${promtOpenSecond ? "d-block" : "d-none"} prompt__info position-absolute p-4`}><span className="d-block clinicName">Клиника "{props.doctorData.clinic.name}"</span><span className="d-block adress">{props.doctorData.adress.adress}</span></div></div>
            </> }
          </div>
        </div>
    	</div>
      <div className="DoctorCard__timetable d-flex flex-column justify-content-between mt-5 mt-lg-0">
		    <DoctorTimetable docId={props.doctorData.id} timetable={props.doctorData.timetable} price={props.doctorData.price} oldPrice={props.doctorData.oldPrice} priceOffline={props.doctorData.priceOffline} offline={offline}/>
      </div>
      </> : "" }
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
  );
}

export default DoctorCard;



/*
<div className="directions">
              {props.doctorData.directions.map((item, key) => 
                <span key={key} className="directions-item d-inline-block mt-3 mr-3">{item}</span>
             )}
            </div>
*/
