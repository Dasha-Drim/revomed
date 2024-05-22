import {Link} from "react-router-dom";
import LazyLoad from 'react-lazy-load';
import { browserName, browserVersion, osVersion, osName } from 'react-device-detect';

// graphics
import starFilledIcon from './starFilledIcon.svg';
import starStrokedIcon from './starStrokedIcon.svg';

// styles
import './DoctorCardMini.scss';

let DoctorCardMini = (props) => {
	/*
	props.doctorData
	*/

	// PLURAL
	let plural = (number) => {return ['год', 'года', 'лет'][ (number%100>4 && number%100<20)? 2 : [2, 0, 1, 1, 1, 2][(number%10<5)?number%10:5] ] };
	// END OF PLURAL

  	return (
    	<Link to={"/doctor/"+props.doctorData.id}className="DoctorCardMini">
			<div className="DoctorCardMini__avatar" style={{"backgroundImage": (browserName === "Safari" && +browserVersion < 15) ? "url("+props.doctorData.avatar+")" : "url("+props.doctorData.avatarWebp+")", "backgroundSize": "cover", "backgroundPosition": "center" }}></div>
			<div className="pt-2">
				<div className="w-100">
					<span className="DoctorCardMini__experience">Стаж {props.doctorData.experience} {plural(props.doctorData.experience)}</span>
				</div>
				<h4 className="DoctorCardMini__name d-block">{props.doctorData.name}</h4>
			</div>
    	</Link> 
  	);
}

export default DoctorCardMini;
