import { useState, useEffect, useRef } from "react";
import { Redirect, useHistory } from "react-router-dom";
import API from "../utils/API";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import { FormValidation } from "../utils/FormValidation";

// components
import Textarea from "../atoms/Textarea/Textarea";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// styles
import './WriteRecommendation.scss';

let WriteRecommendation = (props) => {
	const [consultationData, setConsultationData] = useState(null);
	const [recommendationAdded, setRecommendationAdded] = useState(null);
	const [errors, setErrors] = useState({});
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);

	// GENERAL MODAL
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL


	// ON PAGE LOAD
	let history = useHistory();
	useEffect(() => {
		let getConsultation = async () => {
			let res = await API.get('/consultations/'+props.match.params.link);
			return await res.data;
		}
		getConsultation().then((result) => setConsultationData(result.consultation), (error) => error.response.status === 404 ? history.replace("/404") : null)
	}, [history, props.match.params.link])
	// END OF ON PAGE LOAD


	// POST ADD RECOMMENDATION
	let postAddRecommendation = async (data) => {
		let res = await API.post('/consultations/recommendations/'+props.match.params.link, data);
		return await res.data;
	}
	// END OF POST ADD RECOMMENDATION


	// ADD REVIEW FORM HANDLER
	const addRecommendationForm = useRef(null);
	let addRecommendationFormHandler = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(addRecommendationForm);
		setErrors(currentFormErrors);
		if(!Object.keys(currentFormErrors).length) {
			setFormSubmitButtonIsLoading(true);
			let postData = new FormData(addRecommendationForm.current);
			postAddRecommendation(postData).then((result) => {
				setFormSubmitButtonIsLoading(false);
				if(result.success) setRecommendationAdded(true);
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

	return (
	    <div className="WriteRecommendation">
	     	<div className="container py-sm-7">
	     		{consultationData ?
	     		<div className="row justify-content-center">
	     			<form className="recommendation-form col-8 col-md-6 px-5 px-sm-7 pt-7 pb-7 py-md-7" onSubmit={addRecommendationFormHandler} ref={addRecommendationForm} noValidate>
	     				<h1 className="recommendation-form__heading">Спасибо за консультацию!</h1>
	     				<span className="recommendation-form__about-item d-block pt-3 pb-2">Пациент — {consultationData.clientName}</span>
						<div className="mt-5">
							<span className="question-label d-block mb-2">Рекомендация</span>
							<Textarea tabIndex="-1" label="Ваш отзыв" name="text" validation="notEmpty" errors={errors} />
						</div>
		     			<button type="submit" className="ui-r-main-button w-100 mt-5">
		     				<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Отправить рекомендацию</span>
		     			</button>
	     			</form>
	     		</div>
	     		: <div className="py-7 py-sm-0"><BigLoadingState text="Загружаем информацию о консультации" /></div>}
	     		{recommendationAdded ? <Redirect to="/lk" /> : ""}
	     		<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
	     	</div>
	    </div> 
	  );
}

export default WriteRecommendation;
