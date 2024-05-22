import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { browserName, browserVersion, osVersion, osName } from 'react-device-detect';

// components
//import starFilledIcon from '../../pages/img/Home/starFilledIcon.svg';
import carouselControlChevronRight from '../../pages/img/Home/carouselControlChevronRight.svg';

// styles
import './PostCard.scss';

let PostCard = (props) => {
    return (
        
        <div className="PostCard p-2 p-sm-5 pb-6 h-100 d-flex flex-wrap justify-content-center align-content-end" style={{"backgroundImage": (browserName === "Safari" && +browserVersion < 15) ? "url("+props.item.photo+")" : "url("+props.item.photoWebp+")", "backgroundSize": "cover", "backgroundPosition": "center" }}>
			
        	<div className="shadow"></div>

			<div className="d-flex align-items-center justify-content-center mb-2 text-center w-100">
				<span>Новое в блоге</span>
			</div>
									
			<div className="d-flex justify-content-center mb-3 text-center w-100">
				<h3 className="mb-0">{props.item.title}</h3>
			</div>
			<div>
				<Link to={"/post/"+props.item.id} className="forth-btn d-inline-flex align-items-center">Читать<img src={carouselControlChevronRight} alt="" className="ml-2" /></Link>
			</div>
		</div>
    );
}

export default PostCard;