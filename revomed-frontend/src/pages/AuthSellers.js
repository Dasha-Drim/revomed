import { Redirect, Link } from "react-router-dom";
import { useState, useRef } from "react";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import API from "../utils/API";
import { FormValidation } from "../utils/FormValidation";
import {Helmet} from 'react-helmet';

// components
import Input from "../atoms/Input/Input";

// graphics
import user from './img/Auth/user.png';
import chevronRightIcon from './img/Auth/chevronRightIcon.svg';

// styles
import './Auth.scss';

let AuthSellers = (props) => {
	const [errors, setErrors] = useState({});
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);

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
	let postAuthSeller = async (data) => {
		let res = await API.post('/auth/sellers', data);
		return await res.data;
	}
	// END OF POST AUTH USER


	// AUTH SELLER FORM
	const authSellerForm = useRef(null);
	let authSellerFormHandler = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(authSellerForm);
		setErrors(currentFormErrors);
		if(!Object.keys(currentFormErrors).length) {
			setFormSubmitButtonIsLoading(true);
			let postData = new FormData(authSellerForm.current);
			postAuthSeller(postData).then((result) => {
				setFormSubmitButtonIsLoading(false);
				if(result.success) auth.signin(() => setUserIsLoggedIn(true));
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
	// END OF AUTH SELLER FORM

  return (
    <div className="Auth py-7 py-lg-0">
      
    	<div className="container py-7">
    	<Helmet encodeSpecialCharacters={true} onChangeClientState={(newState, addedTags, removedTags) => console.log(newState, addedTags, removedTags)}>
          <title>Вход для врачей</title>
          <meta property="description" content="Для доступа в личный кабинет введите логин и пароль" />
        </Helmet>
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
					<h1 className="mb-4">Вход для врачей и менеджеров</h1>
					<p className="">Пожалуйста, введите ваш email и пароль</p>
					<form className=" mt-6" ref={authSellerForm} onSubmit={authSellerFormHandler}>
						<Input name="email" label="Email" validation="email" errors={errors} />
						<div className="input-holder mt-4 w-100">
							<Link to="/password/forget" className="mr-3 mt-2">Забыл пароль</Link>
							<Input name="password" type="password" label="Пароль" validation="notEmpty" errors={errors} />
						</div>
						<button className="mt-4 m-btn w-100 d-inline-block" type="submit">
							<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Войти</span>
						</button>
					</form>
				</div>
				

				</div>
    	</div>

    	{userIsLoggedIn ? <Redirect to="/lk" /> : ""}

    	<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />

    </div> 
  );
}

export default AuthSellers;
