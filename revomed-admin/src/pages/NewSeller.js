import { useState, useEffect, useRef } from "react";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import { Link, useHistory } from "react-router-dom";
import GeneralModal from "../utils/GeneralModal/GeneralModal";

//components
import Navigation from "../blocks/Navigation/Navigation";
import Input from "../atoms/Input/Input";
import Textarea from "../atoms/Textarea/Textarea";
import Select from "../atoms/Select/Select";
import InputPlus from "../elements/InputPlus/InputPlus";
import SelectSearch from "../atoms/SelectSearch/SelectSearch";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

//graphics
import uploadFileIcon from "./img/uploadFileIcon.svg";
import array from "./img/array.svg";

// styles
import "./NewSeller.scss";

let NewSeller = (props) => {

	let [errors, setErrors] = useState({});

	// GENERAL MODAL
	let [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	let [generalModalHeader, setGeneralModalHeader] = useState("");
	let [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL

	let history = useHistory();

    // EDIT PROFILE FORM
    let postFarmForm = useRef(null);
    let postEditProfile = async (data) => {
        let res = await API.post("/farms", data);
        return await res.data;
    }
    let postFarmFormHandler = (e) => {
        e.preventDefault();

        let currentFormErrors = FormValidation(postFarmForm);
        setErrors(currentFormErrors);
        if (Object.keys(currentFormErrors).length) return;

        let formItems = postFarmForm.current.elements;
        let postData = new FormData();

        [...formItems].forEach(item => {
            postData.append(item.name, item.value);
        })

        postEditProfile(postData).then((result) => {
            if (result.success) {
                setGeneralModalHeader("Успешно");
                setGeneralModalText("Вы успешно зарегистрировали компанию. Данные для входа отправлены на указанный email компании");
                setGeneralModalIsOpen(true);
            } else {
                setGeneralModalHeader("Ошибка");
                setGeneralModalText(result.message);
                setGeneralModalIsOpen(true);
            }
        })
    }
    // END OF EDIT PROFILE FORM

    return ( <
        >
        <Navigation page="applications" useAuth={props.useAuth} /> 
        <div className = "NewSeller" >
        <div className="container-fluid">
					<div className="row px-2 py-3 p-md-5">
						<div className="col-12 mb-5 d-flex align-items-center justify-content-between">
							<h1><Link to="/applications" className="mr-4"><img src={array} alt=""/></Link>Регистрация фармкомпании</h1>
						</div>
						<form onSubmit={postFarmFormHandler} ref={postFarmForm} className="col-12 py-5" noValidate>
							<div className="row">
								
								<div className="col-6 mb-4">
									<Input name="name" label="Название компании" validation="notEmpty" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="email" label="Email менеджера" validation="notEmpty email" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="license" label="Номер лицензии" validation="notEmpty" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="managerFio" label="ФИО менеджера" validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="managerPhone" label="Номер телефона менеджера" validation="notEmpty" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="INN" label="ИНН" validation="notEmpty onlyNums" errors={errors} />
								</div>
								<div className="col-12 d-flex justify-content-center flex-wrap pt-5 border-top">
									<button type="submit" className="secondary-button">Зарегистрировать</button>
								</div>
							</div>
						</form>
						<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => {setGeneralModalIsOpen(state); history.push("/applications")}} modalHeader={generalModalHeader} modalText={generalModalText} />

					</div>
				</div> 
        </div> 
        </>
    );
}

export default NewSeller;