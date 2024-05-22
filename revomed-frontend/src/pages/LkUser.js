import { Link, useHistory, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { DateTime } from 'luxon';
import API from "../utils/API";

// components
import UIReviews from "../UI/User/Reviews/UIReviews";
import UIFavourites from "../UI/User/Favourites/UIFavourites";
import UIHistory from "../UI/User/History/UIHistory";
import UIUserConsultations from "../UI/User/Consultations/UIUserConsultations";
import SliderSubcategories from "../UI/User/SliderSubcategories/SliderSubcategories";

// graphics
import pencilEditIcon from './img/LkUser/pencilEditIcon.svg';
import subcategory from './img/subcategory.jpg';
import bannerHelpful from './img/bannerHelpful.png';
import cross from './img/cross.svg';

//cross.svg

// styles
import './LkUser.scss';

let LkUser = (props) => {
	let history = useHistory();

	let [section, setSection] = useState(history.location.state && history.location.state.section ? history.location.state.section : "consultations");
	let [categories, setCategories] = useState([]);

  let [showBanner, setShowBanner] = useState(true);

	// AUTH METHOD
	let auth = props.useAuth();
	// END OF AUTH METHOD

	let getSubcategories = async () => {
			let res = await API.get('/subcategories');
			return await res.data;
	}

	let getCookie = (name) => {
		let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
		return matches ? decodeURIComponent(matches[1]) : undefined;
	}
	useEffect(() => {
		let cookieMatch = getCookie("bookingInfo");
		let cookieMatchReview = getCookie("linkReview");
		if (cookieMatch) history.push('/continue-booking');
		if (cookieMatchReview) history.push(cookieMatchReview);

		let banner = getCookie("bannerHelpful");
		if (banner) setShowBanner(false);

		getSubcategories().then((result) => {
			console.log("result", result)
			setCategories(result.categories);
			
		});
	}, [])

	let closeBanner = () => {
		console.log("close");
		document.cookie = "bannerHelpful=close";
		setShowBanner(false)
	}


  return (
    <div className="LkUser">

    	<div className="container py-7">

    		<div className="row pb-7">
					<div className="col-8 d-flex justify-content-center">
						<div className="LkUser__switcher">
							<button className={`${section ==="consultations" ? "active" : ""}`} onClick={() => {setSection("consultations"); history.replace({pathname: "/lk", state: {section: "consultations"}})}}>Консультации</button>
							<button className={`${section ==="helpful" ? "active" : ""}`} onClick={() => {setSection("helpful"); history.replace({pathname: "/lk", state: {section: "helpful"}})}}>Полезное</button>
						</div>
      		</div>
      	</div>

      	{
      	section ==="consultations" ? 
      	<>
      	<div className="row align-items-center align-content-center pb-7">
      		<div className="col-8 col-lg-4 d-flex flex-wrap justify-content-center justify-content-lg-start text-center text-lg-left mb-7 mb-lg-0">
      			<h1 className="LkUser__name w-100 mb-2">{props.userInfo.name}</h1>
      			<span className="LkUser__timezone w-100 mb-4">Ваш часовой пояс: {DateTime.now().zoneName}</span>
      			<Link to="/lk/edit" className="edit-button"><img src={pencilEditIcon} className="mr-2" alt="" /> Редактировать профиль</Link>
      		</div>
      		<div className="col-8 col-lg-4">
      			<UIUserConsultations />
      		</div>
      	</div>

      	{showBanner ?
      	<div className="row pb-7">
      		<div className="col-8">
						<div className="banner_lk d-flex justify-content-center text-center flex-wrap position-relative">
									<button className="cross position-absolute" onClick={() => closeBanner()}><img src={cross} alt=""/></button>
									<h2 className="d-block w-100 mb-3">В разделе “Полезное” много полезного!</h2>
									<p className="d-block w-100 mb-5">Здесь можно узнать всё о здоровье себя и детей</p>
									<button className="m-btn" onClick={() => {setSection("helpful"); history.replace({pathname: "/lk", state: {section: "helpful"}})}}>Перейти</button>
						</div>
      		</div>
      	</div>
      	: "" }

				<div className="row pb-7">
					<div className="col-8">
						<UIHistory />
      		</div>
      	</div>

				<div className="row pb-7">
					<div className="col-8">
						<UIReviews />
					</div>
				</div>

				<div className="row pb-7">
					<div className="col-8">
						<UIFavourites />
					</div>
				</div>
				

				<div className="row pb-7">
					<div className="col-8">
						<div className="exit">
							<button className="ui-secondary-button w-100 py-4" onClick={() => auth.signout(() => {})}>Выйти из аккаунта</button>
						</div>
					</div>
				</div>
				</>
				: section ==="helpful" ?
				<>
					<div className="row pb-7">
						<div className="col-8">
							<div className="row m-0 p-0 banner">
								<div className="col-8 col-md-4 m-0 p-7 d-flex align-content-center flex-wrap align-items-center">
									<h1>Наша база знаний</h1>
									<p>Мы собрали полезный контент по вопросам женского здоровья, здоровья семьи и детей в одном месте. Выбирайте интересные вам категории, читайте полезные статьи от экспертов, находите выгодные предложения на товары для мам, детей и всей семьи.</p>
								</div>
								<div className="col-8 col-md-4 m-0 p-0 d-none d-sm-flex justify-content-center">
									<img src={bannerHelpful} alt="" />
								</div>
						</div>
						</div>
					</div>
					{categories.length ? 
						categories.map((item, key) => 
						<div className="row pb-7" key={key}>
							<div className="col-8">
								<SliderSubcategories items={item.subcategories} title={item.name} id={key} />
							</div>
						</div>
						)
						:
						""
					}
				</>
				: ""
				}

      </div>

    </div> 
  );
}

export default LkUser;