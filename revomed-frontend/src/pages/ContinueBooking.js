import { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import API from "../utils/API";

import DoctorCard from "../blocks/DoctorCard/DoctorCard";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";


// styles
import './ContinueBooking.scss';

let ContinueBooking = (props) => {
	const [doctorInfo, setDoctorInfo] = useState(null);
	let history = useHistory();
	// ON PAGE LOAD
	useEffect(() => {
		let getCookie = (name) => {
			let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
			return matches ? decodeURIComponent(matches[1]) : undefined;
		}
		let getDoctor = async () => {
			let res = await API.get('/doctors/'+getCookie("bookingInfo"), {params: {public: true}});
			return await res.data;
		}
		//var delete_cookie = function(name) { document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'; }
		getDoctor().then((result) => {
			setDoctorInfo(result.doctor);
			document.cookie = "bookingInfo=;max-age=-1";
		}, (error) => error.response.status === 404 ? history.replace("/404") : null)
	}, [])
	// END OF ON PAGE LOAD

	return (
		<div className="ContinueBooking">
			<div className="container pb-7">
				<h1 className="my-7">Хотите продолжить бронирование?</h1>
				{
					!doctorInfo 
					? 
					<BigLoadingState text="Загружаем врача"/>
					: 
					<DoctorCard doctorData={doctorInfo}/>
				}
				<div className="text-center my-7">
					<Link to="/lk">Нет, перейти в личный кабинет</Link>
				</div>
			</div>
		</div> 
		);
}

export default ContinueBooking;
