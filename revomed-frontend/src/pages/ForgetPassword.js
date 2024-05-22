import { useState, useRef } from "react";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import API from "../utils/API";
import { FormValidation } from "../utils/FormValidation";

// components
import Input from "../atoms/Input/Input";

// styles
import './Auth.scss';

let ForgetPassword = () => {
	const [errors, setErrors] = useState({});
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);

	// GENERAL MODAL
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL


	// FORGET PASSWORD FORM HANDLER
	const forgetPasswordForm = useRef(null);
	let postForgetPassword = async (data) => {
		let res = await API.post('/sellers/password', data);
		return await res.data;
	}
	let forgetPasswordFormHandler = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(forgetPasswordForm);
		setErrors(currentFormErrors);
		if(!Object.keys(currentFormErrors).length) {
			setFormSubmitButtonIsLoading(true);
			let postData = new FormData(forgetPasswordForm.current);
			postForgetPassword(postData).then((result) => {
				setFormSubmitButtonIsLoading(false);
				if(result.success) {
					forgetPasswordForm.current.elements.email.value = '';
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
	// END OF FORGET PASSWORD FORM HANDLER

  return (
    <div className="Auth py-7">
      
    	<div className="container py-7">
    		<div className="row align-items-center text-center justify-content-center">

      		<div className="Auth__content col-8 col-lg-3">
					<h1 className="mb-4">Восстановление пароля</h1>
					<p className="">Пожалуйста, введите ваш email. Если такой есть, вам придёт инструкция по восстановлению пароля.</p>
					<form className="mt-6" ref={forgetPasswordForm} onSubmit={forgetPasswordFormHandler}>
						<Input name="email" label="Email" validation="email" errors={errors} />
						<button className="mt-4 m-btn w-100 d-inline-block" type="submit">
							<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Отправить письмо</span>
						</button>
					</form>
				</div>
				

				</div>
    	</div>

    	<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />

    </div> 
  );
}

export default ForgetPassword;