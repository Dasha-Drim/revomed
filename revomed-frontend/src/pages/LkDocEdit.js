import { Link } from "react-router-dom";
import { useState, useRef, useEffect, forwardRef } from "react";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from  "react-datepicker";
import ru from 'date-fns/locale/ru';
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// components
import Input from "../atoms/Input/Input";
import Textarea from "../atoms/Textarea/Textarea";
import Select from "../atoms/Select/Select";
import MultiselectTextInput from "../atoms/MultiselectTextInput/MultiselectTextInput";

// graphics
import crossIcon from './img/LkUserEdit/crossIcon.svg';
import uploadIcon from './img/LkUserEdit/uploadIcon.svg';
import plusIcon from './img/LkUserEdit/plusIcon.svg';

// styles
import './LkDocEdit.scss';

registerLocale('ru', ru);
setDefaultLocale('ru');

const CustomInput = forwardRef((datePickerProps, ref) => (
  <input type="text" ref={ref} {...datePickerProps} />
));
CustomInput.displayName = 'CustomInputRef';

let LkDocEdit = (props) => {
	const [doctorData, setDoctorData] = useState(null);
	const [doctorCategories, setDoctorCategories] = useState([]);
	const [uploadedPhotoProfileStyles, setUploadedPhotoProfileStyles] = useState(null);
	const [errors, setErrors] = useState({});
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
	const [formSubmitButtonIsLoading2, setFormSubmitButtonIsLoading2] = useState(false);

	// GENERAL MODAL
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL


	// AUTH METHOD
	let auth = props.useAuth();
	// / AUTH METHOD


	// EDU
	const [edu, setEdu] = useState([{name: "", start: null, end: null}]);
	const [eduCalendarOpenId, setEduCalendarOpenId] = useState(null);
	const [eduIsCurrentId, setEduIsCurrentId] = useState(null);

	let addEduAdditionalInput = (e) => {
		e.preventDefault();
		let eduArray = edu.slice(0);
		eduArray.push({name: "", start: null, end: null})
		setEdu(eduArray);
		setEduIsCurrentId(null);
	}
	let deleteEduAdditionalInput = (e, key) => {
		e.preventDefault();
		let eduArray = edu.slice(0);
		console.log("eduArray1", eduArray);
		eduArray = eduArray.filter((item, k) => k !== key);
		console.log("eduArray2", eduArray);
		setEdu(eduArray);
		setEduIsCurrentId(null);
	}
	// END OF EDU


	// JOB
	const [job, setJob] = useState([{name: "", start: null, end: null}]);
	const [jobCalendarOpenId, setJobCalendarOpenId] = useState(null);
	const [jobIsCurrentId, setJobIsCurrentId] = useState(null);

	let addJobAdditionalInput = (e) => {
		e.preventDefault();
		let jobArray = job.slice(0);
		jobArray.push({name: "", start: null, end: null})
		setJob(jobArray);
		setJobIsCurrentId(null);
	}
	let deleteJobAdditionalInput = (e, key) => {
		e.preventDefault();
		let jobArray = job.slice(0);
		jobArray = jobArray.filter((item, k) => k !== key);
		setJob(jobArray);
		setJobIsCurrentId(null);
	}
	// END OF JOB


	// ON PAGE LOAD
	useEffect(() => {
		// get doctor data
		let getDoctors = async () => {
			let res = await API.get('/doctors/'+props.userId);
			return await res.data;
		}
		getDoctors().then((result) => {
			if(result.success) {
				setDoctorData(result.doctor);
				
				let education = result.doctor.education;
				setEdu(education);
				setEduIsCurrentId(education[education.length-1].current ? ((education.length-1)*2+1) : null);
				
				let workExperience = result.doctor.workExperience;
				setJob(workExperience);
				setJobIsCurrentId(workExperience[workExperience.length-1].current ? ((workExperience.length-1)*2+1) : null);
			}
		})
		// get categories
		let getDoctorCategories = async () => {
			let res = await API.get('/categories');
			return await res.data;
		}
		getDoctorCategories().then((result) => {
	    	if(!result.success) return false;
	    	let categories = [];
	    	result.categories.forEach(item => {
	    		categories.push({name: item.title, value: item.name});
	    	})
	    	console.log("categories", categories);
	      setDoctorCategories(categories);
	    })
	}, [props.userId])
	// END OF ON PAGE LOAD


	// CATEGORIES
	  let getDoctorCategories = async () => {
	    let res = await API.get('/categories');
	    return await res.data;
	  }
	  useEffect(() => {
	    getDoctorCategories().then((result) => {
	    	if(!result.success) return false;
	    	let categories = [];
	    	result.categories.forEach(item => {
	    		categories.push({name: item.title, value: item.name});
	    	})
	    	console.log("categories", categories);
	      setDoctorCategories(categories);
	    })
	  }, [])
	// END OF CATEGORIES


	// UPLOAD FILES
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
	      }
	      reader.readAsDataURL(input.target.files[0]);
	    }
	}
	// END OF UPLOAD FILES


	// EDIT PROFILE FORM
	let editProfileForm = useRef(null);
	useEffect(() => {
		if(!editProfileForm || !doctorData) return;
		editProfileForm.current.querySelectorAll("input, select, textarea, button").forEach(item => {
			item.setAttribute('tabIndex', "-1");
		})
	}, [editProfileForm, doctorData])

	let putEditProfile = async (data) => {
		let res = await API.put('/doctors', data);
		return await res.data;
	}
	let editProfileFormHandler = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(editProfileForm);
		setErrors(currentFormErrors);
		if(!Object.keys(currentFormErrors).length) {
			setFormSubmitButtonIsLoading(true);
			let formItems = editProfileForm.current.elements;
			let postData = new FormData();
			let educationList = [];
			let jobList = [];
			let directionsList = [];
			[...formItems].forEach(item => {
				if(!item.name) return;
				
				if(item.name === "avatarFile") return postData.append(item.name, item.files[0]);

				if(item.name.split("_")[0] === "education") return educationList.push({name: item.value});
				if(item.name.split("_")[0] === "educationStart") return educationList[educationList.length-1].start = item.value;
				if(item.name.split("_")[0] === "educationEnd") return educationList[educationList.length-1].end = item.value;
				if(item.name.split("_")[0] === "educationCurrent") return educationList[educationList.length-1].current = item.checked;

				if(item.name.split("_")[0] === "job") return jobList.push({name: item.value});
				if(item.name.split("_")[0] === "jobStart") return jobList[jobList.length-1].start = item.value;
				if(item.name.split("_")[0] === "jobEnd") return jobList[jobList.length-1].end = item.value;
				if(item.name.split("_")[0] === "jobCurrent") return jobList[jobList.length-1].current = item.checked;

				if(item.name === "directions") return item.value ? directionsList.push(item.value) : null;
				postData.append(item.name, item.value);
			})
			postData.append('education', JSON.stringify(educationList));
			postData.append('workExperience', JSON.stringify(jobList));
			postData.append('directions', JSON.stringify(directionsList));

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
	    let res = await API.put('/doctors', data);
	    return await res.data;
	}
	// END OF PUT CHANGE PASSWORD


	// CHANGE PASSWORD FORM HANDLER
	let changePasswordForm = useRef(null);
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
    <div className="LkDocEdit">

    	<div className="container py-7">

    	{doctorData ? 
    	<form onKeyDown={(e) => e.key === "Enter" ? e.preventDefault() : false} onSubmit={editProfileFormHandler} ref={editProfileForm} noValidate={true}>
    		<div className="row pb-7">
	      		<div className="col-8 d-flex flex-wrap justify-content-center text-center">
	      			<div className="LkDocEdit__avatar" style={uploadedPhotoProfileStyles}>
	                	<img src={doctorData.avatarFile} className={"avatar-photo "+(uploadedPhotoProfileStyles && "invisible")} alt="" />
	              		<label className="upload-icon d-flex justify-content-center align-items-center">
		                    <input type="file" name="avatarFile" onChange={(e) => {readURL(e); delete errors["avatarFile"];}} />
		                    <img src={uploadIcon} alt="" />
		                </label>
	              	</div>
	      			<h1 className="LkDocEdit__name w-100 mt-3 mb-4">{doctorData.fio}</h1>
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
		      			<Input name="country" label="Страна" defaultValue={doctorData.country} validation="notEmpty onlyLetters" errors={errors} />
		      		</div>
		      		<div className="col-8 col-lg-4 mb-4 pl-lg-4">
		      			<Input name="city" label="Город" defaultValue={doctorData.city} validation="notEmpty onlyLetters" errors={errors} />
		      		</div>
		      		<div className="col-8 col-lg-4 mb-4 pr-lg-4">
		      			<Input name="email" label="Email" defaultValue={doctorData.email} disabled />
		      		</div>
		      		{doctorCategories.length ?
		      		<div className="col-8 col-lg-4 mb-4 pl-lg-4">
		      			<Select disabled name="category" label="Категория" defaultVariant={doctorCategories.findIndex(cat => cat.value === doctorData.category) + 1} defaultVariantIsPlaceholder={true} variants={[{name: "Категория", value: ""}].concat(doctorCategories)} />
		      		</div>
		      		: "" }

		      		<div className="col-8 mb-4 mt-4">
		      			<h2 className="edit-profile__heading">Направления работы</h2>
		      		</div>
		      		<div className="col-8 mb-4">
		      			<MultiselectTextInput name="directions" label="Конкретные направления" defaultValue={doctorData.directions} />
		      		</div>

		      		<div className="col-8 mb-4 mt-4">
		      			<h2 className="edit-profile__heading">Описание</h2>
		      		</div>
		      		<div className="col-8 mb-4">
		      			<Textarea tabIndex="-1" label="Описание" name="description" defaultValue={doctorData.description} />
		      		</div>

		      		<div className="col-8 mb-4 mt-4">
		      			<h2 className="edit-profile__heading">Образование</h2>
		      		</div>
		      		<div className="col-8 mb-4">

		      			{edu.map((item, key) =>
		      				<div className="InputPlusWithDates row align-items-center align-content-center">
			      			<label className="InputPlusWithDates-group col-8 col-lg-3 d-block">
						      <input value={item.name} name={"education_"+key} required data-validation="notEmpty" tabIndex="-1" className={errors && errors.hasOwnProperty("education_"+key) && errors["education_"+key] ? "error" : ""} onChange={(e) => {setEdu(actual => {actual[key].name = e.target.value; return actual}); setErrors(actual => {actual["education_"+key] = false; return { ...actual };})}} />
						      <span className="InputPlusWithDates-group__label">Название</span>
						    </label>
						    <label className="InputPlusWithDates-group col-4 col-md-2 col-lg-1 d-block">
							    <DatePicker
							    	name={"educationStart_"+key}
							    	className={errors && errors.hasOwnProperty("educationStart_"+key) && errors["educationStart_"+key] ? "error" : ""}
									selected={typeof item.start === "string" && item.start.length ? new Date(item.start.split("/")[1], item.start.split("/")[0], 0, 0, 0, 0, 0) : item.start ? item.start : null}
									onChange={(date) => {setEdu(actual => {actual[key].start = date; return actual;}); setErrors(actual => {actual["educationStart_"+key] = false; return { ...actual };}) }}
									onCalendarOpen={() => setEduCalendarOpenId(key*2)}
									onCalendarClose={() => setEduCalendarOpenId(null)}
									dateFormat="MM/yyyy"
									showMonthYearPicker
									showTwoColumnMonthYearPicker
									autoComplete="off"
									tabIndex="-1"
									required
									customInput={<CustomInput data-validation="notEmpty" />}
								/>
						      	<span className={"InputPlusWithDates-group__label "+(eduCalendarOpenId === key*2 || item.start ? "InputPlusWithDates-group__label--focused" : "")}>C</span>
						    </label>
						    <label className={"InputPlusWithDates-group col-4 col-md-2 col-lg-1 d-block "+(eduIsCurrentId === key*2+1 && "invisible")}>
						      	<DatePicker
							    	name={"educationEnd_"+key}
							    	className={errors && errors.hasOwnProperty("educationEnd_"+key) && errors["educationEnd_"+key] ? "error" : null}
									selected={typeof item.end === "string" && item.end.length ? new Date(item.end.split("/")[1], item.end.split("/")[0], 0, 0, 0, 0, 0) : item.end ? item.end : null}
									onChange={(date) => {setEdu(actual => {actual[key].end = date; return actual;}); setErrors(actual => {actual["educationEnd_"+key] = false; return { ...actual };}) }}
									onCalendarOpen={() => setEduCalendarOpenId(key*2+1)}
									onCalendarClose={() => setEduCalendarOpenId(null)}
									dateFormat="MM/yyyy"
									showMonthYearPicker
									showTwoColumnMonthYearPicker
									autoComplete="off"
									tabIndex="-1"
									required
									customInput={<CustomInput data-validation={eduIsCurrentId !== key*2+1 ? "notEmpty" : ""} />}
								/>
								<span className={"InputPlusWithDates-group__label "+(eduCalendarOpenId === key*2+1 || item.end ? "InputPlusWithDates-group__label--focused" : "")}>До</span>
						    </label>
						    <label className={"InputPlusWithDates-toggle mt-3 mt-md-0 col-6 col-md-3 col-lg-2 d-flex align-items-center "+ (edu.length !== (key+1) && "invisible")}>
						    	<input name={"educationCurrent_"+key} type="checkbox" tabIndex="-1" checked={eduIsCurrentId === key*2+1} onChange={(e) => setEduIsCurrentId(e.target.checked ? key*2+1 : null)} />
						    	<span className="InputPlusWithDates-toggle__label ml-3">По наст. время</span>
						    </label>
						    { 20 !== edu.length && key === 0 ? <div className="InputPlusWithDates-plus col-2 col-md-1 d-flex justify-content-end"><img src={plusIcon} alt="plus" onClick={(e) => addEduAdditionalInput(e)} /></div> : "" }
					    	{ 20 !== edu.length && key !== 0 ? <div className="InputPlusWithDates-plus col-2 col-md-1 d-flex justify-content-end"><img src={plusIcon} alt="cross" className="cross" onClick={(e) => deleteEduAdditionalInput(e, key)} /></div> : "" }
					    </div>
		      			)}

		      		</div>



		      		<div className="col-8 mb-4 mt-4">
		      			<h2 className="edit-profile__heading">Опыт работы</h2>
		      		</div>
		      		<div className="col-8 mb-4">
		      			{job.map((item, key) =>
		      				<div className="InputPlusWithDates row align-items-center align-content-center">
			      			<label className="InputPlusWithDates-group col-8 col-lg-3 d-block">
						      <input value={item.name} name={"job_"+key} required data-validation="notEmpty" tabIndex="-1" className={errors && errors.hasOwnProperty("job_"+key) && errors["job_"+key] ? "error" : ""} onChange={(e) => {setJob(actual => {actual[key].name = e.target.value; return actual}); setErrors(actual => {actual["job_"+key] = false; return { ...actual };})}} />
						      <span className="InputPlusWithDates-group__label">Название</span>
						    </label>
						    <label className="InputPlusWithDates-group col-4 col-md-2 col-lg-1 d-block">
							    <DatePicker
							    	name={"jobStart_"+key}
							    	className={errors && errors.hasOwnProperty("jobStart_"+key) && errors["jobStart_"+key] ? "error" : ""}
									selected={typeof item.start === "string" && item.start.length ? new Date(item.start.split("/")[1], item.start.split("/")[0], 0, 0, 0, 0, 0) : item.start ? item.start : null}
									onChange={(date) => {setJob(actual => {actual[key].start = date; return actual;}); setErrors(actual => {actual["jobStart_"+key] = false; return { ...actual };}) }}
									onCalendarOpen={() => setJobCalendarOpenId(key*2)}
									onCalendarClose={() => setJobCalendarOpenId(null)}
									dateFormat="MM/yyyy"
									showMonthYearPicker
									showTwoColumnMonthYearPicker
									autoComplete="off"
									tabIndex="-1"
									required
									customInput={<CustomInput data-validation="notEmpty" />}
								/>
						      	<span className={"InputPlusWithDates-group__label "+(jobCalendarOpenId === key*2 || item.start ? "InputPlusWithDates-group__label--focused" : "")}>C</span>
						    </label>
						    <label className={"InputPlusWithDates-group col-4 col-md-2 col-lg-1 d-block "+(jobIsCurrentId === key*2+1 && "invisible")}>
						      	<DatePicker
							    	name={"jobEnd_"+key}
							    	className={errors && errors.hasOwnProperty("jobEnd_"+key) && errors["jobEnd_"+key] ? "error" : null}
									selected={typeof item.end === "string" && item.end.length ? new Date(item.end.split("/")[1], item.end.split("/")[0], 0, 0, 0, 0, 0) : item.end ? item.end : null}
									onChange={(date) => {setJob(actual => {actual[key].end = date; return actual;}); setErrors(actual => {actual["jobEnd_"+key] = false; return { ...actual };}) }}
									onCalendarOpen={() => setJobCalendarOpenId(key*2+1)}
									onCalendarClose={() => setJobCalendarOpenId(null)}
									dateFormat="MM/yyyy"
									showMonthYearPicker
									showTwoColumnMonthYearPicker
									autoComplete="off"
									tabIndex="-1"
									required
									customInput={<CustomInput data-validation={jobIsCurrentId !== key*2+1 ? "notEmpty" : ""} />}
								/>
								<span className={"InputPlusWithDates-group__label "+(jobCalendarOpenId === key*2+1 || item.end ? "InputPlusWithDates-group__label--focused" : "")}>До</span>
						    </label>
						    <label className={"InputPlusWithDates-toggle mt-3 mt-md-0 col-6 col-md-3 col-lg-2 d-flex align-items-center "+ (job.length !== (key+1) && "invisible")}>
						    	<input name={"jobCurrent_"+key} type="checkbox" checked={jobIsCurrentId === key*2+1} tabIndex="-1" onChange={(e) => setJobIsCurrentId(e.target.checked ? key*2+1 : null)} />
						    	<span className="InputPlusWithDates-toggle__label ml-3">По наст. время</span>
						    </label>
						    { 20 !== job.length && key === 0 ? <div className="InputPlusWithDates-plus col-2 col-md-1 d-flex justify-content-end"><img src={plusIcon} alt="plus" onClick={(e) => addJobAdditionalInput(e)} /></div> : "" }
					    	{ 20 !== job.length && key !== 0 ? <div className="InputPlusWithDates-plus col-2 col-md-1 d-flex justify-content-end"><img src={plusIcon} alt="cross" className="cross" onClick={(e) => deleteJobAdditionalInput(e, key)} /></div> : "" }
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

      	</form>
      	: <div className="mb-7"><BigLoadingState text="Загружаем основные данные профиля" /></div> }

      	{doctorData ?
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

export default LkDocEdit;