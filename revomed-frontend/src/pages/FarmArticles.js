import { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from 'swiper/core';
import API from "../utils/API";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import ContentModal from "../utils/ContentModal/ContentModal";

// components
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// graphics
import pencilEditIcon from './img/LkUser/pencilEditIcon.svg';
import trash from './img/trash.svg';
import plus from './img/plus.svg';
import plusWhite from './img/plusWhite.svg';
import back from './img/back.svg';

// styles
import './FarmArticles.scss';

// slider init
import 'swiper/swiper.scss';
SwiperCore.use([Navigation]);

let FarmArticles = (props) => {
	const [articles, setArticles] = useState([])
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	const [deleteID, setDeleteID] = useState(null);

	const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);


	let getArticles = async () => {
		let res = await API.get('/farms/articles');
		return await res.data;
	}

	let articlesRequest = () => {
		getArticles().then((result) => setArticles(result.articles), (error) => {
			setGeneralModalHeader("Ошибка");
			setGeneralModalText("Что-то пошло не так. Мы не смогли связаться с сервером, обновите страницу и попробуйте ещё раз.");
			setGeneralModalIsOpen(true);
		})
	}

	// ON PAGE LOAD
	let history = useHistory();
	useEffect(() => {
		document.cookie = "bookingInfo=;max-age=-1";
		articlesRequest();
	}, [history, props.match.params.articleId])
	// END OF ON PAGE LOAD


	let deleteArticleRequest = async (id) => {
		let res = await API.delete('/farms/articles/' + id);
		return await res.data;
	}

	let deleteArticleModal = (id) => {
		setDeleteID(id);
		setDeleteModalIsOpen(true);
	}

	let deleteArticle = () => {
		console.log("delete id", deleteID);
		deleteArticleRequest(deleteID).then(result => {
			setDeleteModalIsOpen(false);
			if (result.success) {
				setGeneralModalHeader("Успешно");
				setGeneralModalText("Вы успешно удалили статью");
				setGeneralModalIsOpen(true);
				articlesRequest();
			} else {
				setFormSubmitButtonIsLoading(false);
				setGeneralModalHeader("Ошибка");
				setGeneralModalText("Что-то пошло не так. Обновите страницу и попробуйте ещё раз.");
				setGeneralModalIsOpen(true);
			}
		},
		(error) => {
			setDeleteModalIsOpen(false);
			setFormSubmitButtonIsLoading(false);
			setGeneralModalHeader("Ошибка");
			setGeneralModalText("Что-то пошло не так. Мы не смогли связаться с сервером, обновите страницу и попробуйте ещё раз.");
			setGeneralModalIsOpen(true);
		})
	}

		let declOfNum = (n, text_forms) => {  
	    n = Math.abs(n) % 100; 
	    var n1 = n % 10;
	    if (n > 10 && n < 20) { return text_forms[2]; }
	    if (n1 > 1 && n1 < 5) { return text_forms[1]; }
	    if (n1 == 1) { return text_forms[0]; }
	    return text_forms[2];
	}

  return (
    <div className="FarmArticles">
    	<div className="container py-7">
				<div className="row my-6 header">
					<div className="col-8 mb-6">
						<Link to="/lk" className="back-button mb-4 mb-sm-0 mr-sm-4"><img src={back} className="mr-3" alt="" />Вернуться назад</Link>
					</div>
					<div className="col-8 d-flex justify-content-between flex-wrap align-items-center">
						<div className="mb-3 mb-sm-0 title">
							<h1 className="mb-2">Статьи</h1>
							<span>Привлекайте внимание пациентов статьями в блоге</span>
						</div>
						<Link to="/lk/articles/edit" className="add-btn"><img src={plusWhite} alt="" className="mr-3" />Создать статью</Link>
					</div>
				</div>

				{articles ?
		 		articles.length ?
				<>
				<div className="row mt-6 mb-3">
					<div className="col-8">
						<Swiper slidesPerColumnFill="row" spaceBetween={30} slidesPerView={1} breakpoints={{576: {slidesPerView: 1.5}, 1200: {slidesPerView: 2.5}}} navigation={{prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next'}} >
							{articles.map((item, key) => 
								<SwiperSlide>
									<div className="article p-5">
										<h3>{item.title}</h3>
										<div>
											<p className="d-block w-100 mb-3">{item.annotation}</p>
										</div>
										<div className="d-flex flex-wrap pb-2">
											<span className="d-block w-100 pb-1">Статус</span>
											<span className="price">{item.status === "show" ? "Показывается" : item.status === "rejected" ? "Отклонено" : "На модерации"}</span>
										</div>
										<div className="mt-4 d-flex">
											<Link to={"/lk/articles/edit/"+item.idArticle} className="edit-btn w-100"><img src={pencilEditIcon} className="pr-2" alt="" />Редактировать статью</Link>
											<button className="delete-btn ml-3" onClick={() => deleteArticleModal(item.idArticle)}><img src={trash} alt="" /></button>
										</div>
									</div>
								</SwiperSlide>
							)}
						</Swiper>
					</div>
				</div>
				</>
				: <div className="text-center py-7 no-info"><span>У вас ещё нет статей</span></div> 
				: <div className="text-center py-7 no-info"><span>Загружаем статьи</span></div> }
			</div>
      <GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
    	<ContentModal customOverlayClass="DeleteArticle-overlay" contentClassName="DeleteArticle-modal" modalIsOpen={deleteModalIsOpen} modalIsOpenCallback={(state) => setDeleteModalIsOpen(state)} modalHeader="Удаление статьи">
        <div className="info">
        	<p className="mb-5">Вы уверены, что хотите удалить статью? Её нельзя будет восстановить</p>
        	 <button className="m-btn d-inline-block w-100" onClick={() => deleteArticle()}>Удалить</button>
        </div>
      </ContentModal>
    </div> 
  );
}

export default FarmArticles;