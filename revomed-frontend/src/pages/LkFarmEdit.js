import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import GeneralModal from "../utils/GeneralModal/GeneralModal";

// components
import Input from "../atoms/Input/Input";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// graphics
import crossIcon from './img/LkUserEdit/crossIcon.svg';
import crossIconClinic from './img/LkUserEdit/crossIconClinic.svg';
import uploadIcon from './img/LkUserEdit/uploadIcon.svg';
import plusIconClinic from './img/LkUserEdit/plusIconClinic.svg';

// styles
import './LkFarmEdit.scss';

let LkFarmEdit = (props) => {

    const [farmData, setFarmData] = useState(null);
    const [uploadedPhotoProfileStyles, setUploadedPhotoProfileStyles] = useState(null);
    const [errors, setErrors] = useState({});
    const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
    const [formSubmitButtonIsLoading2, setFormSubmitButtonIsLoading2] = useState(false);



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
        let getFarm = async () => {
            let res = await API.get('/farms/' + props.userId);
            return await res.data;
        }
        getFarm().then((result) => {
            if (result.success) {
                console.log("result.farm", result.farm)
                setFarmData(result.farm);
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
                    backgroundImage: 'url(' + e.target.result + ')',
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
        let res = await API.put('/farms', data);
        return await res.data;
    }
    // END OF PUT EDIT PROFILE


    // EDIT PROFILE FORM
    const editProfileForm = useRef(null);
    let editProfileFormHandler = (e) => {
        e.preventDefault();
        let currentFormErrors = FormValidation(editProfileForm);
        setErrors(currentFormErrors);
        if (!Object.keys(currentFormErrors).length) {
            setFormSubmitButtonIsLoading(true);
            let formItems = editProfileForm.current.elements;
            let postData = new FormData();
            let adressesList = [];

            [...formItems].forEach(item => {
                if (!item.name) return;
                if (item.name === "logo") return postData.append(item.name, item.files[0]);
                postData.append(item.name, item.value);
            })

            console.log("postData", postData)
            putEditProfile(postData).then((result) => {
                    setFormSubmitButtonIsLoading(false);
                    if (result.success) {
                        //auth.reconfirm(() => {});
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
        let res = await API.put('/farms', data);
        return await res.data;
    }
    // END OF PUT CHANGE PASSWORD



    // CHANGE PASSWORD FORM HANDLER
    const changePasswordForm = useRef(null);
    let changePasswordFormHandler = (e) => {
        e.preventDefault();
        setFormSubmitButtonIsLoading2(true);
        let postData = new FormData(changePasswordForm.current);
        putChangePassword(postData).then((result) => {
                setFormSubmitButtonIsLoading2(false);
                if (result.success) {
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
        <div className="LkFarmEdit">

    	<div className="container py-7">
    		{farmData ? <form onSubmit={editProfileFormHandler} ref={editProfileForm} noValidate={true}>
    		<div className="row pb-7">
	      		<div className="col-8 d-flex flex-wrap justify-content-center text-center">
	      			<div className="LkFarmEdit__avatar" style={uploadedPhotoProfileStyles}>
						{farmData.logo ? <img src={farmData.logo} className={"avatar-photo "+(uploadedPhotoProfileStyles && "invisible")} alt="" />
						: <div className={"avatar-photo "+(uploadedPhotoProfileStyles && "invisible")}></div> }
						<label className="upload-icon d-flex justify-content-center align-items-center">
			                <input type="file" name="logo" onChange={(e) => {readURL(e); delete errors["avatarFile"];}} />
			                <img src={uploadIcon} alt="" />
			            </label>
		            </div>
	      			<h1 className="LkFarmEdit__name w-100 mt-3 mb-4">{farmData.name}</h1>
	      			<Link to="/lk" className="cancel-button"><img src={crossIcon} className="mr-2" alt="" /> Отменить изменения</Link>
	      		</div>
                <div className="col-8 mt-3">
                        <button type="submit" className="ui-r-main-button px-6 mx-auto d-flex justify-content-center" disabled={formSubmitButtonIsLoading}>
                            <div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
                            <span className={formSubmitButtonIsLoading ? "invisible" : ""}>Сохранить</span>
                        </button>
                    </div>
	      	</div>
      			
      	
      	</form> : <div className="mb-7"><BigLoadingState text="Загружаем основные данные профиля" /></div> }

      	{farmData ?
      	<div className="row">
	      	<div className="col-8">
	      		<form onSubmit={changePasswordFormHandler} ref={changePasswordForm} className="edit-profile px-5 py-6 row mx-0">
		      		<div className="col-8 mb-4">
		      			<h2 className="edit-profile__heading">Смена пароля</h2>
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

export default LkFarmEdit;