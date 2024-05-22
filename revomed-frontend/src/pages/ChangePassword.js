import { useState, useRef } from "react";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import API from "../utils/API";
import { FormValidation } from "../utils/FormValidation";

// components
import Input from "../atoms/Input/Input";

// styles
import './Auth.scss';

let ChangePassword = (props) => {
	const [errors, setErrors] = useState({});
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);

	// GENERAL MODAL
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL


	// CHANGE PASSWORD FORM HANDLER
	const changePasswordForm = useRef(null);
	let putChangePassword = async (data) => {
		let res = await API.put('/sellers/password/'+props.match.params.link, data);
		return await res.data;
	}
	let changePasswordFormHandler = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(changePasswordForm);
		setErrors(currentFormErrors);
		if(!Object.keys(currentFormErrors).length) {
			setFormSubmitButtonIsLoading(true);
			let postData = new FormData(changePasswordForm.current);
			putChangePassword(postData).then((result) => {
				setFormSubmitButtonIsLoading(false);
				if(result.success) {
					changePasswordForm.current.elements.newPassword.value = '';
					setGeneralModalHeader("Успешно");
					setGeneralModalText(result.message);
					setGeneralModalIsOpen(true);
				}
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
	// END OF CHANGE PASSWORD FORM HANDLER

  return (
    <div className="Auth py-7">
      
    	<div className="container py-7">
    		<div className="row align-items-center text-center justify-content-center">

      		<div className="Auth__content col-8 col-lg-3">
					<h1 className="mb-4">Восстановление пароля</h1>
					<p className="">Пожалуйста, введите новый пароль. Обратите внимание, что он не должен быть короче 8 символов.</p>
					<form className="mt-6" ref={changePasswordForm} onSubmit={changePasswordFormHandler}>
						<Input name="newPassword" label="Новый пароль" validation="notEmpty" minLength={8} errors={errors} />
						<button className="mt-4 m-btn w-100 d-inline-block" type="submit">
							<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Установить новый пароль</span>
						</button>
					</form>
				</div>
				

				</div>
    	</div>

    	<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />

    </div> 
  );
}

export default ChangePassword;