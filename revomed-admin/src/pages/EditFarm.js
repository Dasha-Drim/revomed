import { useState, useEffect, useRef  } from "react";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import { Link } from "react-router-dom";
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
import "./EditFarm.scss";

let EditFarm = (props) => {
	let [farm, setFarm] = useState(null);
	let [uploadedPhotoProfileStyles, setUploadedPhotoProfileStyles] = useState({});
	let [currrentFile, setCurrrentFile] = useState(null);
	let [errors, setErrors] = useState({});

	// GENERAL MODAL
	let [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	let [generalModalHeader, setGeneralModalHeader] = useState("");
	let [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL
	
	
	// ON PAGE LOAD
	useEffect(() => {
		let getFarm = async (id) => {
			let res = await API.get("/farms/"+id);
			return await res.data;
		}
		getFarm(props.match.params.idSeller).then((result) => {
			setFarm(result.farm);
			setUploadedPhotoProfileStyles({backgroundImage: "url("+result.farm.logo+")", backgroundPosition: "center", backgroundSize: "cover"});
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
	let editProfileForm = useRef(null);
	let postEditProfile = async (data) => {
		let res = await API.put("/farms", data);
		return await res.data;
	}	  
	let editProfileFormHandler = (e) => {
		e.preventDefault();

		let formItems = editProfileForm.current.elements;
		let postData = new FormData();

		[...formItems].forEach(item => {
			if(!item.name) return;
			if(item.name === "logo") {
				if (currrentFile) {
					postData.append("logo", currrentFile);
				}
			}
			postData.append(item.name, item.value);
		})
		postData.append("idFarm", farm.idFarm);

		postEditProfile(postData).then((result) => {
			if (result.success) {
				setGeneralModalHeader("Успешно");
				setGeneralModalText("Вы успешно изменили данные компании");
				setGeneralModalIsOpen(true);
			} else {
				setGeneralModalHeader("Ошибка");
				setGeneralModalText(result.message);
				setGeneralModalIsOpen(true);
			}
		})
	}
	// END OF EDIT PROFILE FORM

	return (
		<>
			<Navigation page="applications" useAuth={props.useAuth} />
			<div className="EditFarm">
				<div className="container-fluid">
					<div className="row px-2 py-3 p-md-5">
					{farm ? <>
						<div className="col-12 mb-5 d-flex align-items-center justify-content-between">
							<h1><Link to="/applications" className="mr-4"><img src={array} alt=""/></Link>Редактирование фармкомпании</h1>
						</div>
						<form onSubmit={editProfileFormHandler} ref={editProfileForm} className="col-12 py-5" noValidate>
							<div className="row">
								<div className="col-12 mb-4 d-flex flex-wrap justify-content-center text-center">
									<div className="avatar mb-3" style={uploadedPhotoProfileStyles}>
										<label className="file">
											<input type="file" name="logo" className="file-input" onChange={(e) => readURL(e)}/>
											<img src={uploadFileIcon} alt=""/>
										</label>
									</div>
									<h2 className="d-block w-100">{farm.name}</h2>
								</div>
								<div className="col-12 mb-4">
									<h3>Общая информация</h3>
								</div>
								<div className="col-6 mb-4">
									<Input name="name" label="Название фармкомпании" defaultValue={farm.name} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="email" label="Email менеджера" defaultValue={farm.email} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="license" label="Номер лицензии" defaultValue={farm.license} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="managerFio" label="ФИО менеджера" defaultValue={farm.managerFio} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="managerPhone" label="Номер телефона менеджера" defaultValue={farm.managerPhone} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								<div className="col-6 mb-4">
									<Input name="INN" label="ИНН" defaultValue={farm.INN} validation="notEmpty onlyLetters" errors={errors} />
								</div>
								
								<div className="col-12 d-flex justify-content-between flex-wrap pt-5 border-top">
									<div className="select_status mb-4 mb-lg-0">
										<Select name="status" label="Статус" defaultVariant={([{name: "Статус", value: ""}, {name: "Принят", value: "accepted"}, {name: "Заблокирован", value: "blocked"}].findIndex(item => item.value === farm.status))} defaultVariantIsPlaceholder={true} variants={[{name: "Статус", value: ""}, {name: "Принят", value: "accepted"}, {name: "Заблокирован", value: "blocked"}]} />
									</div>
									<button type="submit" className="secondary-button">Обновить информацию</button>
								</div>
							</div>
						</form>
						<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
						</> : <BigLoadingState text="Загружаем данные фармкомпании"/>}
					</div>
				</div>
			</div>
		</>
	);
}

export default EditFarm;