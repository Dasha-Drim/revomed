import { Link } from "react-router-dom";
import API from "../../utils/API";
import { useState, useEffect, useRef  } from "react";

import GeneralModal from "../../utils/GeneralModal/GeneralModal";
import ContentModal from "../../utils/ContentModal/ContentModal";

// graphics
import trashIcon from "./trashIcon.svg";

// styles
import "./PostCard.scss";

let PostCard = (props) => {
	// GENERAL MODAL
	let [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	let [generalModalHeader, setGeneralModalHeader] = useState("");
	let [generalModalText, setGeneralModalText] = useState("");
	// END OF GENERAL MODAL

	
	//CONTENT MODAL
	let [contentModalIsOpen, setContentModalIsOpen] = useState(false);
	let [contentModalHeader, setContentModalHeader] = useState("Вы уверенны, что хотите удалить статью?");
	//END OF CONTENT MODAL


	//DELETE POST REQUEST
	let deletePost = async (id) => {
		let res = await API.delete("/posts/"+id);
		return await res.data;
	}
	let deletePostProcess = (e) => {
		e.preventDefault();
		deletePost(props.info.id).then((result) => {
			if (result.success) {
				setGeneralModalHeader("Успешно");
				setGeneralModalText("Вы успешно удалили пост. Обновите страницу");
				setGeneralModalIsOpen(true);
			} else {
				setGeneralModalHeader("Ошибка");
				setGeneralModalText(result.message);
				setGeneralModalIsOpen(true);
			}
		})
	}
	// END OF DELETE POST REQUEST

	return (
		<>
		<div className="PostCard w-100 position-ralative">
			<div className="d-flex align-items-center w-100 flex-wrap">
				<div className="photo" style={{"background": "url("+props.info.photo+")", "backgroundPosition": "center", "backgroundSize": "cover"}}></div>
				<div className="p-4 w-100">
					<h2 className="mb-4">{props.info.title}</h2>
					<div className="d-flex justify-content-end w-100">
						<Link to={"/editpost/" + props.info.id} className="main-button mt-4 mt-md-0 mr-3">Редактировать</Link>
						<button className="third-button mt-4 mt-md-0" onClick={(e)=>{e.preventDefault(); setContentModalIsOpen(true)}}><img src={trashIcon} alt=""/></button>
					</div>
				</div>
			</div>
		</div>
		<ContentModal contentClassName="ttt" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => setContentModalIsOpen(state)} modalHeader={contentModalHeader}>
			<div className="d-flex justify-content-center align-items-center">
				<button className="main-button mr-4" onClick={(e)=>{e.preventDefault(); setContentModalIsOpen(false)}}>Нет</button>
				<button className="secondary-button" onClick={(e) => deletePostProcess(e)}>Да</button>
			</div>
		</ContentModal>
		<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
		</>
	);
}

export default PostCard;

