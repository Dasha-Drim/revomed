import { Link } from "react-router-dom";
import { useState, useEffect, lazy, Suspense} from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Thumbs, Navigation } from 'swiper/core';
import { DateTime } from 'luxon';
import API from "../utils/API";

import { browserName, browserVersion, osVersion, osName } from 'react-device-detect';

// components
import DoctorCardMini from "../blocks/DoctorCardMini/DoctorCardMini";
import Search from "../blocks/Search/Search";
import ReviewHome from "../blocks/ReviewHome/ReviewHome";
import PostCard from "../blocks/PostCard/PostCard";
import Carousel from "../utils/Carousel/Carousel";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";



// graphics
import video from './img/Home/video.svg';
import checkup from './img/Home/checkup.svg';
import clinics from './img/Home/clinics.svg';
import home from './img/Home/home.svg';
import pc from './img/Home/pc.png';
import clinic from './img/Home/clinic.png';
import signature from './img/Home/signature.svg';


import clockIcon from './img/Home/clockIcon.svg';
import rubleIcon from './img/Home/rubleIcon.svg';
import caseIcon from './img/Home/caseIcon.svg';
import lockIcon from './img/Home/lockIcon.svg';
import SMI_meduza from './img/Home/SMI_meduza.png';
import SMI_lenta from './img/Home/SMI_lenta.png';
import SMI_vcru from './img/Home/SMI_vcru.png';
import SMI_vedomosti from './img/Home/SMI_vedomosti.png';
import serviceForYouWebp from './img/Home/serviceForYou.webp';
import serviceForYou from './img/Home/serviceForYou.png';
import starFilledIcon from './img/Home/starFilledIcon.svg';
import starStrokedIcon from './img/Home/starStrokedIcon.svg';
import chevronRightIcon from './img/Home/chevronRightIcon.svg';
import serviceForWomenWebp from './img/Home/serviceForWomen.webp';
import serviceForWomen from './img/Home/serviceForWomen.png';
import clockMiniIcon from './img/Home/clockMiniIcon.svg';
import chevronRightMiniIcon from './img/Home/chevronRightMiniIcon.svg';
import plusIcon from './img/Home/plusIcon.svg';
import carouselControlChevronLeft from './img/Home/carouselControlChevronLeft.svg';
import carouselControlChevronRight from './img/Home/carouselControlChevronRight.svg';

// styles
import './Home.scss';

// slider init
import 'swiper/swiper.scss';
SwiperCore.use([Thumbs, Navigation]);

//const BigLoadingState = lazy(() => import("../elements/BigLoadingState/BigLoadingState"));
//const Carousel = lazy(() => import("../utils/Carousel/Carousel"));
//const DoctorCardMini = lazy(() => import("../blocks/DoctorCardMini/DoctorCardMini"));

