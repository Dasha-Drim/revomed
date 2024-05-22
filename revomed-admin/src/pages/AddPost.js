import { useState, useEffect, useRef  } from "react";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import { EDITOR_JS_TOOLS } from "../utils/constants";
import { Link } from "react-router-dom";
import EditorJs from "react-editor-js";
import GeneralModal from "../utils/GeneralModal/GeneralModal";

//components
import Navigation from "../blocks/Navigation/Navigation";
import Input from "../atoms/Input/Input";
import SelectSearch from "../atoms/SelectSearch/SelectSearch";

//graphics
import array from "./img/array.svg";

// styles
import "./AddPost.scss";

let AddPost = (props) => {
	let [authorType, setAuthorType] = useState("admin");
	let [clinicsArray, setClinicsArray] = useState([]);
	let [doctorsArray, setDoctorsArray] = useState([]);
	let [categoriesArray, setCategoriesArray] = useState([]);

	// GENERAL MODAL
	let [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	let [generalModalHeader, setGeneralModalHeader] = useState("");
	let [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL


	// ON PAGE LOAD
	useEffect(() => {
		let getDoctors = async (id) => {
			let res = await API.get("/doctors");
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
			let arrClinic = [{label: "Название клиники", value: ""}];
			result.clinics.forEach((clinic) => {
				let clinicArrayItem = {
					label: clinic.name,
					value: clinic.id,
				}
				arrClinic.push(clinicArrayItem);
			})
			setClinicsArray(arrClinic);
		})

		getCategory().then((result) => {
			let arrCategories = [{label: "Выберите категорию", value: ""}];
			result.categories.forEach((category) => {
				let categoriesArrayItem = {
					label: category.nameRu,
					value: category.name
				}
				arrCategories.push(categoriesArrayItem);
			})
			setCategoriesArray(arrCategories);
		})

		getDoctors().then((result) => {
			let arrDoctors = [{label: "Имя врача", value: ""}];
			result.doctors.forEach((doctor) => {
				let doctorsArrayItem = {
					label: doctor.name,
					value: doctor.id
				}
				arrDoctors.push(doctorsArrayItem);
			})
			setDoctorsArray(arrDoctors);
		})
	}, []);
	// END OF ON PAGE LOAD


	// UPLOAD FILES
	let [uploadedPhotoProfileStyles, setUploadedPhotoProfileStyles] = useState({});
	let [uploadedPhotoProfileName, setUploadedPhotoProfileName] = useState(null);
	let readURL = (input) => {
		if (input.target.files[0]) {
			let reader = new FileReader();
			reader.onload = (e) => {
				setUploadedPhotoProfileStyles({
					"backgroundImage": "url("+e.target.result+")",
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


	// EDIT PROFILE FORM
	let [errors, setErrors] = useState({});
	let editProfileForm = useRef(null);
	const instanceRef = useRef(null);
	
	let postEditProfile = async (data) => {
		let res = await API.post("/posts", data);
		return await res.data;
	}
	let handleSave = async () => {
		const savedData = await instanceRef.current.save();
		console.log("savedData", savedData);
		return await savedData;
	}
	let editProfileFormHandler = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(editProfileForm);
		setErrors(currentFormErrors);
		if (Object.keys(currentFormErrors).length) return;
		let postData = new FormData(editProfileForm.current);
		handleSave().then((textPost) => {
			postData.append("description", JSON.stringify(textPost));
			postEditProfile(postData).then((result) => {
				console.log(result);
				if (result.success) {
					setGeneralModalHeader("Успешно");
					setGeneralModalText("Вы успешно добавили пост");
					setGeneralModalIsOpen(true);
				} else {
					setGeneralModalHeader("Ошибка");
					setGeneralModalText(result.message);
					setGeneralModalIsOpen(true);
				}
			})
		})
	}
	// END OF EDIT PROFILE FORM

	return (
		<>
		<Navigation page="blog" useAuth={props.useAuth} />
			<div className="AddPost">
				<div className="container-fluid">
					<div className="row px-2 py-3 p-md-5 ">
						<div className="col-12 mb-5 d-flex align-items-center justify-content-between">
							<h1><Link to="/blog" className="mr-4"><img src={array} alt=""/></Link>Добавление поста</h1>
						</div>
						<form onSubmit={editProfileFormHandler} ref={editProfileForm} className="col-12 py-5">
							<div className="row">
								<div className="col-12 mb-4 d-flex flex-wrap justify-content-center text-center">
									<label className="photo mb-3" style={uploadedPhotoProfileStyles}>
									<input type="file" name="photo" className="file-input" onChange={(e) => readURL(e)}/>
								</label>
							</div>
							<div className="col-12 mb-4">
								<Input name="title" label="Заголовок" defaultValue="" validation="notEmpty" errors={errors} />
							</div>
							<div className="col-12 mb-4 mt-3">
								<EditorJs instanceRef={instance => (instanceRef.current = instance)} tools={EDITOR_JS_TOOLS} i18n={{messages: {}}}/>									
							</div>
							<div className="col-12 col-md-6 mb-4">
								<SelectSearch defaultValue={{label: "Выберите категорию", value: ""}} name="category"  options={categoriesArray} />
							</div>
							<div className="col-12 col-md-6 mb-4">
								<SelectSearch name="typeAuthor" defaultValue={{label: "Тип автора", value: ""}} updateUseSelect={(value) => value ? setAuthorType(value) : null} options={[{label: "Тип автора", value: ""}, {label: "Доктор", value: "doctor"}, {label: "Клиника", value: "clinic"}, {label: "Админ", value: "admin"}]} />
							</div>

								{authorType === "admin" &&
									<div className="col-12 col-md-6 mb-4">
										<Input name="author" label="Автор" defaultValue="" validation="notEmpty" errors={errors} />
									</div>
								}
								{
									authorType === "clinic" &&
									<div className="col-12 col-md-6 mb-4">
										<SelectSearch name="idClinic" defaultValue={clinicsArray[0]} options={clinicsArray} />
									</div>
								}
								{
									authorType === "doctor" &&
									<div className="col-12 col-md-6 mb-4">
										<SelectSearch name="idDoctor" defaultValue={doctorsArray[0]} options={doctorsArray} />
									</div>
								}
							<div className="col-12 d-flex justify-content-end pt-5">
								<button type="submit" className="secondary-button">Опубликовать статью</button>
							</div>
						</div>
					</form>
				</div>
				<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
			</div>
		</div>
		</>
		);
	}

	export default AddPost;







