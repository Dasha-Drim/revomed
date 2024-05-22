import { useState, useEffect, useRef } from "react";
import API from "../utils/API";
import ENVIRONMENT from '../utils/ENVIRONMENT';
import { Link, useHistory } from "react-router-dom";
import EditorJs from "react-editor-js";
import { DateTime } from 'luxon';
import SEO from "../utils/SEO";
import {
  FacebookShareButton,
  TelegramShareButton,
  TwitterShareButton,
  VKShareButton,
} from "react-share";
import EditorJsEmbed from '@editorjs/embed'
import EditorJsParagraph from '@editorjs/paragraph'
import EditorJsList from '@editorjs/list'
import EditorJsLinkTool from '@editorjs/link'
import EditorJsImage from '@editorjs/image'
import EditorJsHeader from '@editorjs/header'
import EditorJsQuote from '@editorjs/quote'
import EditorJsMarker from '@editorjs/marker'
import EditorJsSimpleImage from '@editorjs/simple-image'
import { browserName, browserVersion, osVersion, osName } from 'react-device-detect';

// components
import BannerGotoCatalog from "../blocks/BannerGotoCatalog/BannerGotoCatalog";
import DoctorCard from "../blocks/DoctorCard/DoctorCard";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// graphics
import arrowLeft from './img/arrowLeft.svg';
import shareIcon from './img/shareIcon.svg';
import vkIcon from './img/vkIcon.svg';
import telegramIcon from './img/telegramIcon.svg';
import twitterIcon from './img/twitterIcon.svg';
import facebookIcon from './img/facebookIcon.svg';

// styles
import './Post.scss';

