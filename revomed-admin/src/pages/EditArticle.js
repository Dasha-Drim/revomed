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
import Textarea from "../atoms/Textarea/Textarea";
import SelectSearch from "../atoms/SelectSearch/SelectSearch";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";
import Select from "../atoms/Select/Select";

//graphics
import array from "./img/array.svg";

// styles
import "./EditArticle.scss";

let EditArticle = (props) => {
	let [postInfo, setPostInfo] = useState(null);
	let [status, setStatus] = useState(null)
	let [message, setMessage] = useState("")
	let [authorType, setAuthorType] = useState("admin");
	let [clinicsArray, setClinicsArray] = useState([]);
	let [doctorsArray, setDoctorsArray] = useState([]);
	let [categoriesArray, setCategoriesArray] = useState([]);
	let [uploadedPhotoProfileStyles, setUploadedPhotoProfileStyles] = useState({});

	// GENERAL MODAL
	let [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	let [generalModalHeader, setGeneralModalHeader] = useState("");
	let [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL
	
	// ON PAGE LOAD
	useEffect(() => {

		let getPost = async (id) => {
			let res = await API.get("/farms/articles/"+id);
			return await res.data;
		}
		

		getPost(props.match.params.idArticle).then((result) => {
			setPostInfo(result.article);
			setStatus(result.article.status);
			setMessage(result.article.message.text)
			setUploadedPhotoProfileStyles({backgroundImage: "url("+result.article.photo+")", backgroundPosition: "center", backgroundSize: "cover"})
		})

	}, []);
	// END OF ON LOAD PADE


	// UPLOAD FILES
	let [uploadedPhotoProfileName, setUploadedPhotoProfileName] = useState(null);
	let readURL = (input) => {
		console.log(input.target.files)
		if (input.target.files[0]) {
			let file = input.target.files[0];
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
		let res = await API.put("/farms/articles", data);
		return await res.data;
	}
	let handleSave = async () => {
    	const savedData = await instanceRef.current.save();
    	return await savedData;
  	}
	let editProfileFormHandler = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(editProfileForm);
		setErrors(currentFormErrors);
		if (Object.keys(currentFormErrors).length) return;
		let postData = new FormData(editProfileForm.current);

			postData.append("idArticle", props.match.params.idArticle);
			postEditProfile(postData).then((result) => {
				if (result.success) {
					setGeneralModalHeader("Успешно");
					setGeneralModalText("Модерация прошла успешно. Результаты сохранены");
					setGeneralModalIsOpen(true);
				} else {
					setGeneralModalHeader("Ошибка");
					setGeneralModalText(result.message);
					setGeneralModalIsOpen(true);
				}
			})
	}
	// END OF EDIT PROFILE FORM

	let onChangeStatus = (e) => {
		console.log("e", e);
		setStatus(e.value);
		setMessage("");
	}

	return (
		<>
			<Navigation page="checking" useAuth={props.useAuth} />
			<div className="EditArticle">
				<div className="container-fluid">
					<div className="row px-2 py-3 p-md-5 ">
					{postInfo ? <>
						<div className="col-12 mb-5 d-flex align-items-center justify-content-between">
							<h1><Link to="/checking" className="mr-4"><img src={array} alt=""/></Link>Модерация контента</h1>
						</div>
						<form onSubmit={editProfileFormHandler} ref={editProfileForm} className="col-12 py-5">
							<div className="row">
								<div className="col-12 mb-4 d-flex flex-wrap justify-content-center text-center">
									<label className="photo mb-3" style={uploadedPhotoProfileStyles}>
										<input type="file" name="photo" className="file-input" onChange={(e) => readURL(e)} disabled/>
									</label>
								</div>
								<div className="col-12 mb-4">
									<Input name="name" label="Заголовок" value={postInfo.name} validation="notEmpty" errors={errors} />
								</div>
								<div className="col-12 mb-4 mt-3">
									<EditorJs readOnly instanceRef={instance => (instanceRef.current = instance)} tools={EDITOR_JS_TOOLS} i18n={{messages: {}}} data={postInfo.description}/>									
								</div>

								{
									(postInfo.subcategories && postInfo.subcategories.length) ? 
									<div className="col-12 mb-5 mt-3">
										<h2 className="mb-2">Категории</h2>
										{
											postInfo.subcategories.map((item, key) =>
												<div className="mb-1">
												<span>
													<b>{item.name}</b> —
													{item.subcategories.map((subcategory, key) =>
														<span> {subcategory.name}{item.subcategories.length - 1 === key ? "" : ","}</span>
													)}
												</span>
												</div>
											)
										}
									</div>
									: ""
								}

								<div className="col-12 d-flex justify-content-between flex-wrap pt-5 border-top mb-3">
									<div className="select_status mb-4 mb-lg-0">
										<Select name="status" label="Статус" onChange={(e) => onChangeStatus(e)} defaultVariant={([{name: "Статус", value: ""}, {name: "Одобрено", value: "show"}, {name: "Отклонено", value: "rejected"}, {name: "Новый", value: "checking"}].findIndex(item => item.value === postInfo.status))} defaultVariantIsPlaceholder={true} variants={[{name: "Статус", value: ""}, {name: "Одобрено", value: "show"}, {name: "Отклонено", value: "rejected"}, {name: "Новый", value: "checking"}]} />
									</div>
								</div>
								{
									status && status === "rejected" &&
									<div className="col-12 mb-4 status">
										<Textarea name="message" value={message} placeholder="Укажите причину отклонения"/>
									</div>
								}
								<div className="col-12">
									<button type="submit" className="secondary-button">Обновить информацию</button>
								</div>
							</div>

						</form>
						<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
						</> : <BigLoadingState text="Загружаем пост" /> }
					</div>
				</div>
			</div>
		</>
	);
}

export default EditArticle;







