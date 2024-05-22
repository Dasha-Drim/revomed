import { Redirect } from "react-router-dom";
import { useState, useRef } from "react";
import 'react-phone-input-2/lib/bootstrap.css'
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";

// components
import Input from "../atoms/Input/Input";

// graphics
import user from './img/Auth/user.png';
import chevronRightIcon from './img/Auth/chevronRightIcon.svg';

// styles
import './Auth.scss';

let Meeting = (props) => {
	const [errors, setErrors] = useState({});
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
	
	// GENERAL MODAL
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL


	// AUTH METHOD
	let auth = props.useAuth();
	const [userIsReadyToStart, setUserIsReadyToStart] = useState(false);
	// END OF AUTH METHOD


	// UPDATE CLIENTS
	let putClients = async (data) => {
		let res = await API.put('/clients', data);
		return await res.data;
	};
	// END OF UPDATE CLIENTS
	

	// MEETING FORM
	const meetingForm = useRef(null);
	let meetingFormHandler = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(meetingForm);
	    setErrors(currentFormErrors);
	    if(!Object.keys(currentFormErrors).length) {
	    	setFormSubmitButtonIsLoading(true);
	    	let postData = new FormData(meetingForm.current);
	    	putClients(postData).then((result) => {
				setFormSubmitButtonIsLoading(false);
				if(result.success) auth.reconfirm(() => setUserIsReadyToStart(true));
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
	// MEETING FORM

  return (
    <div className="Auth">

    	<div className="container py-7 my-7 my-lg-0">
    		<div className="row align-items-center text-center">

    		<div className="authorized-user-decoration col-lg-5 d-none d-lg-block">
    			<div className="w-50 ml-7">
						<img className="user-image" src={user} alt="" />
					</div>

					<div className="mini-block px-4 py-4 mr-5 text-left">
						<h5 className="mini-block__heading mb-0">Кристина</h5>
						<span className="mini-block__inscription">Личный кабинет</span>
						<div className="mini-block__created mt-3 align-items-button d-none d-lg-flex">
							<span className="mr-3">Аккаунт создан</span>
							<div className="decoration-go"><img src={chevronRightIcon} alt="" /></div>
						</div>
					</div>
	      </div>

				<div className="Auth__content col-8 col-lg-3">
					<h1 className="mb-4">Познакомимся</h1>
					<p className="">Чтобы нам было удобнее к Вам обращаться, давайте познакомимся</p>
					<form ref={meetingForm} className=" mt-6" onSubmit={meetingFormHandler}>
						<div className="input-holder mt-4">
							<Input name="name" label="Ваше имя" validation="notEmpty onlyLetters" errors={errors} />
						</div>
						<button className="mt-4 m-btn w-100 d-inline-block" type="submit">
							<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading ? "invisible" : ""}>В личный кабинет</span>
						</button>
					</form>
				</div>


				</div>
    	</div>

    	{userIsReadyToStart ? <Redirect to="/lk" /> : ""}

    	<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />

    </div> 
  );
}

export default Meeting;
