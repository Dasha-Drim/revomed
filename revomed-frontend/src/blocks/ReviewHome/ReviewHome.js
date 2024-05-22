import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { DateTime } from "luxon";
import { SwiperSlide } from 'swiper/react';
import { browserName, browserVersion, osVersion, osName } from 'react-device-detect';
import API from "../../utils/API";

// components
import starFilledIcon from '../../pages/img/Home/starFilledIcon.svg';
import starStrokedIcon from '../../pages/img/Home/starStrokedIcon.svg';

// styles
import './ReviewHome.scss';

let ReviewHome = (props) => {
	const [skip, setSkip] = useState(true)
    return (
        
        <div className="ReviewHome p-5 h-100">
			<div className="d-flex align-items-center mb-4">
				<div className="mr-3">
					<div className="ReviewHome__avatar" style={{"backgroundImage": (browserName === "Safari" && +browserVersion < 15) ? "url("+props.item.avatar+")" : "url("+props.item.avatarWebp+")", "backgroundSize": "cover", "backgroundPosition": "center" }}></div>
				</div>
				<div>
					<h4 className="ReviewHome__author mb-0">{props.item.doctorName}</h4>
					<span className="ReviewHome__category mb-0">{props.item.category}</span>
				</div>
			</div>
									
			<div className="ReviewHome__rating d-flex">
				<img src={+props.item.mark >= 1 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
				<img src={+props.item.mark >= 1.5 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
				<img src={+props.item.mark >= 2.5 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
				<img src={+props.item.mark >= 3.5 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
				<img src={+props.item.mark >= 4.5 ? starFilledIcon : starStrokedIcon} alt="" />
			</div>
			<p className="ReviewHome__text mt-3 w-100">{skip && props.item.text.length > 115 ? props.item.text.slice(0, 115) + "..." : props.item.text} {skip && props.item.text.length > 115 ? <><br/><button className="ReviewHome__button" onClick={() => {setSkip(false)}}>Развернуть</button></> : ""}</p>

			<span className="ReviewHome__date">{props.item.clientName}, {DateTime.fromISO(props.item.date, {zone: 'local'}).setLocale('ru').toFormat('dd MMMM yyyy')}</span>
		</div>
    );
}

export default ReviewHome;