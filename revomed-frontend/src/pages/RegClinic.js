import { useState, useRef } from "react";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import {Helmet} from 'react-helmet';

// components
import Input from "../atoms/Input/Input";
import Select from "../atoms/Select/Select";
import FileUploadInput from "../atoms/FileUploadInput/FileUploadInput";
import RegistrationSellersPageHeader from "../elements/RegistrationSellersPageHeader/RegistrationSellersPageHeader";

// graphics
import doneIcon from './img/doneIcon.svg';

// styles
import './RegClinic.scss';

let RegClinic = () => {
  const [registrationStep, setRegistrationStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);

  // GENERAL MODAL
  const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
  const [generalModalHeader, setGeneralModalHeader] = useState("");
  const [generalModalText, setGeneralModalText] = useState("");
  // END OF GENERAL MODAL


  // POST CLINIC
  let postDoctor = async (data) => {
    let res = await API.post('/clinics', data);
    return await res.data;
  }
  // END OF POST CLINIC


  // REGISTRATION CLINIC
  const registrationClinicForm = useRef(null);
  let registrationClinicFormHandler = (e) => {
    e.preventDefault();
    let currentFormErrors = FormValidation(registrationClinicForm);
    setErrors(currentFormErrors);
    if(!Object.keys(currentFormErrors).length) {
      setFormSubmitButtonIsLoading(true);
      let postData = new FormData(registrationClinicForm.current);
      postDoctor(postData).then((result) => {
        setFormSubmitButtonIsLoading(false);
        if(result.success) setRegistrationStep(2);
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
  // END OF REGISTRATION CLINIC


  return (
    <div className="RegClinic">

      {registrationStep === 1 ?
        <RegistrationSellersPageHeader active="clinic" />
      : "" }

      <Helmet encodeSpecialCharacters={true} onChangeClientState={(newState, addedTags, removedTags) => console.log(newState, addedTags, removedTags)}>
          <title>Регистрация клиники</title>
          <meta property="description" content="Для регистрации на сервисе, в качестве клиники или медицинского центра, заполните анкету и отправьте на модерацию." />
        </Helmet>

      <form ref={registrationClinicForm} className={registrationStep === 1 ? "container py-7" : "d-none"} onSubmit={registrationClinicFormHandler} noValidate>
        <div className="row">
          <div className="col-8 col-lg-4">
            <div className="input-holder mb-4 mr-lg-4 mr-0">
              <Input name="name" errors={errors} label="Название медицинского учреждения" validation="notEmpty" />
            </div>
            <div className="input-holder mb-4 mr-lg-4 mr-0">
              <Input name="licenseNumber" errors={errors} label="Номер лицензии" validation="notEmpty" />
            </div>
            <div className="input-holder mb-4 mr-lg-4 mr-0">
              <Select name="typeOrg" errors={errors} label="Тип учреждения" validation="notEmpty" variants={[{name: "Частное учреждение", value: "private"}, {name: "Государственное учреждение", value: "government"}]} />
            </div>
            <div className="input-holder mb-4 mr-lg-4 mr-0">
              <Input name="country" errors={errors} label="Страна" validation="notEmpty onlyLetters" />
            </div>
            <div className="input-holder mb-4 mr-lg-4 mr-0">
              <Input name="city" errors={errors} label="Город" validation="notEmpty onlyLetters" />
            </div>
          </div>
          <div className="col-8 col-lg-4">
            <div className="input-holder mb-4 ml-lg-4 ml-0">
              <Input name="managerFio" errors={errors} label="Ваше ФИО" validation="notEmpty onlyLetters" />
            </div>
            <div className="input-holder mb-4 ml-lg-4 ml-0">
              <Input name="managerPosition" errors={errors} label="Ваша должность" validation="notEmpty onlyLetters" />
            </div>
            <div className="input-holder mb-4 ml-lg-4 ml-0">
              <Input name="managerPhone" errors={errors} label="Ваш номер телефона" validation="notEmpty" />
            </div>
            <div className="input-holder mb-4 ml-lg-4 ml-0">
              <Input name="managerEmail" errors={errors} label="Ваш email" validation="notEmpty email" />
            </div>
            <div className="mb-4 ml-lg-4 ml-0">
              <FileUploadInput label="Прикрепите скан лицензии" name="licenseFile" maxLength={1} errors={errors} validation="fileAttached" />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-8 col-lg-4">
            <div className="mr-lg-4 mr-0">
            <button type="submit" className="m-btn w-100 mt-5 d-flex justify-content-center" disabled={formSubmitButtonIsLoading}>
              <div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
              <span className={formSubmitButtonIsLoading ? "invisible" : ""}>Отправить на модерацию</span>
            </button>
            </div>
          </div>
        </div>
      </form>

      <div className={registrationStep === 2 ? "container py-7" : "d-none"}>
        <div className="registration-success py-7 row d-flex text-center justify-content-center">
          <div className="col-8 col-lg-4">
            <img src={doneIcon} className="mb-6" alt="" />
            <p className="mb-6">Мы оповестим вас по телефону и email о результатах проверки, после чего вы сможете начать работу</p>
            <a className="m-btn px-5 d-inline-block" href="/">На главную</a>
          </div>
        </div>
      </div>

      <GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
    </div> 
  );
}

export default RegClinic;
