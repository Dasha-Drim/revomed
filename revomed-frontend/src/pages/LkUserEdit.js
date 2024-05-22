import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import GeneralModal from "../utils/GeneralModal/GeneralModal";

// components
import Input from "../atoms/Input/Input";
import Select from "../atoms/Select/Select";

// graphics
import crossIcon from './img/LkUserEdit/crossIcon.svg';

//styles
import './LkUserEdit.scss';

let LkUserEdit = (props) => {
	const [clientData, setClientData] = useState(null);
	const [errors, setErrors] = useState({});
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);

	// GENERAL MODAL
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL


	// ON PAGE LOAD
	useEffect(() => {
		let getClients = async () => {
			let res = await API.get('/clients/'+props.userId);
			return await res.data;
		}
		getClients().then((result) => result.success ? setClientData(result.client) : null)
	}, [props.userId])
	// END OF ON PAGE LOAD


	// AUTH METHOD
	let auth = props.useAuth();
	// END OF AUTH METHOD


	// EDIT PROFILE FORM
	const editProfileForm = useRef(null);
	let postEditProfile = async (data) => {
		let res = await API.put('/clients', data);
		return await res.data;
	}
	let editProfileFormHandler = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(editProfileForm);
		setErrors(currentFormErrors);
		if(!Object.keys(currentFormErrors).length) {
			setFormSubmitButtonIsLoading(true);
			let postData = new FormData(editProfileForm.current);
			postEditProfile(postData).then((result) => {
				setFormSubmitButtonIsLoading(false);
				if(result.success) {
					auth.reconfirm(() => {});
					setClientData(actual => {actual.name = postData.get("name"); return actual});
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
	// END OF EDIT PROFILE FORM

  return (
    <div className="LkUserEdit">
    	<div className="container py-7">
    	{clientData ? <>
    		<div className="row pb-7">
	      		<div className="col-8 d-flex flex-wrap justify-content-center text-center">
	      			<h1 className="LkUser__name w-100 mb-4">{clientData.name}</h1>
	      			<Link to="/lk" className="cancel-button"><img src={crossIcon} className="mr-2" alt="" /> Отменить изменения</Link>
	      		</div>
      		</div>
      			
      	<div className="row mb-7">
	      	<div className="col-8">
	      		<form onSubmit={editProfileFormHandler} ref={editProfileForm} className="edit-profile px-5 py-6 row mx-0" noValidate={true}>
		      		<div className="col-8 mb-4">
		      			<h2 className="edit-profile__heading">Основные данные</h2>
		      		</div>
		      		<div className="col-8 col-lg-4 mb-4 pr-lg-4">
		      			<Input name="name" label="Имя" defaultValue={clientData.name} validation="notEmpty onlyLetters" errors={errors} />
		      		</div>
		      		<div className="col-8 col-lg-4 mb-4 pl-lg-4">
		      			<Input name="phone" label="Номер телефона" defaultValue={clientData.phone} disabled />
		      		</div>
		      		<div className="col-8 col-lg-4 mb-4 pr-lg-4">
		      			<Input name="birthday" label="Дата рождения" defaultValue={clientData.birthday} mask="99.99.9999" />
		      		</div>
		      		<div className="col-8 col-lg-4 mb-4 pl-lg-4">
		      			<Select name="sex" label="Пол" defaultVariant={typeof clientData.sex === "number" ? clientData.sex+1 : 0} defaultVariantIsPlaceholder={true} variants={[{name: "Пол", value: ""}, {name: "Мужской", value: 0}, {name: "Женский", value: 1}]} />
		      		</div>
		      		<div className="col-8 mt-3">
		      			<button type="submit" className="ui-r-main-button px-6 mx-auto d-flex justify-content-center" disabled={formSubmitButtonIsLoading}>
							<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Сохранить</span>
						</button>
		      		</div>
	      		</form>
	      	</div>
      	</div>

		</> : "" }
      </div>
      

      <GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
    </div> 
  );
}

export default LkUserEdit;
