import { useState, useEffect, useRef } from "react";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import ContentModal from "../utils/ContentModal/ContentModal";
import { Link } from "react-router-dom";
import GeneralModal from "../utils/GeneralModal/GeneralModal";

//components
import Navigation from "../blocks/Navigation/Navigation";
import Input from "../atoms/Input/Input";
import Textarea from "../atoms/Textarea/Textarea";
import Select from "../atoms/Select/Select";
import InputPlus from "../elements/InputPlus/InputPlus";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

//graphics
import array from "./img/array.svg";
import cross from "./img/cross.svg";
import uploadFileIcon from "./img/uploadFileIcon.svg";

// styles
import "./EditDoctor.scss";

let EditDoctor = (props) => {
    let [clinicsArray, setClinicsArray] = useState([]);

    let [doctorInfo, setDoctorInfo] = useState(null);
    let [categoryArray, setCategoryArray] = useState([]);
    let [currrentFile, setCurrrentFile] = useState(null);
    let [uploadedPhotoProfileStyles, setUploadedPhotoProfileStyles] = useState({});

    let [directionsArray, setDirectionsArray] = useState([]);
    let [directionItem, setDirectionItem] = useState("");
    let [inputValue, setInputValue] = useState("");
    let [errors, setErrors] = useState({});

    // CONTENT MODAL
    let [contentModalIsOpen, setContentModalIsOpen] = useState(false);
    let [contentModalHeader, setContentModalHeader] = useState("Укажите направления");
    // END OF CONTENT MODAL


    // GENERAL MODAL
    let [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
    let [generalModalHeader, setGeneralModalHeader] = useState("");
    let [generalModalText, setGeneralModalText] = useState("");
    // END OF GENERAL MODAL


    // EDU AND JOB
    const [edu, setEdu] = useState([{ name: "", start: null, end: null }]);
    const [eduIsCurrentId, setEduIsCurrentId] = useState(null);
    const [job, setJob] = useState([{ name: "", start: null, end: null }]);
    const [jobIsCurrentId, setJobIsCurrentId] = useState(null);
    // END OF EDU AND JOB


    // ON PAGE LOAD
    useEffect(() => {
        let getDoctor = async (id) => {
            let res = await API.get("/doctors/" + id);
            return await res.data;
        }
        let getCategory = async () => {
            let res = await API.get("/categories");
            return await res.data;
        }
        let getClinics = async () => {
            let res = await API.get("/clinics");
            return await res.data;
        }
        getClinics().then((result) => {
            let arrClinic = [{ name: "Название клиники", value: "" }];
            result.clinics.forEach((clinic) => {
                let clinicArrayItem = {
                    name: clinic.name,
                    value: clinic.id,
                }
                arrClinic.push(clinicArrayItem);
            });
            setClinicsArray(arrClinic);
            getCategory().then((result) => {
                let arrCategory = [];
                result.categories.forEach((category) => {
                    let categoriesArrayItem = {
                        name: category.nameRu,
                        value: category.name
                    }
                    arrCategory.push(categoriesArrayItem);
                })
                setCategoryArray(arrCategory);
                getDoctor(props.match.params.idSeller).then((result) => {
                    setDoctorInfo(result.doctor);

                    let education = result.doctor.education;
                    setEdu(education);
                    setEduIsCurrentId(education[education.length - 1].current ? ((education.length - 1) * 2 + 1) : null);

                    let workExperience = result.doctor.workExperience;
                    setJob(workExperience);
                    setJobIsCurrentId(workExperience[workExperience.length - 1].current ? ((workExperience.length - 1) * 2 + 1) : null);

                    setDirectionsArray(result.doctor.directions);
                    setUploadedPhotoProfileStyles({ backgroundImage: "url(" + result.doctor.avatarFile + ")", backgroundPosition: "center", backgroundSize: "cover" });

                    !result.doctor.modules.promo ? setCheckboxPromoValue(false) : setCheckboxPromoValue(true);
                })
            })
        })


    }, []);
    // END OF ON PAGE LOAD


    // UPLOAD FILES
    let [uploadedPhotoProfileName, setUploadedPhotoProfileName] = useState(null);
    let readURL = (input) => {
        console.log(input.target.files)
        if (input.target.files[0]) {
            setCurrrentFile(input.target.files[0])
            let file = input.target.files[0];
            let reader = new FileReader();
            reader.onload = (e) => {
                setUploadedPhotoProfileStyles({
                    "backgroundImage": "url(" + e.target.result + ")",
                    "backgroundSize": "cover",
                    "backgroundPosition": "center",
                    "backgroundRepeat": "no-repeat"
                })
                setUploadedPhotoProfileName(input.target.files[0].name);
            }
            reader.readAsDataURL(input.target.files[0]);
        }
    }
    // END OF UPLOAD FILES

    // ADD DIRECTION
    let addDirection = () => {
        if (directionItem == "") return;
        let directionsArrayNew = directionsArray.slice(0);
        directionsArrayNew.push(directionItem);
        setDirectionsArray(directionsArrayNew);
        setDirectionItem("");
        setInputValue("");
    }
    // END OF ADD DIRECTION


    // DIRECTION CHANGE
    let directionInputOnChange = (item) => {
        if (item.target.value.length > 30) return;
        setInputValue(item.target.value);
        setDirectionItem(item.target.value);
    }
    // END OF DIRECTION CHANGE


    //DELETE DIRECTION
    let deleteDirection = (item, id) => {
        let arr = directionsArray.slice(0);
        let result = arr.filter(el => el !== id);
        setDirectionsArray(result);
    }
    // END OF DELETE DIRECTION


    // EDIT PROFILE FORM
    let postEditDoc = async (data) => {
        let res = await API.put("/doctors", data);
        return await res.data;
    }
    const editDoctorForm = useRef(null);
    let editDoctorFormHandler = (e) => {
        e.preventDefault();

        let formItems = editDoctorForm.current.elements;
        let postData = new FormData();

        let educationList = [];
        let jobList = [];

        [...formItems].forEach(item => {
            if (!item.name) return;

            if (item.name.split("_")[0] === "education") return educationList.push({ name: item.value });
            if (item.name.split("_")[0] === "educationStart") return educationList[educationList.length - 1].start = item.value;
            if (item.name.split("_")[0] === "educationEnd") return educationList[educationList.length - 1].end = item.value;
            if (item.name.split("_")[0] === "educationCurrent") return educationList[educationList.length - 1].current = item.checked;

            if (item.name.split("_")[0] === "job") return jobList.push({ name: item.value });
            if (item.name.split("_")[0] === "jobStart") return jobList[jobList.length - 1].start = item.value;
            if (item.name.split("_")[0] === "jobEnd") return jobList[jobList.length - 1].end = item.value;
            if (item.name.split("_")[0] === "jobCurrent") return jobList[jobList.length - 1].current = item.checked;

            if (item.name.split("_")[0] === "avatarFile") {
                if (currrentFile) {
                    postData.append("avatarFile", currrentFile);
                }
            }
            postData.append(item.name, item.value);
        })
        postData.append("education", JSON.stringify(educationList));
        postData.append("workExperience", JSON.stringify(jobList));
        postData.append("idDoctor", doctorInfo.id);
        postData.append("directions", JSON.stringify(directionsArray));

        postEditDoc(postData).then((result) => {
            if (result.success) {
                setGeneralModalHeader("Успешно");
                setGeneralModalText("Вы успешно изменили данные врача");
                setGeneralModalIsOpen(true);
            } else {
                setGeneralModalHeader("Ошибка");
                setGeneralModalText(result.message);
                setGeneralModalIsOpen(true);
            }
        })
    }
    // END OF EDIT PROFILE FORM

    let [checkboxPromoState, setCheckboxPromoState] = useState(false);
    let [checkupsPromoValue, setCheckboxPromoValue] = useState(false);

    //UPDATE CHECKBOX
    let updateCheckboxPromo = (item) => {
        !checkboxPromoState ? setCheckboxPromoState(true) : setCheckboxPromoState(false);
        !checkupsPromoValue ? setCheckboxPromoValue(true) : setCheckboxPromoValue(false);
    }
    //END OF UPDATE CHECKBOX


    return ( <
        >
        <Navigation page="applications" useAuth={props.useAuth} /> <
        div className = "EditDoctor" >
        <div className="container-fluid">
					<div className="row px-2 py-3 p-md-5">
					 	{doctorInfo ? <>
						<div className="col-12 mb-5 d-flex align-items-center justify-content-between">
							<h1><Link to="/applications" className="mr-4"><img src={array} alt=""/></Link>Редактирование врача</h1>
						</div>
						<form onSubmit={editDoctorFormHandler} ref={editDoctorForm} className="col-12 py-5" noValidate>
							<div className="row">
								<div className="col-12 mb-4 d-flex flex-wrap justify-content-center text-center">
									<div className="avatar mb-3" style={uploadedPhotoProfileStyles}>
										<label className="file">
											<input type="file" name="avatarFile" className="file-input" onChange={(e) => readURL(e)}/>
											<img src={uploadFileIcon} alt=""/>
										</label>
									</div>
									<h2 className="d-block w-100">{doctorInfo.fio}</h2>
								</div>
								<div className="col-12 mb-4">
									<h3>Общая информация</h3>
								</div>
								<div className="col-12 col-lg-6 mb-4">
									<Input name="fio" label="Фио" defaultValue={doctorInfo.fio} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-12 col-lg-6 mb-4">
									<Input name="name" label="Фамилия и имя" defaultValue={doctorInfo.name} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-12 col-lg-6 mb-4">
									<Input name="country" label="Страна" defaultValue={doctorInfo.country} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-12 col-lg-6 mb-4">
									<Input name="city" label="Город" defaultValue={doctorInfo.city} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-12 col-lg-6 mb-4">
									<Select name="sex" label="Пол" defaultVariant={([{name: "Пол", value: ""}, {name: "Мужской", value: 0}, {name: "Женский", value: 1}].findIndex(item => item.value === +doctorInfo.sex))} defaultVariantIsPlaceholder={true} variants={[{name: "Пол", value: ""}, {name: "Мужской", value: 0}, {name: "Женский", value: 1}]} />
								</div>
								<div className="col-12 col-lg-6 mb-4">
									<Input name="email" label="Email" defaultValue={doctorInfo.email} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-12 col-lg-6 mb-4">
									<Input name="experience" label="Опыт" defaultValue={doctorInfo.experience} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-12 col-lg-6 mb-4">
									<Select name="category" label="Специализация" defaultVariant={(categoryArray.findIndex(item => item.value === doctorInfo.categoryValue))} variants={categoryArray} />
								</div>
								<div className="col-12 col-lg-6 mb-4">
									<Select name="academicDegree" label="Ученая степень" defaultVariant={([{name: "Нет учёной степени", value: ""}, {name: "Кандидат медицинских наук", value: "candidate"}, {name: "Доктор медицинских наук", value: "doctor"}].findIndex(item => item.value == doctorInfo.academicDegree))} defaultVariantIsPlaceholder={true} variants={[{name: "Нет учёной степени", value: ""}, {name: "Кандидат медицинских наук", value: "candidate"}, {name: "Доктор медицинских наук", value: "doctor"}]} />
								</div>
								<div className="col-12 col-lg-6 mb-4">
									<Input name="licenseNumber" label="Номер лицензии" defaultValue={doctorInfo.licenseNumber} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-12 col-lg-6 mb-4">
									<button type="button" className="btn-edit w-100" onClick={(e)=>{e.preventDefault(); setContentModalIsOpen(true)}}>Направления</button>
								</div>
								<div className="col-12 mb-4 mt-3">
									<h3>Прикрепленные файлы</h3>
								</div>
								<div className="col-12 col-lg-6 mb-4">
									<a href={doctorInfo.licenseFile} className="w-100 d-flex justify-content-center align-items-center main-button link" target="_blank">Сертификат / лицензия</a>
								</div>
								{
									doctorInfo.passportFiles.length == 1 &&
									<div className="col-12 col-lg-6 mb-4">
										<a href={doctorInfo.passportFiles[0]} className="w-100 d-flex justify-content-center align-items-center main-button link" target="_blank">Паспорт 1</a>
									</div>
								}
								{
									doctorInfo.passportFiles.length == 2 &&
									<>
									<div className="col-12 col-lg-6 mb-4">
										<a href={doctorInfo.passportFiles[0]} className="w-100 d-flex justify-content-center align-items-center main-button link" target="_blank">Паспорт 1</a>
									</div>
									<div className="col-12 col-lg-6 mb-4">
										<a href={doctorInfo.passportFiles[1]} className="w-100 d-flex justify-content-center align-items-center main-button link" target="_blank">Паспорт 2</a>
									</div>
									</>
								}
								<div className="col-12 mb-4 mt-3">
									<h3>Финансы</h3>
								</div>
								<div className="col-12 col-lg-6 mb-4">
									<Input name="price" label="Цена" defaultValue={doctorInfo.price} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-12 col-lg-6 mb-4">
									<Input name="shopID" label="Shop ID (яндекс касса)" defaultValue={doctorInfo.shopID} disabled={doctorInfo.type === "clinicDoctor"} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-12 mb-4 mt-3">
									<h3>Опыт</h3>
								</div>
								<div className="col-12 mb-4">
									<InputPlus name="job" value={job} currentId={jobIsCurrentId} errors={errors} label="Опыт" validation="notEmpty"/>
								</div>
								<div className="col-12 mb-4 mt-3">
									<h3>Образование</h3>
								</div>
								<div className="col-12 mb-4">
									<InputPlus name="education" value={edu} currentId={eduIsCurrentId} errors={errors} label="Образование" validation="notEmpty"/>
								</div>
								<div className="col-12 mb-4 mt-3">
									<h3>Публичное описание</h3>
								</div>
								<div className="col-12 mb-4 mt-3">
									<Textarea name="description" value={doctorInfo.description} placeholder="Напишите описание..."/>
								</div>
								<div className="col-12 mb-4 mt-3">
									<h3>Привзяка к клинике</h3>
								</div>
								<div className="col-12 col-lg-6 mb-5">
									<Select name="idClinic" label="Клиника" defaultVariant={(clinicsArray.findIndex(item => item.value === +doctorInfo.idClinic))} variants={clinicsArray} />
								</div>
								{
									doctorInfo.type !== "clinicDoctor" &&
									<>
									<div className="col-12 mb-4 mt-3">
										<h3>Модули</h3>
									</div>
									<div className="col-12 mb-5 d-flex justify-content-between align-items-center checkbox_holder">
										<label className="d-flex align-items-center">
											<input type="checkbox" className="checkbox" name="promo" value={checkupsPromoValue} checked={checkboxPromoState} onChange={updateCheckboxPromo}/>
											<span>Промоакции</span>
										</label>
									</div>
									</>
								}
								
								<div className="col-12 d-flex justify-content-between flex-wrap pt-5 border-top">
									<div className="select_status mb-4 mb-lg-0">
										<Select name="status" label="Статус" defaultVariant={([{name: "Статус", value: ""}, {name: "Принят", value: "accepted"}, {name: "Заблокирован", value: "blocked"}, {name: "Новый", value: "new"}].findIndex(item => item.value === doctorInfo.status))} defaultVariantIsPlaceholder={true} variants={[{name: "Статус", value: ""}, {name: "Принят", value: "accepted"}, {name: "Заблокирован", value: "blocked"}, {name: "Новый", value: "new"}]} />
									</div>
									<button type="submit" className="secondary-button">Обновить информацию</button>
								</div>
							</div>
						</form>
						<ContentModal contentClassName="directions-modal" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => setContentModalIsOpen(state)} modalHeader={contentModalHeader}>
							<div className="mb-4 position-relative">
								<label>
									<input onChange={directionInputOnChange} onKeyDown={(e) => e.keyCode === 13 ? addDirection(e) : null} type="text" name="direction" value={inputValue} className="input-direction"/>
									<span>Напрвление</span>
								</label>
								<button className="add-direction" onClick={addDirection}><img src={array} alt="" /></button>
							</div>
							<div className="info-block d-flex justify-content-between w-100">
								<span>Максимум {directionsArray.length}/6</span>
								<span>Длина {inputValue.length}/30</span>
							</div>
							<div className="mt-4 d-flex flex-wrap">
								{
									directionsArray.map((item, key) => 
									<div className="mr-3 mb-3 d-flex align-items-baseline item-direction" key={key}>
										<span>{item}</span>
										<img className="ml-2" onClick={(e) => deleteDirection(e, item)} src={cross} alt="" />
									</div>
								)}
							</div>
						</ContentModal>
						<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
						</> : <BigLoadingState text="Загружаем данные врача"/>}
					</div>
				</div>

        <
        /div> <
        />
    );
}

export default EditDoctor;