let Post = (props) => {
	const [postData, setPostData] = useState(null);
	const [dropdownIsOpen, setDropdownIsOpen] = useState(false);
	const [shareObj, setShareObj] = useState(null);

	// POST CONTENT EDITOR 
	const EDITOR_JS_TOOLS = {
		embed: EditorJsEmbed,
		paragraph: EditorJsParagraph,
		list: EditorJsList,
		linkTool: EditorJsLinkTool,
		image: EditorJsImage,
		header: EditorJsHeader,
		quote: EditorJsQuote,
		marker: EditorJsMarker,
		simpleImage: EditorJsSimpleImage,
	}
	// / POST CONTENT EDITOR 


	// SHARE DROPDOWN
	let shareDropdownOpen = (e) => {
		e.preventDefault();
		if(!shareObj) return;
		if(typeof navigator.share === "undefined") return setDropdownIsOpen(!dropdownIsOpen);
		navigator.share(shareObj)
		.then(() => console.log("Shareing successfull"))
		.catch(() => console.log("Sharing failed"))
	}
	const socialListMobileRef = useRef(null);
	const socialListDesktopRef = useRef(null);
  	useEffect(() => {
  		document.cookie = "bookingInfo=;max-age=-1";
    	function handleClickOutside(event) {
      		if (socialListDesktopRef.current && socialListMobileRef && !socialListDesktopRef.current.contains(event.target) && !socialListMobileRef.current.contains(event.target)) {
        	setDropdownIsOpen(false);
      		}
	    }
	    document.addEventListener("mousedown", handleClickOutside);
	    return () => {
	      document.removeEventListener("mousedown", handleClickOutside);
	    };
	}, []);
	// END OF SHARE DROPDOWN


	// ON PAGE LOAD
	let history = useHistory();
	useEffect(() => {
		let getPost = async (data) => {
			let res = await API.get('/posts/'+props.match.params.postId, data);
			return await res.data;
		}
		getPost().then((result) => {
			if(!result.success) return;
			setPostData(result.post);
			setShareObj({
				title: result.post.title,
				url: ENVIRONMENT.frontendURL+props.location.pathname
			})
		}, (error) => error.response.status === 404 ? history.replace("/404") : null);
	}, [history, props.match.params.postId, props.location.pathname])
	// END OF ON PAGE LOAD

	return (
		<div className="Post">
		<div className="container pb-7">

		{postData ? <>
			<SEO pageProps={{
				title: postData.title + " — REVOMED",
				thumbnail: postData.photo,
				url: ENVIRONMENT.frontendURL+props.location.pathname}} 
			/>

			<div className="row goto-previous-page py-7 d-none d-sm-block">
				<div className="col-auto goto-previous-page__button-holder">
					<Link to="/blog" className="m-btn-mini px-4"><img src={arrowLeft} className="mr-2" alt="back" />Назад к блогу</Link>
				</div>
			</div>

			<div className="row">

				<div className="col-8 mb-5 px-0 px-sm-col">
					<div className="post-container pb-6">
						<div className="post-container__photo d-flex flex-wrap" style={{background: (browserName === "Safari" && +browserVersion < 15) ? "url("+postData.photo+")" : "url("+postData.photoWebp+")", "backgroundSize": "cover", "backgroundPosition": "center"}}>
							<div className="post-container__name px-4 px-sm-7 my-6 w-100">
								<h1>{postData.title}</h1>
							</div>
							<div className="post-container__info ml-4 ml-sm-0 px-sm-7 mt-5 mt-sm-0 mb-sm-6">
								<span className="mr-4">{postData.author.name}</span>
								<span>{DateTime.fromISO(postData.date, {zone: 'local'}).setLocale('ru').toFormat('dd MMMM yyyy')}</span>
							</div>
							<div className="post-container__action-links d-none d-lg-flex align-items-center mb-sm-6 px-7">
								<div className="d-block share-widget ml-4" ref={socialListDesktopRef}>
									<button className="m-btn-mini px-4" onClick={(e) => shareDropdownOpen(e)}><img src={shareIcon} className="mr-3" alt="share" /> Поделиться</button>
									<div className={`share-widget__dropdown ${!dropdownIsOpen ? 'd-none' : ''}`}>
										<FacebookShareButton beforeOnClick={() => setDropdownIsOpen(false)} {...shareObj} resetButtonStyle={false} className="m-btn-mini facebook" ><img src={facebookIcon} alt="facebook" /></FacebookShareButton>
										<TelegramShareButton beforeOnClick={() => setDropdownIsOpen(false)} {...shareObj} resetButtonStyle={false} className="m-btn-mini telegram" ><img src={telegramIcon} alt="telegram" /></TelegramShareButton>
										<VKShareButton beforeOnClick={() => setDropdownIsOpen(false)} {...shareObj} resetButtonStyle={false} className="m-btn-mini vk" ><img src={vkIcon} alt="vk" /></VKShareButton>
										<TwitterShareButton beforeOnClick={() => setDropdownIsOpen(false)} {...shareObj} resetButtonStyle={false} className="m-btn-mini twitter" ><img src={twitterIcon} alt="twitter" /></TwitterShareButton>
									</div>
								</div>
							</div>
						</div>
						<div className="post-container__content pt-6 px-4 px-md-7 pb-2" id="editorjs">
							<EditorJs minHeight={0} tools={EDITOR_JS_TOOLS} data={postData.description} readOnly />
						</div>
						<div className="post-container__action-links d-flex d-lg-none align-items-center px-4 px-md-7 pt-4">
							<div className="d-block share-widget" ref={socialListMobileRef}>
								<button className="m-btn-mini px-4" onClick={(e) => shareDropdownOpen(e)}><img src={shareIcon} className="mr-3" alt="share" /> Поделиться</button>
								<div className={`share-widget__dropdown ${!dropdownIsOpen ? 'd-none' : ''}`}>
									<FacebookShareButton beforeOnClick={() => setDropdownIsOpen(false)} url={ENVIRONMENT.frontendURL+props.location.pathname} resetButtonStyle={false} className="m-btn-mini facebook" ><img src={facebookIcon} alt="facebook" /></FacebookShareButton>
									<TelegramShareButton beforeOnClick={() => setDropdownIsOpen(false)} url={ENVIRONMENT.frontendURL+props.location.pathname} resetButtonStyle={false} className="m-btn-mini telegram" ><img src={telegramIcon} alt="telegram" /></TelegramShareButton>
									<VKShareButton beforeOnClick={() => setDropdownIsOpen(false)} url={ENVIRONMENT.frontendURL+props.location.pathname} resetButtonStyle={false} className="m-btn-mini vk" ><img src={vkIcon} alt="vk" /></VKShareButton>
									<TwitterShareButton beforeOnClick={() => setDropdownIsOpen(false)} url={ENVIRONMENT.frontendURL+props.location.pathname} resetButtonStyle={false} className="m-btn-mini twitter" ><img src={twitterIcon} alt="twitter" /></TwitterShareButton>
								</div>
							</div>
						</div>
						{postData.author.type === 'clinic' ?
							<div className="pt-6 px-4 px-md-7 d-flex flex-wrap flex-md-nowrap align-items-center text-center text-md-left mb-0 mb-md-0">
								<div className="Clinic__avatar flex-shrink-0 mx-auto mx-md-0 mb-5 mb-md-0" style={{"background": "url("+postData.author.logo+")", "backgroundSize": "cover", "backgroundPosition": "center"}}></div>
								<div className="ml-md-5 d-md-flex justify-content-between flex-column w-100">
									<div>
										<div className="mb-3 d-flex align-items-center justify-content-center justify-content-md-start">
											<Link to={"/clinic/"+postData.author.idClinic} className="Clinic__name mb-0">{postData.author.name}</Link>
		      							</div>
										<span className="pr-4">Клиника</span>
										<span className="Doctor__address">{postData.author.country}, {postData.author.city}</span>
									</div>
								</div>
							</div>
						: ""}
					</div>
				</div>

				<div className="col-8 pb-5 pt-sm-0">
					{ postData.author.type === 'doctor' ? <DoctorCard doctorData={postData.author} /> : 
					postData.author.type === 'admin' ? <BannerGotoCatalog /> : 
					postData.author.type === 'clinic' ? <>
						{postData.author.doctors.map((item, key) =>
						<div key={key} className="col-8 pb-5 pt-sm-0">
							<DoctorCard doctorData={item} />
						</div>
		    			)}
					</> : '' }
				</div>

			</div>
			</> : <div className="pt-7"><BigLoadingState text="Загружаем статью" /></div> }
		</div>
		</div> 
		);
}

export default Post;
