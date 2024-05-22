import { useState, useEffect } from "react";
import io from "socket.io-client"
import { Redirect, useHistory } from 'react-router-dom';
import API from "../utils/API";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";
import ENVIRONMENT from "../utils/ENVIRONMENT";

// components
import UIConsultationTimer from "../UI/blocks/UIConsultationTimer/UIConsultationTimer";
import UIConsultationVideo from "../UI/blocks/UIConsultationVideo/UIConsultationVideo";
import Rating from "../elements/Rating/Rating";

// styles
import './RoomUser.scss';

let RoomUser = (props) => {
	const [consultationData, setConsultationData] = useState(null);
	const [socket, setSocket] = useState(null);
	const [isConsultationReadyToStarts, setIsConsultationReadyToStarts] = useState(false);
	const [consultationStatus, setConsultationStatus] = useState(null);
	const [interlocutorIsOnline, setInterlocutorIsOnline] = useState(null);


	// RECOMMENDATION MODAL
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	// END OF RECOMMENDATION MODAL


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
				let socketS = io.connect(ENVIRONMENT.backendURL+"/consultation", {withCredentials: 'true'});
				setSocket(socketS);
			}
		},
		(error) => error.response.status === 404 ? history.replace("/404") : null)
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
			setConsultationStatus(data.status);
		})
		socket.on("deviceChanged", (data) => {
			setGeneralModalHeader("Ошибка");
			setGeneralModalText(data.message);
			setGeneralModalIsOpen(true);
		})
		socket.on("doctorIsOnline", (data) => {
			console.log("doctorIsOnline", data);
			setInterlocutorIsOnline(data.online);
		})
	}
	// END OF INIT SOCKETS


	// USER WANTS TO START CONSULTATION
	let userWantsToStartConsultation = () => {
		console.log("userWantsToStartConsultation");
		socket.emit("userWantsToStartConsultation", {link: props.match.params.link});
		socket.on("consultationStartsAnswer", (data) => {
			console.log("consultationStartsAnswer", data);
			if(data.success) setConsultationStatus("inProgress");
			else {
				setGeneralModalHeader("Ошибка");
				setGeneralModalText(data.message);
				setGeneralModalIsOpen(true);
			}
		})
	}
	// END OF USER WANTS TO START CONSULTATION


	// USER WANTS TO END CONSULTATION
	let userWantsToEndConsultation = () => {
		console.log("userWantsToEndConsultation");
		socket.emit("userWantsToEndConsultation", {link: props.match.params.link});
		socket.on("consultationEndsAnswer", (data) => {
			console.log("consultationEndsAnswer", data);
			if(data.success) setConsultationStatus("completed");
		})
	}
	// END OF USER WANTS TO END CONSULTATION

  return (
    <div className="RoomUser">
     	<div className="container py-7">
     	{consultationData && consultationStatus ?
     		<div className="row">
     			<div className="col-8 col-lg-5 pr-lg-6 pb-5 pb-lg-0">
     				<UIConsultationVideo link={props.match.params.link} callIsAllowed={consultationStatus === "inProgress"} />
     			</div>
     			<div className="col-8 col-lg-3 d-lg-flex">
     				<div className="row align-content-between">
     					<div className="col-8 pb-5 pb-lg-0">
	     					<div className="d-flex align-items-start">
	     		 				<div className="img flex-shrink-0" style={{backgroundImage: 'url(' + consultationData.avatar + ')', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
	     		 				<div className="pl-5 d-flex flex-column justify-content-between">
	     		 					<div>
	     		 						<span className="d-block name">{consultationData.doctorName}</span>
	     		 						<span className="d-block category">{consultationData.category}</span>
	     		 					</div>
	     		 					<div className="d-flex pt-3">
	     		 						<Rating rating={consultationData.rating} styleClassString="py-2 px-3"/>
	     		 					</div>
	     		 				</div>
	     		 			</div>
     		 			</div>
     					<div className="col-8 pb-5 pb-lg-0">
     		 				<UIConsultationTimer onlineUserName="Врач" onlineStatus={interlocutorIsOnline} updateData={() => setIsConsultationReadyToStarts(true)} timeStart={consultationData.timeStart} timeEnd={consultationData.timeEnd} inProgress={consultationStatus === "inProgress"}/>
     		 				<div className="d-flex align-items-end pt-5">
     		 					<div className="w-100">
	     		 				{
		     		 				consultationStatus === "notStarted"
		     		 				?
		     		 				<button type="button" className="ui-r-main-button px-6 w-100" disabled={!isConsultationReadyToStarts} onClick={() => userWantsToStartConsultation()}>Начать консультацию</button>
		     		 				:
		     		 				<button type="button" onClick={() => userWantsToEndConsultation()} className="ui-r-red-button px-6 w-100">Завершить консультацию</button>
		     		 			}
		     		 			</div>
		     		 		</div>
     		 			</div>
	     			</div>
	     		</div>
	     	</div>
	     	: <div className="py-7"><BigLoadingState text="Готовим комнату видеоконсультации" /></div> }

	     	{consultationStatus === "completed" ? <Redirect to={"/write/review/"+props.match.params.link} /> : ""}
     	</div>

     	<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
    </div> 
  );
}

export default RoomUser;