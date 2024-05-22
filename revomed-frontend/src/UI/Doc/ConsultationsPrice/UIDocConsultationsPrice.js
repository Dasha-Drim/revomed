import { useState, useRef, useEffect } from "react";
import { FormValidation } from "../../../utils/FormValidation";
import API from "../../../utils/API";
import GeneralModal from "../../../utils/GeneralModal/GeneralModal";

// components
import Input from "../../../atoms/Input/Input";
import BigLoadingState from "../../../elements/BigLoadingState/BigLoadingState";

// styles
import './UIDocConsultationsPrice.scss';

let UIDocConsultationsPrice = () => {
	const [price, setPrice] = useState(null);
	const [errors, setErrors] = useState({});
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);

	// ON PAGE LOAD
	useEffect(() => {
		let getConsultationsPrice = async () => {
			let res = await API.get('/doctors/prices');
			return await res.data;
		}
		getConsultationsPrice().then((result) => result.success ? setPrice(result.price) : null)
	}, [])
	// END OF ON PAGE LOAD


	// PUT CONSULTATIONS PRICE
	let putConsultationsPrice = async (data) => {
		let res = await API.put('/doctors', data);
		return await res.data;
	}
	// END OF PUT CONSULTATIONS PRICE


	// CONSULTATIONS PRICE FORM HANDLER
	let consultationsPriceForm = useRef(null);
	let consultationsPriceFormHandler = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(consultationsPriceForm);
		setErrors(currentFormErrors);
		if(!Object.keys(currentFormErrors).length) {
			setFormSubmitButtonIsLoading(true);
			let postData = new FormData(consultationsPriceForm.current);
			putConsultationsPrice(postData).then((result) => {
				setFormSubmitButtonIsLoading(false);
				if(result.success) {
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
	// END OF CONSULTATIONS PRICE FORM HANDLER

	return (
		<>
		<div className="UIDocConsultationsPrice">
			<div className="mb-4">
				<h2 className="ui-section-heading mb-0">Стоимость консультаций</h2>
			</div>
			<div className="UIDocConsultationsPrice__content  px-5 py-6">
				{price ?
				<form ref={consultationsPriceForm} onSubmit={consultationsPriceFormHandler} className="mx-0 row align-items-center align-content-center">
					<div className="col-8 col-lg-3 mr-lg-6 mb-4 mb-lg-0">
						<Input label="Введите цену консультации" name="price" value={price} minLength={2} errors={errors} validation="onlyNums notEmpty" />
					</div>
					<button className="ui-r-main-button d-block px-6 col-8 col-lg-auto" type="submit">
						<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
						<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Сохранить</span>
					</button>
				</form>
				: <BigLoadingState text="Загружаем данные" /> }
			</div>
      	</div>
      	<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
      	</>
	);
}
export default UIDocConsultationsPrice;