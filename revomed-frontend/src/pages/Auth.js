import { Redirect, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import PhoneInput from 'react-phone-input-2'
import ru from 'react-phone-input-2/lang/ru.json'
import 'react-phone-input-2/lib/bootstrap.css'
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import {Helmet} from 'react-helmet';

import data from "../utils/ENVIRONMENT";

import ReCAPTCHA from "react-google-recaptcha";

import { GoogleReCaptchaProvider, GoogleReCaptcha } from 'react-google-recaptcha-v3';

// components
import Input from "../atoms/Input/Input";

// graphics
import user from './img/Auth/user.png';
import women from './img/Auth/women.png';
import chevronRightIcon from './img/Auth/chevronRightIcon.svg';

// styles
import './Auth.scss';

let Auth = (props) => {
	const [authStep, setAuthStep] = useState(0);
	const [errors, setErrors] = useState({});
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
	const [formSubmitButtonIsLoading2, setFormSubmitButtonIsLoading2] = useState(false);
	const [phoneNumber, setPhoneNumber] = useState("");
	const [selCountryCode, setSelCountryCode] = useState('ru')
	const [selCountryExpectedLength, setSelCountryExpectedLength] = useState(null)
	const [isValid, setIsValid] = useState(true);

	// GENERAL MODAL
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL
	

	// AUTH METHOD
	let auth = props.useAuth();
	const [userIsLoggedIn, setUserIsLoggedIn] = useState(auth.userType !== "vizitor");
	// END OF AUTH METHOD


	// POST AUTH USER
	let postAuthUser = async (data) => {
		let res = await API.post('/auth/clients', data);
		return await res.data;
	};
	// END OF GET FILTERS
	

	const [enterPhone, setEnterPhone] = useState(false);
	const [captcha, setCaptcha] = useState(false);
	const [token, setToken] = useState(false);



	let onChange = (value) => {
  	console.log("Captcha value:", value);
  	if (value === null) setCaptcha(false);
  	else {
  		setCaptcha(true);
  		setToken(value);
  	}
	}








	// STEP1 FORM HANDLER
	let authFormHandlerStep1 = (e) => {
		e.preventDefault();
		if((!phoneNumber && selCountryExpectedLength === null) || !isValid) {
			return setIsValid(false);
		}
		if (phoneNumber && !captcha) {
			setEnterPhone(true);
			return;
		}
		setFormSubmitButtonIsLoading(true);
		postAuthUser({phone: "+"+phoneNumber, captcha: token}).then((result) => {
			setFormSubmitButtonIsLoading(false);
			if(result.success) setAuthStep(1);
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
	// END OF STEP1 FORM HANDLER


	// STEP2 FORM HANDLER
	const authFormStep2 = useRef(null);
	let authFormHandlerStep2 = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(authFormStep2);
	    setErrors(currentFormErrors);
	    if(!Object.keys(currentFormErrors).length) {
	    	setFormSubmitButtonIsLoading2(true);
	    	postAuthUser({code: authFormStep2.current.elements.code.value}).then((result) => {
				setFormSubmitButtonIsLoading2(false);
				if(result.success) auth.signin(() => setUserIsLoggedIn(true));
				else {
					setGeneralModalHeader("Ошибка");
					setGeneralModalText(result.message);
					setGeneralModalIsOpen(true);
				}
			}, 
			(error) => {
				setFormSubmitButtonIsLoading2(false);
				setGeneralModalHeader("Ошибка");
				setGeneralModalText("Что-то пошло не так. Мы не смогли связаться с сервером, обновите страницу и попробуйте ещё раз.");
				setGeneralModalIsOpen(true);
			})
	    }
	}
	// END OF STEP2 FORM HANDLER


	// PHONE INPUT
	let phoneInputOnChange = (inputPhone, countryData) => {
		if(countryData.countryCode !== selCountryCode) {
			setPhoneNumber(countryData.dialCode)
			setIsValid(true)
		} else setPhoneNumber(inputPhone);
		setSelCountryCode(countryData.countryCode)
		setSelCountryExpectedLength(countryData.format.match(/\./g).length)
	}
	// END OF PHONE INPUT

  return (
    <div className="Auth py-7 py-lg-0">
      
    	<div className="container py-7">

    		<Helmet encodeSpecialCharacters={true} onChangeClientState={(newState, addedTags, removedTags) => console.log(newState, addedTags, removedTags)}>
		      <title>Вход для клиентов</title>
		      <meta property="description" content="Быстрая регистрация и вход по номеру телефона" />
		    </Helmet>

    		<div className="row align-items-center text-center">

    		<div className="authorized-user-decoration col-lg-5 d-none d-lg-block">
    			<div className="w-75 ml-7">
					<img className="user-image" src={women} alt="" />
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

			{authStep === 0 ? 
      		<div className="Auth__content col-8 col-lg-3">
					<h1 className="mb-4">Вход</h1>
					<p className="">Пожалуйста, введите свой номер телефона, мы пришлём вам проверочный код</p>
					<form className=" mt-6" onSubmit={authFormHandlerStep1}>
						<PhoneInput
							country={'ru'}
							localization={ru}
							value={phoneNumber}
							preferredCountries={['ru', 'us']}
							onChange={phoneInputOnChange}
	        				onBlur={() => phoneNumber.length !== selCountryExpectedLength ? setIsValid(false) : setIsValid(true)}
	        				isValid={() => !isValid ? phoneNumber.length === selCountryExpectedLength : isValid}
							required
							containerClass={"mb-3"}
						/>

						 	{enterPhone &&
								 <ReCAPTCHA
							    sitekey={data.capchaKey}
							    onChange={onChange}
							  />
							}




						<button className="mt-4 m-btn w-100 d-inline-block" type="submit">
							<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Получить код</span>
						</button>
						<div className="mt-5">
							<Link to="/auth/sellers">Войти как врач или менеджер клиники</Link>
						</div>
					</form>
				</div>
				: 
				<div className="Auth__content col-8 col-lg-3">
					<h1 className="mb-4">Вход</h1>
					<p className="">Мы отправили вам код в СМС, введите его.</p>
					<form ref={authFormStep2} className=" mt-6" onSubmit={authFormHandlerStep2}>
						<div className="input-holder w-100">
							<button className="buttonChangePhone mr-3 mt-2" onClick={(e) => {e.preventDefault(); setAuthStep(0);}}>Изменить</button>
							<PhoneInput
								country={selCountryCode}
								localization={ru}
								value={phoneNumber}
								preferredCountries={['ru', 'us']}
								disabled={true}
								required
							/>
						</div>
						<div className="input-holder mt-4 w-100">
							<Input name="code" label="Код из СМС" maxLength={4} validation="4numbers" errors={errors} />
						</div>
						<button className="mt-4 m-btn w-100 d-inline-block" type="submit">
							<div className={!formSubmitButtonIsLoading2 ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading2 ? "invisible" : ""}>Подтвердить</span>
						</button>
					</form>
				</div>
				}

				</div>
    	</div>

    	{userIsLoggedIn ? <Redirect to="/lk" /> : ""}

    	<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />

    </div> 
  );
}

export default Auth;
