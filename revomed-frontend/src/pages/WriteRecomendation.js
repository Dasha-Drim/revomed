import { useState, useEffect, useRef } from "react";
import { Redirect, Link } from "react-router-dom";
import API from "../utils/API";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import { FormValidation } from "../utils/FormValidation";

// components
import Rating from "../elements/Rating/Rating";
import Textarea from "../atoms/Textarea/Textarea";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// graphics
import starStrokedIcon from "./img/Rating/starStrokedIcon.svg"
import starFilledIcon from "./img/Rating/starFilledIcon.svg"

// styles
import './WriteRecommendation.scss';

let WriteRecommendation = (props) => {
	const [consultationData, setConsultationData] = useState(null);
	const [reviewAdded, setReviewAdded] = useState(null);
	const [starsValue, setStarsValue] = useState(5);
	const [errors, setErrors] = useState({});
	const [iconStar, setIconStar] = useState(new Array(5).fill(starStrokedIcon));
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);

	// GENERAL MODAL
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL


	// ON PAGE LOAD
	useEffect(() => {
		let getConsultation = async () => {
			let res = await API.get('/consultations/'+props.match.params.link);
			return await res.data;
		}
		getConsultation().then((result) => setConsultationData(result.consultation))
	}, [])
	// END OF ON PAGE LOAD


	// POST ADD REVIEW
	let postAddReview = async (data) => {
		let res = await API.post('/reviews/'+props.match.params.link, data);
		return await res.data;
	}
	// END OF POST ADD REVIEW


	// ADD REVIEW FORM HANDLER
	const addReviewForm = useRef(null);
	let addReviewFormHandler = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(addReviewForm);
		setErrors(currentFormErrors);
		if(!Object.keys(currentFormErrors).length) {
			setFormSubmitButtonIsLoading(true);
			let postData = new FormData(addReviewForm.current);
			postData.append("mark", starsValue);
			postAddReview(postData).then((result) => {
				setFormSubmitButtonIsLoading(false);
				if(result.success) setReviewAdded(true);
				else {
					setGeneralModalHeader("Ошибка");
					setGeneralModalText(result.message);
					setGeneralModalIsOpen(true);
				}
			}, 
			(error) => {
				setFormSubmitButtonIsLoading(false);
				setGeneralModalHeader("Ошибка");
				setGeneralModalText("Что-то пошло не так. Мы не смогли связаться с сервером, обновите страницу и попробуйте ещё раз.");
				setGeneralModalIsOpen(true);
			})
		}
	}
	// END OF ADD REVIEW FORM HANDLER


	// FILL STARS
	let fill = (value) => {
		setStarsValue(value);
		let arr = [];
		iconStar.forEach((el, index) => {
			if (index <= (value-1)) {
				arr.push(starFilledIcon);
			} else {
				arr.push(starStrokedIcon);
			}
		});
		setIconStar(arr)
	}
	// END OF FILL STARS

	return (
	    <div className="WriteReview">
	     	<div className="container py-sm-7">
	     		{consultationData ?
	     		<div className="row justify-content-center">
	     			<form className="review-form col-8 col-md-6 px-5 px-sm-7 pt-7 pb-7 py-md-7" onSubmit={addReviewFormHandler} ref={addReviewForm} noValidate>
	     				<h1 className="review-form__heading">Спасибо за консультацию!</h1>
	     				<span className="review-form__about-item d-block pt-3 pb-2">Пациент — {consultationData.clientName}</span>
						<div className="mt-5">
							<span className="question-label d-block mb-2">Ваш отзыв</span>
							<Textarea tabIndex="-1" label="Ваш отзыв" name="text" validation="notEmpty" errors={errors} />
						</div>
		     			<button type="submit" className="ui-r-main-button w-100 mt-5">
		     				<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Отправить отзыв</span>
		     			</button>
		     			<div className="mt-5 mb-6 mb-sm-0 text-right">
		     				<Link to="/lk">Пропустить</Link>
		     			</div>
	     			</form>
	     		</div>
	     		: <div className="py-7 py-sm-0"><BigLoadingState text="Загружаем информацию о консультации" /></div>}
	     		{reviewAdded ? <Redirect to="/lk" /> : ""}
	     		<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
	     	</div>
	    </div> 
	  );
}

export default WriteRecommendation;
