import { useState, useEffect } from "react";
import { DateTime, Interval, Duration } from 'luxon';

// graphics
import clockIcon from './clockIcon.svg';

// styles
import './UIConsultationTimer.scss';

let UIConsultationTimer = (props) => {
	/*
	props.timeStart
	props.timeEnd
	props.updateData
	props.inProgress
	props.onlineStatus
	props.onlineUserName
	*/

	const [timeLeft, setTimeLeft] = useState("");
	const [timeLeftEndConsultation, setTimeLeftEndConsultation] = useState("");
	const [progressWidth, setProgressWidth] = useState({});

	// BEFORE CONSULTATION STARTS TIMER
	useEffect(() => {
		let consultationStarts = DateTime.fromISO(props.timeStart, {setZone: "local"});
		
		let interval = setInterval(() => {
			let now = DateTime.now();
			let durationFormated  = Duration.fromObject(Interval.fromDateTimes(now, consultationStarts).toDuration(["hours", "minutes", "seconds"]).toObject()).toFormat("hh:mm:ss");
			setTimeLeft(durationFormated);
			if (durationFormated === "00:00:00") {
				if(props.updateData) props.updateData(true);
				clearInterval(interval); 
			}
		}, 1000);
		return () => clearInterval(interval); 
	}, [])
	// END OF BEFORE CONSULTATION STARTS TIMER


	// AFTER CONSULTATION STARTS TIMER
	useEffect(() => {
		if(!props.inProgress) return;
		let consultationStarts = DateTime.fromISO(props.timeStart, {setZone: "local"});
		let consultationEnd = DateTime.fromISO(props.timeEnd, {setZone: "local"});
		let interval = setInterval(() => {
			let now = DateTime.now();
			let durationFormated = Duration.fromObject(Interval.fromDateTimes(now, consultationEnd).toDuration(["hours", "minutes", "seconds"]).toObject()).toFormat("hh:mm:ss");
			setTimeLeftEndConsultation(durationFormated);
			let durationMillisecons = Duration.fromObject(Interval.fromDateTimes(consultationStarts, now).toDuration(["seconds"]).toObject()).toFormat("ss");
			let intervalMillisecons = Duration.fromObject(Interval.fromDateTimes(consultationStarts, consultationEnd).toDuration(["seconds"]).toObject()).toFormat("ss");
			setProgressWidth({width: (100 - ((+durationMillisecons*100)/+intervalMillisecons))+'%'});
		}, 1000);
		return () => clearInterval(interval); 
	}, [props.inProgress])
	// END OF AFTER CONSULTATION STARTS TIMER

	return (
		<div className="UIConsultationTimer">
			<div className="UIConsultationTimer__content p-4 d-flex justify-content-between align-items-center flex-wrap">
				<span className="date d-block text-left">{DateTime.fromISO(props.timeStart, {zone: "local"}).setLocale("ru").toFormat("d MMMM, cccc")}</span>
				<span className={props.onlineStatus ? "green-color" : "red-color"}>{props.onlineUserName} {props.onlineStatus ? "онлайн" : "офлайн"}</span>
				<div className={`w-100 d-flex justify-content-between frame position-relative ${!props.inProgress ? "" : "start"}`}>
				{!props.inProgress ? <>
					<span className="time">{DateTime.fromISO(props.timeStart, {zone: "local"}).setLocale("ru").toFormat("HH:mm")} - {DateTime.fromISO(props.timeEnd, {zone: "local"}).setLocale("ru").toFormat("HH:mm")}</span>
					<span className="before-start">До сеанса {timeLeft}</span>
				</> :
					<div className="before-end align-items-center text-center w-100">
						<div className="progress position-absolute" style={progressWidth}></div>
						<span className="time w-100 align-items-center d-flex justify-content-center"><img src={clockIcon} alt="" /><span className="before-end-time">{timeLeftEndConsultation}</span></span>
					</div>
				}
				</div>
			</div>
		</div>
	);
}

export default UIConsultationTimer;
