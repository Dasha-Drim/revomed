import { useState, useEffect } from "react";
import io from "socket.io-client"
import { Redirect, useHistory } from 'react-router-dom';
import API from "../utils/API";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import ContentModal from "../utils/ContentModal/ContentModal";
import { Swiper, SwiperSlide } from 'swiper/react';
import Carousel from '../utils/Carousel/Carousel';
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";
import ENVIRONMENT from "../utils/ENVIRONMENT";

// components
import UIConsultationTimer from "../UI/blocks/UIConsultationTimer/UIConsultationTimer";
import UIConsultationVideo from "../UI/blocks/UIConsultationVideo/UIConsultationVideo";

// graphics
import rightChevronCarouselIcon from './img/Room/rightChevronCarouselIcon.svg';

// styles
import './RoomDoc.scss';

let RoomDoc = (props) => {
	const [consultationData, setConsultationData] = useState(null);
	const [socket, setSocket] = useState(null);
	const [consultationStatus, setConsultationStatus] = useState(null);
	const [interlocutorIsOnline, setInterlocutorIsOnline] = useState(null);

	// GENERAL MODAL
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL


	// ATTACH FILES MODAL
	const [contentModalIsOpen, setContentModalIsOpen] = useState(false);
	const [contentModalHeader] = useState("Просмотр файлов");
	const [filesAlreadyAttached, setFilesAlreadyAttached] = useState([]);
	const [thumbsSwiper, setThumbsSwiper] = useState(null);
	const [mainSwiper, setMainSwiper] = useState(null);
	// END OF ATTACH FILES MODAL


	// ON PAGE LOAD
	let history = useHistory();
	useEffect(() => {
		let getConsultation = async (data) => {
			let res = await API.get('/consultations/'+props.match.params.link, data);
			return await res.data;
		}
		getConsultation().then((result) => {
			if(result.success) {
				setConsultationData(result.consultation);
				setFilesAlreadyAttached(result.consultation.files);
				let socketS = io.connect(ENVIRONMENT.backendURL+"/consultation", {withCredentials: 'true'});
				setSocket(socketS);
			}
		},(error) => error.response.status === 404 ? history.replace("/404") : null)
	}, [history, props.match.params.link])
	// END OF ON PAGE LOAD


	// ON SOCKETS SETTED
	useEffect(() => {
		if(!socket) return;
		initSockets(socket);
		return () => {
      		socket.disconnect();
      	}
	}, [socket])
	// END OF ON SOCKETS SETTED


	// INIT SOCKETS
	let initSockets = (socket) => {
		socket.emit("readyToConsultation", {link: props.match.params.link})
		socket.emit("consultationCurrentStatus", {link: props.match.params.link});
		socket.on("consultationCurrentStatusAnswer", (data) => {
			console.log("consultationCurrentStatusAnswer", data);
			setConsultationStatus(data.status);
		})
		socket.on("deviceChanged", (data) => {
			setGeneralModalHeader("Ошибка");
			setGeneralModalText(data.message);
			setGeneralModalIsOpen(true);
		})
		socket.on("clientIsOnline", (data) => {
			console.log("clientIsOnline", data);
			setInterlocutorIsOnline(data.online);
		})
	}
	// END OF INIT SOCKETS

  	return (
    	<div className="RoomDoc">
     		<div className="container py-7">
     		{consultationData && consultationStatus ?
     			<div className="row">
     				<div className="col-8 col-lg-5 pr-lg-6 pb-5 pb-lg-0">
     					<UIConsultationVideo link={props.match.params.link} callIsAllowed={true} />
     				</div>
     				<div className="col-8 col-lg-3 d-lg-flex flex-wrap align-content-start">
         						<div className="w-100 mb-5">
         		 					<UIConsultationTimer onlineUserName="Пациент" onlineStatus={interlocutorIsOnline} timeStart={consultationData.timeStart} timeEnd={consultationData.timeEnd} inProgress={consultationStatus === "inProgress"}/>
     		 					</div>
     		 					<span className="RoomDoc__client-status d-block w-100 mb-5 p-4">
     		 						{consultationStatus === "notStarted" ? <>Пациент ещё не начал видеозвонок</> :
     		 						consultationStatus === "inProgress" ? <>Видеозвонок в процессе</> : <>Видеосвязь недоступна</> }
     		 					</span>
     		 					{filesAlreadyAttached.length ?
     		 					<div className="RoomDoc__files p-4">
									<p>Пользователь загрузил для вас файлы.<br/>Просмотр файлов откроется в попап-окне. Консультация не прервётся, пациент продолжит видеть и слышать вас.</p>
									<button type="button" onClick={() => setContentModalIsOpen(true)} className="ui-r-secondary-button px-6 w-100">Посмотреть файлы пациента</button>
								</div>
								: "" }
     		 		</div>
     			</div>
     			: <div className="py-7"><BigLoadingState text="Готовим комнату видеоконсультации" /></div> }

     			{consultationStatus === "completed" ? <Redirect to={"/write/recommendation/"+props.match.params.link} /> : ""}
     		</div>

     		<ContentModal customOverlayClass="UIDocConsultations-overlay" contentClassName="UIDocConsultations-modal" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => setContentModalIsOpen(state)} modalHeader={contentModalHeader}>
      				<p className="mb-4">Для улучшения качества консультации, пациент может загрузить файлы, которые могут помочь вам лучше провести консультацию</p>
      				{!filesAlreadyAttached.length ?
      					<>
      					<span className="d-block">Пациент ещё не прикреплял файлы</span>
      					</>
      				:
	      				<div>
	      					<Carousel className="files-attached-carousel__secondary" onCarousel={(carousel) => setThumbsSwiper(carousel)} onSlideChange={(slideIndex) => {if(mainSwiper) mainSwiper.slideTo(slideIndex)}} spaceBetween={30} slidesOffsetAfter={30} >
								<slides>
									{filesAlreadyAttached.map((item, key) => 
									<span key={key} >{item.name}</span>
									)}
								</slides>
								<next>
									<div className="d-flex align-items-center"><img src={rightChevronCarouselIcon} alt="" /></div>
								</next>
							</Carousel>
							{thumbsSwiper ?
							<Swiper className="files-attached-carousel__primary" autoHeight={true} speed={400} onSwiper={setMainSwiper} slidesPerView={1} onSlideChange={(swiper) => {thumbsSwiper.slideTo(swiper.activeIndex)}} >
								{filesAlreadyAttached.map((item, key) => {
		      						let fileType = item.path.split(".").pop();
		      						if(fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg') {
		      							return (
		      								<SwiperSlide key={key}>
												<div className="slide-item d-flex flex-wrap pt-5">
													<img src={item.path} className="w-100" alt="" />
												</div>
											</SwiperSlide>
										);
		      						} else {
		      							return (
		      								<SwiperSlide key={key}>
												<div className="slide-item d-flex flex-wrap pt-5">
													<iframe title={key} className="w-100" src={"https://docs.google.com/gview?url=" + item.path + "&embedded=true"}></iframe>
												</div>
											</SwiperSlide>
										);
		      						}
	      						})}
							</Swiper>
							: "" }
	      				</div>
      				}
				</ContentModal>

     		<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
    	</div> 
  	);
}

export default RoomDoc;
