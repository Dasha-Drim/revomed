import { useState, useEffect, useRef } from "react";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import {Helmet} from 'react-helmet';

// components
import Input from "../atoms/Input/Input";
import InputPlus from "../atoms/InputPlus/InputPlus";
import Select from "../atoms/Select/Select";
import FileUploadInput from "../atoms/FileUploadInput/FileUploadInput";
import RegistrationSellersPageHeader from "../elements/RegistrationSellersPageHeader/RegistrationSellersPageHeader";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// graphics
import regHeaderPersonPhoto from './img/regHeaderPersonPhoto.png';
import photoProfile from './img/photoProfile.png';
import arrowLeft from './img/arrowLeft.svg';
import doneIcon from './img/doneIcon.svg';

// styles
import './RegDoc.scss';

let RegDoc = (props) => {
  const [doctorCategories, setDoctorCategories] = useState(null);
  const [selectedCategoriesCounter, setSelectedCategoriesCounter] = useState(0);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);

  // GENERAL MODAL
  const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
  const [generalModalHeader, setGeneralModalHeader] = useState("");
  const [generalModalText, setGeneralModalText] = useState("");
  // END OF GENERAL MODAL


  // ON PAGE LOAD
  useEffect(() => {
    document.cookie = "bookingInfo=;max-age=-1";
    let getDoctorCategories = async () => {
      let res = await API.get('/categories');
      return await res.data;
    }
    getDoctorCategories().then((result) => {
      setDoctorCategories(result.categories);
    })
  }, [])
  // END OF ON PAGE LOAD


  // POST DOCTOR
  let postDoctor = async (data) => {
    let res = await API.post('/doctors', data);
    return await res.data;
  }
  // END OF POST DOCTOR


  // REGISTRATION DOCTOR
  const formStep1 = useRef(null);
  let handleFormStep1 = (e) => {
    e.preventDefault();
    let currentFormErrors = FormValidation(formStep1);
    setErrors(currentFormErrors);
    if(!Object.keys(currentFormErrors).length) setRegistrationStep(2);
  }

  const formStep2 = useRef(null);
  let handleFormStep2 = (e) => {
    e.preventDefault();
    let currentFormErrors = FormValidation(formStep2);
    setErrors(currentFormErrors);
    if(!Object.keys(currentFormErrors).length) {
      setFormSubmitButtonIsLoading(true);
      let postDataStep1 = new FormData(formStep1.current);
      let postDataStep2 = new FormData(formStep2.current);
      for (let pair of postDataStep2) {
        postDataStep1.append(pair[0], pair[1]);
      }
      postDoctor(postDataStep1).then((result) => {
        setFormSubmitButtonIsLoading(false);
        if(result.success) setRegistrationStep(3);
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
  // END OF REGISTRATION DOCTOR


  // UPLOAD FILES
  let [uploadedPhotoProfileStyles, setUploadedPhotoProfileStyles] = useState(null);
  let [uploadedPhotoProfileName, setUploadedPhotoProfileName] = useState(null);
  let readURL = (input) => {
    console.log(input.target.files)
    if (input.target.files[0]) {
      let reader = new FileReader();
      reader.onload = (e) => {
        setUploadedPhotoProfileStyles({
          backgroundImage: 'url('+e.target.result+')',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        })
        setUploadedPhotoProfileName(input.target.files[0].name);
      }
      reader.readAsDataURL(input.target.files[0]);
    }
  }
  // END OF UPLOAD FILES


  return (
    <div className="RegDoc">

      {registrationStep === 1 ?
        <RegistrationSellersPageHeader active="doc" />
      : "" }

      <Helmet encodeSpecialCharacters={true} onChangeClientState={(newState, addedTags, removedTags) => console.log(newState, addedTags, removedTags)}>
          <title>Регистрация врача и частного специалиста</title>
          <meta property="description" content="Для регистрации на сервисе, в качестве врача или частного специалиста, заполните анкету и отправьте на модерацию." />
        </Helmet>

      {registrationStep === 2 ?
      <div className="page-header-registration py-7">
        <div className="container">
          <div className="row justify-content-center justify-content-md-between">
            <div className="col-8 col-md-5">
              <h2>Информация профиля</h2>
              <button className="m-btn mt-4 px-4 d-inline-block" onClick={() => setRegistrationStep(1)}><img src={arrowLeft} className="pr-3" alt="" />Вернуться назад</button>
            </div>
            <div className="page-header-registration__image d-none d-md-block col-md-3">
              <img src={regHeaderPersonPhoto} alt="" />
            </div>
          </div>
        </div>
      </div>
      : "" }


      <form ref={formStep1} className={registrationStep === 1 ? "container py-7" : "d-none"} onSubmit={handleFormStep1} noValidate>
        {doctorCategories ? <>
        <input type="hidden" name="link" value={props.match.params.clinicLink} />
        <div className="row">
          <div className="col-8 col-lg-4">
            <div className="input-holder mb-4 mr-lg-4 mr-0">
              <Input name="fio" errors={errors} label="ФИО" validation="notEmpty onlyLetters" />
            </div>
            <div className="input-holder mb-4 mr-lg-4 mr-0">
              <Input name="licenseNumber" errors={errors} label="Номер лицензии / сертификата" validation="notEmpty" />
            </div>
            <div className="input-holder mb-4 mr-lg-4 mr-0">
              <Input name="country" errors={errors} label="Страна" validation="notEmpty onlyLetters" />
            </div>
            <div className="input-holder mb-4 mr-lg-4 mr-0">
              <Input name="city" errors={errors} label="Город" validation="notEmpty onlyLetters" />
            </div>
            <div className="input-holder mb-4 mr-lg-4 mr-0">
              <Input name="email" errors={errors} label="Email" validation="notEmpty email" />
            </div>
          </div>
          <div className="col-8 col-lg-4">
            <div className={`big-choose-block ml-lg-4 mr-0 ${errors && errors.hasOwnProperty("category") && errors["category"] ? "error" : ""}`}>
              <div className="d-flex justify-content-between px-4 pt-2 pb-3">
                <span className="big-choose-block__heading">Выберите категории консультаций</span>
                <span className="big-choose-block__counter d-none d-md-inline-block">Выбрано {selectedCategoriesCounter}</span>
              </div>
              {doctorCategories.map((item, key) =>
              <label key={key}>
                <input type="radio" data-validation="radioChecked" name="category" value={item.name} onChange={() => {delete errors["category"]; setSelectedCategoriesCounter(1)}} />
                <span>{item.title}</span>
              </label>
              )}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-8 col-lg-4">
            <div className="mr-lg-4 mr-0">
              <input type="submit" value="Далее" className="w-100 m-btn mt-5" />
            </div>
          </div>
        </div>
        </> : <BigLoadingState text="Готовим форму регистрации" /> }
      </form>


      <form ref={formStep2} className={registrationStep === 2 ? "container py-7" : "d-none"} onSubmit={handleFormStep2} noValidate>
        <div className="row">
          <div className="col-8 col-lg-4">
            <div className="input-holder mb-4 mr-lg-4 mr-0">
              <Input name="experience" errors={errors} label="Стаж (лет)" validation="notEmpty onlyNum" />
            </div>
            <div className="input-holder mb-4 mr-lg-4 mr-0">
              <InputPlus name="education[]" errors={errors} label="Образование" limit={2} validation="notEmpty"/>
            </div>
            <div className="input-holder mb-4 mr-lg-4 mr-0">
              <Select name="academicDegree" errors={errors} label="Учёная степень" validation="notEmpty" variants={[{name: "Нет", value: "no"}, {name: "Кандидат медицинских наук", value: "candidate"}, {name: "Доктор медицинских наук", value: "doctor"}]} />
            </div>
            <div className="input-holder mb-4 mr-lg-4 mr-0">
              <Input name="lastJob" errors={errors} label="Последнее место работы" validation="notEmpty" />
            </div>
            <div className="input-holder mb-4 mr-lg-4 mr-0">
              <Input name="currentJob" errors={errors} label="Текущее место работы" validation="notEmpty" />
            </div>
          </div>
          
          <div className="col-8 col-lg-4">
            <div className={`upload-photo-block py-4 px-4 mb-4 ml-lg-4 ml-0 d-flex align-items-center ${errors && errors.hasOwnProperty("avatarFile") && errors["avatarFile"] ? "error" : ""}`}>
              <div style={uploadedPhotoProfileStyles}>
                <img src={photoProfile} className={uploadedPhotoProfileStyles ? "invisible" : ""} alt="" />
              </div>
              <div className="upload-photo-block__content ml-6">
                <span className="upload-photo-block__heading mb-3">Загрузите свою фотографию</span>
                <div className="upload-photo-block__upload d-flex flex-wrap flex-sm-nowrap align-items-center">
                  <label>
                    <input type="file" name="avatarFile" onChange={(e) => {readURL(e); delete errors["avatarFile"];}} data-validation="fileAttached" />
                    Загрузить
                  </label>
                  <span className="ml-sm-3 mt-3 mt-sm-0">{uploadedPhotoProfileName}</span>
                </div>
              </div>
            </div>

            <div className="mb-4 ml-lg-4 ml-0">
              <FileUploadInput label="Прикрепите скан паспорта (необязательно)" name="passportFile" maxLength={2} />
            </div>

            <div className="mb-4 ml-lg-4 ml-0">
              <FileUploadInput label="Прикрепите лицензию / сертификат" name="licenseFile" maxLength={1} errors={errors} validation="fileAttached" />
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

      <div className={registrationStep === 3 ? "container py-7" : "d-none"}>
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

export default RegDoc;
