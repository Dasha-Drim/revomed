import { useState, useEffect, useRef  } from "react";
import { Link } from "react-router-dom";
import ContentEditable from 'react-contenteditable'
import API from "../../utils/API";
import GeneralModal from "../../utils/GeneralModal/GeneralModal";
import ContentModal from "../../utils/ContentModal/ContentModal";

//graphics
import trashIcon from "./trashIcon.svg";
import star from "./star.svg";
import starActive from "./starActive.svg";

// styles
import "./ReviewCard.scss";

let ReviewCard = (props) => {
	let [editReview, setEditReview] = useState(true);
	let [valueReview, setValueReview] = useState(props.info.text);

	// GENERAL MODAL
	let [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	let [generalModalHeader, setGeneralModalHeader] = useState("");
	let [generalModalText, setGeneralModalText] = useState("");
	//END OF GENERAL MODAL

	// CONTENT MODAL
	let [contentModalIsOpen, setContentModalIsOpen] = useState(false);
	let [contentModalHeader, setContentModalHeader] = useState("Вы уверенны, что хотите удалить отзыв?");
	// END OF CONTENT MODAL

	

  	// EDIT REVIEW REQUEST
  	let editReviewPost = async (data) => {
		let res = await API.put("/reviews", data);
		return await res.data;
	}	  
	let editReviewProcess = (e) => {
		e.preventDefault();

		let postData= new FormData();
		postData.append("id", props.info.idReview);
		postData.append("text", valueReview);

		editReviewPost(postData).then((result) => {
			if (result.success) {
				setGeneralModalHeader("Успешно");
				setGeneralModalText("Вы успешно изменили отзыв");
				setGeneralModalIsOpen(true);
			} else {
				setGeneralModalHeader("Ошибка");
				setGeneralModalText(result.message);
				setGeneralModalIsOpen(true);
			}
		})
	}
	// END OF EDIT REVIEW REQUEST


	//DELETE REVIEW REQUEST
	let deleteReview= async (id) => {
		let res = await API.delete("/reviews/"+id);
		return await res.data;
	}
	
	let deleteReviewProcess = (e) => {
		e.preventDefault();
		deleteReview(props.info.idReview).then((result) => {
			if (result.success) {
				setGeneralModalHeader("Успешно");
				setGeneralModalText("Вы успешно удалили отзыв. Обновите страницу");
				setGeneralModalIsOpen(true);
			} else {
				setGeneralModalHeader("Ошибка");
				setGeneralModalText(result.message);
				setGeneralModalIsOpen(true);
			}
		})
	}
	// END OF DELETE REVIEW

	return (
		<>
		<div className="ReviewCard w-100 position-ralative p-4">
			<div className=" mb-4 d-flex align-items-center w-100 flex-wrap justify-content-between">
				<h2>Отзыв от {props.info.clientName}</h2>
				<div className="rating d-flex align-items-center">
					<img src={+props.info.mark >= 1 ? starActive : star} className="mr-1" alt="" />
					<img src={+props.info.mark >= 1.5 ? starActive : star} className="mr-1" alt="" />
					<img src={+props.info.mark >= 2.5 ? starActive : star} className="mr-1" alt="" />
					<img src={+props.info.mark >= 3.5 ? starActive : star} className="mr-1" alt="" />
					<img src={+props.info.mark >= 4.5 ? starActive : star} alt="" />
		    	</div> 
			</div>
			<div className="w-100">
				<ContentEditable html={valueReview} disabled={editReview} onChange={(evt) => setValueReview(evt.target.value)} tagName='p' />
			</div>
			<div className="w-100 mb-4">
				{props.info.doctorName ?
				 	<><span>Врач: </span><Link to={"/editdoctor/"+props.info.id} className="doctor ml-2">{props.info.doctorName}</Link></>
				 	:
				 	<><span>Клиника: </span><Link to={"/editclinic/"+props.info.id} className="doctor ml-2">{props.info.clinicName}</Link></>
				}
			</div>
			<div className="d-flex">
				{
					(editReview)
					?
					<button className="main-button mt-4 mt-md-0 mr-3" onClick={() => setEditReview(false)}>Редактировать</button>
					:
					<button className="secondary-button mt-4 mt-md-0 mr-3" onClick={(e) => {editReviewProcess(e); setEditReview(true)}}>Сохранить</button>
				}
				<button className="third-button mt-4 mt-md-0" onClick={(e)=>{e.preventDefault(); setContentModalIsOpen(true)}}><img src={trashIcon} alt=""/></button>
			</div>
		</div>
		<ContentModal contentClassName="ttt" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => setContentModalIsOpen(state)} modalHeader={contentModalHeader}>
			<div className="d-flex justify-content-center align-items-center">
				<button className="main-button mr-4" onClick={(e)=>{e.preventDefault(); setContentModalIsOpen(false)}}>Нет</button>
				<button className="secondary-button" onClick={(e) => deleteReviewProcess(e)}>Да</button>
			</div>
		</ContentModal>
		<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
		</>
	);
}

export default ReviewCard;