let Home = () => {
	const [thumbsSwiper, setThumbsSwiper] = useState(null);
	const [mainSwiper, setMainSwiper] = useState(null);
	const [categorySwipers, setCategorySwipers] = useState([]);
	const [categories, setCategories] = useState(null);
	const [categoriesArr, setCategoriesArr] = useState(null);
	const [miniCatalog, setMiniCatalog] = useState(null);
	const [reviews, setReviews] = useState(null);
	const [posts, setPosts] = useState(null);
	const [skip, setSkip] = useState(true);

	const [elements] = useState(6);


	// ON PAGE LOAD
	useEffect(() => {
		document.cookie = "bookingInfo=;max-age=-1";
		// get filters
		let getCategories = async () => {
			let res = await API.get('/categories');
			return await res.data;
		};
		// get catalog
		let getCatalog = async (data) => {
			let res = await API.get('/doctors/', {params: data});
			return await res.data;
		}
		// get rewiews
		let getRewiews = async (data) => {
			let res = await API.get('/reviews/', {params: data});
			return await res.data;
		}

		// GET POSTS
		let getPosts = async (data) => {
			let res = await API.get('/posts', data);
			return await res.data;
		}
		// END OF GET POSTS

		// load data
		getCategories().then((result) => {
			setCategoriesArr(result.categories);
			let currentCategories = result.categories.filter(item => (item.name === "gynecology") || (item.name === "breastFeeding") || (item.name === "psychologist1"));
			setCategories(currentCategories);
			let displayedCategories = result.categories.reduce((accum, item) => (item.name === "gynecology") || (item.name === "breastFeeding") || (item.name === "psychologist1") ? accum + (!accum ? "" : ",") + item.name : accum, "");
			console.log("displayedCategories", displayedCategories)
			console.log("result.categories", result.categories)
			getCatalog({categories: displayedCategories, object: true}).then((result) => setMiniCatalog(result.doctors));
			getRewiews({page: "home"}).then((result) => setReviews(result.reviews));
		})
		getPosts({params: {limit: 10, offset: 0}}).then((result) => {
			setPosts(result.posts);
		})
		console.log("browserName", browserName)
		console.log("browserVersion", browserVersion)
		console.log("osVersion", osVersion)
		console.log("osName", osName)
	}, [])
	// END OF ON PAGE LOAD


	// CATEGORIES SWIPER CAROUSEL
	let appendCategorySwiper = (swiper) => {
		setCategorySwipers(actual => {
			let arr = actual.slice(0);
			arr.push(swiper);
			return arr;
		})
	}
	useEffect(() => {
		if(!categorySwipers.length) return;
		// swiper's orientation bug fix
		window.addEventListener("orientationchange", function() {
			categorySwipers.forEach(item => {
				setTimeout(() => item.update(), 50)
			})
		}, false);
	}, [categorySwipers])
	// END OF CATEGORIES SWIPER CAROUSEL

	let [search, setSearch] = useState(false)

	let updateStateSearch = (state) => {
		setSearch(state);
		if (state === true) document.body.classList.add('hidden');
		else document.body.classList.remove('hidden');
	}

	//const renderLoader = () => <p>Loading</p>;

  return (
    <div className="Home">

    	<section className={`search-section py-5 pb-7 py-md-6 pb-md-7 justify-content-center text-sm-center ${search ? "active" : ""}`}>
    			<div className="container">
	    			<div className="row justify-content-center">
		    				<div className="col-8 col-md-6 position-ralative">
			    			<h1 className="search-section__heading pb-6">Медицинские сервисы <br/>для будущих мам</h1>
			    			</div>
			    			<div className="col-8 col-md-6 position-ralative">
			    			<Search page="home" placeholder="Специализация, ФИО, клиника..." updateState={updateStateSearch} />
			    			<img className="d-none d-xxl-inline search-section__signature" src={signature} alt=""/>
		    			</div>
		    		</div>
		    	</div>
    		</section>

    	<section className="fast-access-section pb-4 pt-7">
				<div className="container">
					<div className="row">
						<div className="col-8">
							<h2 className="mb-6">Быстрый доступ</h2>
						</div>
						<div className="col-4 col-lg-2 pb-5 pb-lg-0">
							<Link to={{pathname: "/catalog", state: {online: true}}} className="w-100 py-4 py-sm-6 px-4 text-sm-center d-flex flex-wrap justify-content-sm-center fast-access-section__button-holder">
								<img src={video} alt=""/>
								<span className="d-block w-100 mt-2">Специалисты <br className="d-sm-none"/>онлайн</span>
							</Link>
						</div>
						<div className="col-4 col-lg-2 pb-5 pb-lg-0">
							<Link to={{pathname: "/catalog", state: {online: false}}} className="w-100 py-4 py-sm-6 px-4 text-sm-center d-flex flex-wrap justify-content-sm-center fast-access-section__button-holder">
								<img src={home} alt=""/>
								<span className="d-block w-100 mt-2">Специалисты в <br className="d-sm-none"/>клинике</span>
							</Link>
						</div>
						<div className="col-4 col-lg-2">
							<Link to="/clinics" className="w-100 py-4 py-sm-6 px-4 text-sm-center d-flex flex-wrap justify-content-sm-center fast-access-section__button-holder">
								<img src={clinics} alt=""/>
								<span className="d-block w-100 mt-2">Медицинские <br className="d-sm-none"/>центры</span>
							</Link>
						</div>
						<div className="col-4 col-lg-2">
							<div className="w-100 py-4 py-sm-6 px-4 text-sm-center d-flex flex-wrap justify-content-sm-center fast-access-section__button-holder fast-access-section__button-holder--disabled">
								<img src={checkup} alt=""/>
								<span className="d-block w-100 mt-2">Чекапы <br className="d-sm-none"/>(скоро)</span>
							</div>
						</div>
						
					</div>
				</div>
			</section>

			<section className="categories-section pt-6 pb-4">
				<div className="container">
					<div className="row">
						<div className="col-8">
							<h2 className="mb-6">Специализации</h2>
						</div>

						{
							categoriesArr && categoriesArr.length ?
								[0, 1, 2, 3].map((i, keyCol) =>
									<div className="col-8 col-sm-4 col-lg-2" key={keyCol}>
									{categoriesArr.slice(i*6, i*6 + 6).length ? categoriesArr.slice(i*6, i*6 + 6).map((item, key) =>
										<div key={key+5} className={`mb-4 ${(i !== 0 && skip) ? "d-none d-sm-block" : ""}`}>
											<Link to={{pathname: "/catalog", state: {category: item.name, categoryTitle: item.title}}}>{item.title}</Link>
											
										</div>
									) : ""}
									<button className={`ReviewHome__button ${(i === 0 && skip) ? "d-block d-sm-none" : "d-none"} `} onClick={() => {setSkip(false)}}>Развернуть</button>
									</div>
								)
								
							: ""
						}
						
					</div>
				</div>
			</section>

			<section className="gynecology-section pt-6 pb-4">
				<div className="container">
					<div className="row">
						<div className="col-8 d-flex  justify-content-between align-items-center mb-6">
							<h2 className="mb-0">Гинекология</h2>
							<div className="gynecology-section__carousel-control  d-none d-md-flex">
								<button className="swiper-button-prev-gynecology"><img src={carouselControlChevronLeft} alt="" loading="lazy"/></button>
								<button className="swiper-button-next-gynecology ml-3"><img src={carouselControlChevronRight} alt="" loading="lazy"/></button>
							</div>
						</div>
						<div className="col-8 mb-5">
							<Swiper navigation={{prevEl: '.swiper-button-prev-gynecology', nextEl: '.swiper-button-next-gynecology'}} spaceBetween={20} breakpoints={{368: {slidesPerView: 2.2}, 420: {slidesPerView: 2.3}, 480: {slidesPerView: 2.9}, 576: {slidesPerView: 2.9, spaceBetween: 20}, 768: {slidesPerView: 4.5}, 992: {slidesPerView: 5.5}, 1200: {slidesPerView: 6.1}, 1600: {slidesPerView: 5.5}}} slidesPerView={2.2}>
									{miniCatalog ? miniCatalog.gynecology.map((item, key) =>
									<SwiperSlide key={key}>
										<DoctorCardMini doctorData={item} />
									</SwiperSlide>
									) : ""}
							</Swiper>
							</div>
							<div className="col-8 text-center d-flex justify-content-center">
								<Link to="/catalog" className="third-btn">Записаться к специалисту от 2420 ₽</Link>
							</div>
					</div>
				</div>
			</section>

			<section className="container pt-6 pb-4">
			<div className="banner-section">
				<div className="row">
					<div className="col-8">
						<div className="banner px-5 py-6 position-relative">
							<div className="row p-0 m-0">
								<div className="col-8 col-lg-4 mb-4">
									<h2 className="">Заботимся о вашем здоровье</h2>
								</div>
								<div className="col-8 col-lg-6 p-0 m-0">
									<div className="row p-0 m-0 justify-content-between justify-content-lg-start">
										<div className="col-8 col-md-2 mb-5 mb-md-0">
											<h3>Более 3 000</h3>
											<span>Клиентов записались через Revomed.ru</span>
										</div>
										<div className="col-8 col-md-2 mb-5 mb-md-0">
											<h3>Более 600</h3>
											<span>Проверенных врачей и консультантов в базе</span>
										</div>
										<div className="col-8 col-md-2">
											<h3>Более 50</h3>
											<span>Частных клиник подключено к сервису</span>
										</div>
									</div>
								</div>
								<img src={clinic} alt="" className="banner-image bottom d-none d-lg-inline" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

			<section className="breastFeeding-section pt-6 pb-4">
				<div className="container">
					<div className="row">
						<div className="col-8 d-flex  justify-content-between align-items-center mb-6">
							<h2 className="mb-0">Грудное вскармливание</h2>
							<div className="breastFeeding-section__carousel-control d-none d-md-flex">
								<button className="swiper-button-prev-breastFeeding"><img src={carouselControlChevronLeft} alt="" loading="lazy"/></button>
								<button className="swiper-button-next-breastFeeding ml-3"><img src={carouselControlChevronRight} alt="" loading="lazy"/></button>
							</div>
						</div>
						<div className="col-8 mb-5">
							<Swiper navigation={{prevEl: '.swiper-button-prev-breastFeeding', nextEl: '.swiper-button-next-breastFeeding'}} spaceBetween={20} breakpoints={{368: {slidesPerView: 2.2}, 420: {slidesPerView: 2.3}, 480: {slidesPerView: 2.9}, 576: {slidesPerView: 2.9, spaceBetween: 20}, 768: {slidesPerView: 4.5}, 992: {slidesPerView: 5.5}, 1200: {slidesPerView: 6.1}, 1600: {slidesPerView: 5.5}}} slidesPerView={2.2}>
									{miniCatalog ? miniCatalog.breastFeeding.map((item, key) =>
									<SwiperSlide key={key}>
										<DoctorCardMini doctorData={item} />
									</SwiperSlide>
									) : ""}
							</Swiper>
							</div>
							<div className="col-8 text-center d-flex justify-content-center">
								<Link to="/catalog" className="third-btn">Записаться к специалисту от 2420 ₽</Link>
							</div>
					</div>
				</div>
			</section>

			<section className="psychologist1-section pt-6 pb-4">
				<div className="container">
					<div className="row">
						<div className="col-8 d-flex  justify-content-between align-items-center mb-6">
							<h2 className="mb-0">Психология</h2>
							<div className="psychologist1-section__carousel-control  d-none d-md-flex">
								<button className="swiper-button-prev-psychologist1"><img src={carouselControlChevronLeft} alt="" loading="lazy"/></button>
								<button className="swiper-button-next-psychologist1 ml-3"><img src={carouselControlChevronRight} alt="" loading="lazy"/></button>
							</div>
						</div>
						<div className="col-8 mb-5">
							<Swiper navigation={{prevEl: '.swiper-button-prev-psychologist1', nextEl: '.swiper-button-next-psychologist1'}} spaceBetween={20} breakpoints={{368: {slidesPerView: 2.2}, 420: {slidesPerView: 2.3}, 480: {slidesPerView: 2.9}, 576: {slidesPerView: 2.9, spaceBetween: 20}, 768: {slidesPerView: 4.5}, 992: {slidesPerView: 5.5}, 1200: {slidesPerView: 6.1}, 1600: {slidesPerView: 5.5}}} slidesPerView={2.2}>
									{miniCatalog ? miniCatalog.psychologist1.map((item, key) =>
									<SwiperSlide key={key}>
										<DoctorCardMini doctorData={item} />
									</SwiperSlide>
									) : ""}
							</Swiper>
							</div>
							<div className="col-8 text-center d-flex justify-content-center">
								<Link to="/catalog" className="third-btn">Записаться к специалисту от 2420 ₽</Link>
							</div>
					</div>
				</div>
			</section>



			<section className="reviews-section pt-6 pb-4">
			<div className="container">
				<div className="reviews-section-header row mx-0 justify-content-between align-items-center mb-6">
					<h2 className="reviews-section-header__title mb-0">Вот что о нас думают</h2>
					<div className="reviews-section-header__carousel-control d-none d-md-flex">
						<button className="swiper-button-prev"><img src={carouselControlChevronLeft} alt="" loading="lazy"/></button>
						<button className="swiper-button-next ml-3"><img src={carouselControlChevronRight} alt="" loading="lazy"/></button>
					</div>
				</div>
				<div className="row mx-0">
					<Swiper className="reviews-section-carousel" spaceBetween={20} breakpoints={{992: {slidesPerView: 2.1}}} slidesPerView={1.2} navigation={{prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next'}} >
						
						{
							reviews && reviews.length ?
							reviews.map((item, key) =>
								<SwiperSlide className="" key={key}>
								<ReviewHome item={item} />
								</SwiperSlide>
							)
							: ""
						}

						
					</Swiper>
				</div>
			</div>
		</section>

		<section className="blog-section pt-6 pb-4">
			<div className="container">
				<div className="blog-section-header row mx-0 justify-content-between align-items-center mb-6">
					<h2 className="blog-section-header__title mb-0">Наш блог</h2>
					<div className="blog-section-header__carousel-control d-none d-md-flex">
						<button className="swiper-button-prev-blog"><img src={carouselControlChevronLeft} alt="" loading="lazy"/></button>
						<button className="swiper-button-next-blog ml-3"><img src={carouselControlChevronRight} alt="" loading="lazy"/></button>
					</div>
				</div>
				<div className="row mx-0">
					<Swiper className="blog-section-carousel" spaceBetween={20} breakpoints={{576: {slidesPerView: 1.2}, 992: {slidesPerView: 2.1}}} slidesPerView={1} navigation={{prevEl: '.swiper-button-prev-blog', nextEl: '.swiper-button-next-blog'}} >
						
						{
							posts && posts.length ?
							posts.map((item, key) =>
								<SwiperSlide className="" key={key}>
								<PostCard	 item={item} />
								</SwiperSlide>
							)
							: ""
						}

						
					</Swiper>
				</div>
			</div>
		</section>

		<section className="container pt-6 pb-7">
			<div className="banner-section">
				<div className="row">
					<div className="col-8">
						<div className="banner px-5 py-6 position-relative">
							<div className="row p-0 m-0">
								<div className="col-8 col-lg-4">
									<h2 className="mb-3">Получите консультацию не выходя из дома</h2>
									<p className="mb-4">100% конфиденциально, в удобном личном <br/>кабинете по аудио и видео связи</p>
									<Link to={{pathname: "/catalog", state: {online: true}}} className="fifth-btn d-inline-flex align-items-center"><img src={video} alt="" className="mr-2" />Онлайн консультации<img src={carouselControlChevronRight} alt="" className="ml-3" /></Link>
								</div>
								<img src={pc} alt="" className="banner-image d-none d-lg-inline" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

</div>
    
    	
  );
}

export default Home;