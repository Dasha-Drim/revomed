import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import GeneralModal from "../utils/GeneralModal/GeneralModal";


import { AddressSuggestions } from 'react-dadata';
import 'react-dadata/dist/react-dadata.css';





// components
import Input from "../atoms/Input/Input";
import Textarea from "../atoms/Textarea/Textarea";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// graphics
import crossIcon from './img/LkUserEdit/crossIcon.svg';
import crossIconClinic from './img/LkUserEdit/crossIconClinic.svg';
import uploadIcon from './img/LkUserEdit/uploadIcon.svg';
import plusIconClinic from './img/LkUserEdit/plusIconClinic.svg';

// styles
import './LkClinicEdit.scss';

let LkClinicEdit = (props) => {
	const [value, setValue] = useState();



	const [clinicData, setClinicData] = useState(null);
	const [uploadedPhotoProfileStyles, setUploadedPhotoProfileStyles] = useState(null);
	const [errors, setErrors] = useState({});
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
	const [formSubmitButtonIsLoading2, setFormSubmitButtonIsLoading2] = useState(false);


	const [adresses, setAdresses] = useState([{name: "", adress: ""}]);
	const [adressIsCurrentId, setAdressIsCurrentId] = useState(null);

	let addAdressAdditionalInput = (e) => {
		e.preventDefault();
		let adressesArray = adresses.slice(0);
		adressesArray.push({name: "", adress: ""})
		setAdresses(adressesArray);
		setAdressIsCurrentId(null);
	}
	let deleteAdressAdditionalInput = (e, key) => {
		e.preventDefault();
		let adressesArray = adresses.slice(0);
		console.log("eduArray1", adressesArray);
		adressesArray = adressesArray.filter((item, k) => k !== key);
		console.log("eduArray2", adressesArray);
		setAdresses(adressesArray);
		setAdressIsCurrentId(null);
	}





	// GENERAL MODAL
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	// GENERAL MODAL


	// AUTH METHOD
	let auth = props.useAuth();
	// END OF AUTH METHOD


	// ON PAGE LOAD
	useEffect(() => {
		let getClinics = async () => {
			let res = await API.get('/clinics/'+props.userId);
			return await res.data;
		}
		getClinics().then((result) => {
			if(result.success) {
				console.log("result.clinic", result.clinic)
				setClinicData(result.clinic);
				let adressesArr = (result.clinic.adresses && result.clinic.adresses.length) ?  result.clinic.adresses : [{name: "", adress: "", value: ""}];
				setAdresses(adressesArr);
				console.log("adressesArr", adressesArr)
			};
		})
	}, [props.userId])
	// END OF ON PAGE LOAD


	// UPLOAD FILES
	let readURL = (input) => {
	    if (input.target.files[0]) {
	      let reader = new FileReader();
	      reader.onload = (e) => {
	        setUploadedPhotoProfileStyles({
	          backgroundImage: 'url('+e.target.result+')',
	          backgroundSize: 'cover',
	          backgroundPosition: 'center',
	          backgroundRepeat: 'no-repeat'
	        })
	      }
	      reader.readAsDataURL(input.target.files[0]);
	    }
	}
	// END OF UPLOAD FILES


	// PUT EDIT PROFILE
	let putEditProfile = async (data) => {
		let res = await API.put('/clinics', data);
		return await res.data;
	}
	// END OF PUT EDIT PROFILE


	// EDIT PROFILE FORM
	const editProfileForm = useRef(null);
	let editProfileFormHandler = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(editProfileForm);
		setErrors(currentFormErrors);
		if(!Object.keys(currentFormErrors).length) {
			setFormSubmitButtonIsLoading(true);
			let formItems = editProfileForm.current.elements;
			let postData = new FormData();
			let adressesList = [];

			[...formItems].forEach(item => {
				if(!item.name) return;
				console.log("item_________", item)
				//if(item.name === "avatarFile") return postData.append(item.name, item.files[0]);

				if(item.name.split("_")[0] === "addressName") return adressesList.push({name: item.value});
				if(item.name.split("_")[0] === "adress") return adressesList[adressesList.length-1].adress = item.value;

				postData.append(item.name, item.value);
				//postData.append("", item.value);
			})
			postData.append('adresses', JSON.stringify(adresses));

			console.log("postData", postData)
			putEditProfile(postData).then((result) => {
				setFormSubmitButtonIsLoading(false);
				if(result.success) {
					auth.reconfirm(() => {});
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


	// PUT CHANGE PASSWORD
	let putChangePassword = async (data) => {
	    let res = await API.put('/clinics', data);
	    return await res.data;
	}
	// END OF PUT CHANGE PASSWORD


	let adressRequest = (input) => {
		console.log("adressRequest----e", input.target.value)
	}

	let updateArrAdress = (e, id) => {
		let result = adresses.map(function(item, index, array) {
  			if (index === id) return {name: item.name, adress: e.value, value: e};
  			else return item;
		});
		console.log("result", result);
		setAdresses(result);
	}

	let updateAdressesName = (e, id) => {
		let result = adresses.map(function(item, index, array) {
  			if (index === id) return {name: e.target.value, adress: item.adress, value: item.value};
  			else return item;
		});
		console.log("result", result);
		setAdresses(result);
	}


	// CHANGE PASSWORD FORM HANDLER
	const changePasswordForm = useRef(null);
	let changePasswordFormHandler = (e) => {
	    e.preventDefault();
	    setFormSubmitButtonIsLoading2(true);
	    let postData = new FormData(changePasswordForm.current);
	    putChangePassword(postData).then((result) => {
			setFormSubmitButtonIsLoading2(false);
			if(result.success) {
				setGeneralModalHeader("Успешно");
				setGeneralModalText(result.message);
				setGeneralModalIsOpen(true);
			} else {
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
	// END OF CHANGE PASSWORD FORM HANDLER

  return (
    <div className="LkClinicEdit">

    	<div className="container py-7">
    		{clinicData ? <form onSubmit={editProfileFormHandler} ref={editProfileForm} noValidate={true}>
    		<div className="row pb-7">
	      		<div className="col-8 d-flex flex-wrap justify-content-center text-center">
	      			<div className="LkClinicEdit__avatar" style={uploadedPhotoProfileStyles}>
						{clinicData.logo ? <img src={clinicData.logo} className={"avatar-photo "+(uploadedPhotoProfileStyles && "invisible")} alt="" />
						: <div className={"avatar-photo "+(uploadedPhotoProfileStyles && "invisible")}></div> }
						<label className="upload-icon d-flex justify-content-center align-items-center">
			                <input type="file" name="avatarFile" onChange={(e) => {readURL(e); delete errors["avatarFile"];}} />
			                <img src={uploadIcon} alt="" />
			            </label>
		            </div>
	      			<h1 className="LkClinicEdit__name w-100 mt-3 mb-4">{clinicData.name}</h1>
	      			<Link to="/lk" className="cancel-button"><img src={crossIcon} className="mr-2" alt="" /> Отменить изменения</Link>
	      		</div>
	      	</div>
      			
      	<div className="row mb-7">
	      	<div className="col-8">
	      		<div className="edit-profile px-5 py-6 row mx-0">
		      		<div className="col-8 mb-4">
		      			<h2 className="edit-profile__heading">Основные данные</h2>
		      		</div>
		      		<div className="col-8 col-lg-4 mb-4 pr-lg-4">
		      			<Input name="country" label="Страна" defaultValue={clinicData.country} validation="notEmpty onlyLetters" errors={errors} />
		      		</div>
		      		<div className="col-8 col-lg-4 mb-4 pl-lg-4">
		      			<Input name="city" label="Город" defaultValue={clinicData.city} validation="notEmpty onlyLetters" errors={errors} />
		      		</div>

		      		<div className="col-8 col-lg-4 mb-4 pr-lg-4">
		      			<Input name="managerFio" label="ФИО представителя" defaultValue={clinicData.managerFio} validation="notEmpty onlyLetters" errors={errors} />
		      		</div>
		      		<div className="col-8 col-lg-4 mb-4 pl-lg-4">
		      			<Input name="managerPhone" label="Телефон представителя" defaultValue={clinicData.managerPhone} validation="notEmpty" errors={errors} />
		      		</div>

		      		<div className="col-8 col-lg-4 mb-4 pr-lg-4">
		      			<Input name="managerPosition" label="Должность представителя" defaultValue={clinicData.managerPosition} validation="notEmpty onlyLetters" errors={errors} />
		      		</div>
		      		<div className="col-8 col-lg-4 mb-4 pl-lg-4">
		      			<Input name="email" label="Email" defaultValue={clinicData.email} disabled />
		      		</div>

		      		<div className="col-8 mb-4 mt-4">
		      			<h2 className="edit-profile__heading">Описание</h2>
		      		</div>
		      		<div className="col-8 mb-4">
		      			<Textarea tabIndex="-1" label="Описание" name="description" defaultValue={clinicData.description} />
		      		</div>


		      		<div className="col-8 mb-4">

		      			{adresses.map((item, key) =>
		      				<div className={`InputPlusWithDates row align-items-center align-content-center ${key !== adresses.lenght-1 ? "mb-4" : ""}`} key={key}>
				      			<label className="InputPlusWithDates-group col-8 col-lg-3 d-block">
							      <input value={item.name} name={"addressName_"+key} required placeholder="Введите название адреса" data-validation="notEmpty" tabIndex="-1" className={errors && errors.hasOwnProperty("education_"+key) && errors["education_"+key] ? "error" : ""} onChange={(e) => {updateAdressesName(e, key); setErrors(actual => {actual["education_"+key] = false; return { ...actual };})}} />
							    </label>
							    <AddressSuggestions containerClassName="InputPlusWithDates-group col-6 col-md-7 col-lg-4 d-block" inputProps={{name: "adress_"+key, placeholder: "Начните вводить адрес"}} token="c6c505231864f8fb605ebb3a4a8d9ae450f5a9ed" value={item.value || ""} onChange={(e) => updateArrAdress(e, key)} />
						    { 20 !== adresses.length && key === 0 ? <div className="InputPlusWithDates-plus col-2 col-md-1 d-flex justify-content-end"><div className="icon plus" onClick={(e) => addAdressAdditionalInput(e)}><img src={plusIconClinic} alt="plus" /></div></div> : "" }
					    	{ 20 !== adresses.length && key !== 0 ? <div className="InputPlusWithDates-plus col-2 col-md-1 d-flex justify-content-end"><div className="icon cross" onClick={(e) => deleteAdressAdditionalInput(e, key)}><img src={crossIconClinic} alt="cross" className="cross" /></div></div> : "" }
					    </div>
		      			)}

		      		</div>




		      		<div className="col-8 mt-3">
		      			<button type="submit" className="ui-r-main-button px-6 mx-auto d-flex justify-content-center" disabled={formSubmitButtonIsLoading}>
							<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Сохранить</span>
						</button>
		      		</div>
	      		</div>
	      	</div>
      	</div>
      	</form> : <div className="mb-7"><BigLoadingState text="Загружаем основные данные профиля" /></div> }

      	{clinicData ?
      	<div className="row">
	      	<div className="col-8">
	      		<form onSubmit={changePasswordFormHandler} ref={changePasswordForm} className="edit-profile px-5 py-6 row mx-0">
		      		<div className="col-8 mb-4">
		      			<h2 className="edit-profile__heading">Сменить пароль</h2>
		      		</div>
		      		<div className="col-8 col-md-4 mb-4">
		      			<Input name="oldPassword" minLength={8} label="Старый пароль" />
		      		</div>
		      		<div className="col-8 col-md-4 mb-4">
		      			<Input name="newPassword" minLength={8} label="Новый пароль" />
		      		</div>
		      		<div className="col-8 mt-3">
		      			<button type="submit" className="ui-r-main-button px-6 mx-auto d-flex justify-content-center" disabled={formSubmitButtonIsLoading}>
							<div className={!formSubmitButtonIsLoading2 ? "d-none" : "mini-loader"}></div>
							<span className={formSubmitButtonIsLoading2 ? "invisible" : ""}>Изменить пароль</span>
						</button>
		      		</div>
	      		</form>
	      	</div>
      	</div>
      	: "" }

      	<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />

      </div>

    </div> 
  );
}

export default LkClinicEdit;
