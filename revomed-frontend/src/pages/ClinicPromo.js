import { useState, useEffect, useRef } from "react";
import { useHistory, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from 'swiper/core';
import API from "../utils/API";
import ENVIRONMENT from '../utils/ENVIRONMENT';
import SEO from "../utils/SEO";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import ContentModal from "../utils/ContentModal/ContentModal";

import { DateTime } from 'luxon';



// components
import SelectCustom from "../atoms/SelectCustom/SelectCustom";
import Select from "../atoms/Select/Select";
import Description from "../blocks/Description/Description";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// graphics
import pencilEditIcon from './img/LkUser/pencilEditIcon.svg';
import trash from './img/trash.svg';
import calendarLK from './img/calendarLK.svg';
import clock from './img/clock.svg';
import filial from './img/filial.svg';
import plusWhite from './img/plusWhite.svg';
import success from './img/success.svg';
import back from './img/back.svg';

// styles
import './ClinicPromo.scss';

// slider init
import 'swiper/swiper.scss';
SwiperCore.use([Navigation]);

let ClinicPromo = (props) => {
	const [promos, setPromos] = useState([])
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	const [deleteID, setDeleteID] = useState(null);

	const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
	const [sendInviteModalIsOpen, setSendInviteModalIsOpen] = useState(false);


	let getPromos = async () => {
		let res = await API.get('/clinics/promos');
		return await res.data;
	}

	let promosRequest = () => {
		getPromos().then((result) => setPromos(result.promos), (error) => {
			setGeneralModalHeader("Ошибка");
			setGeneralModalText("Что-то пошло не так. Мы не смогли связаться с сервером, обновите страницу и попробуйте ещё раз.");
			setGeneralModalIsOpen(true);
		})
	}

	// ON PAGE LOAD
	let history = useHistory();
	useEffect(() => {
		document.cookie = "bookingInfo=;max-age=-1";
		promosRequest();
	}, [history, props.match.params.checkupId])
	// END OF ON PAGE LOAD


	let deletePromoRequest = async (id) => {
		let res = await API.delete('/clinics/promos/' + id);
		return await res.data;
	}

	let deletePromoModal = (id) => {
		setDeleteID(id);
		setDeleteModalIsOpen(true);
	}

	let deletePromo = () => {
		console.log("delete id", deleteID);
		deletePromoRequest(deleteID).then(result => {
			setDeleteModalIsOpen(false);
			if (result.success) {
				setGeneralModalHeader("Успешно");
				setGeneralModalText("Вы успешно удалили промоакцию");
				setGeneralModalIsOpen(true);
				promosRequest();
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
    <div className="ClinicPromo">
    	<div className="container py-7">

		<div className="row my-6 header">
			<div className="col-8 mb-6">
				<Link to="/lk" className="back-button mb-4 mb-sm-0 mr-sm-4"><img src={back} className="mr-3" alt="" />Вернуться назад</Link>
			</div>
			<div className="col-8 d-flex justify-content-between flex-wrap align-items-center">
				<div className="mb-3 mb-sm-0 title">
					<h1 className="mb-2">Промоакции</h1>
					<span>Управляйте акциями и программами лояльности</span>
				</div>
				<Link to="/lk/promo/edit" className="add-btn"><img src={plusWhite} alt="" className="mr-3" />Создать промоакцию</Link>
			</div>
		</div>

		{promos ?
		 promos.length ?
				<>
				<div className="row mt-6 mb-3">
					<div className="col-8">
						<Swiper slidesPerColumnFill="row" spaceBetween={30} slidesPerView={1} breakpoints={{576: {slidesPerView: 1.5}, 1200: {slidesPerView: 2.5}}} navigation={{prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next'}} >
							{promos.map((item, key) => 
								<SwiperSlide>
									<div className="promo p-5">
										<h3>{item.name}</h3>
										<div className="d-flex flex-wrap pb-4">
											<span className="d-block w-100 pb-1">Тип</span>
											<span className="type">{item.type === "fixed" ? "Фиксированная" : "Накопительная"}</span>
										</div>
										<div className="data p-4">
											<span className="d-block w-100 mb-1">• Категория: {item.category}</span>
											{
												item.type === "fixed" ?
												<>
													<span className="d-block w-100 mb-1">• Размер скидки: {item.data.sale}%</span>
													<span className="d-block w-100 mb-1">• Дата начала: {item.data.dateStart ? DateTime.fromISO(item.data.dateStart, {zone: 'local'}).setLocale('ru').toFormat('dd.LL.yyyy') : "нет"}</span>
													<span className="d-block w-100">• Дата окончания: {item.data.dateEnd ? DateTime.fromISO(item.data.dateEnd, {zone: 'local'}).setLocale('ru').toFormat('dd.LL.yyyy') : "нет"}</span>
												</>
												:
												<>
													<span className="d-block w-100 mb-1">• После {item.data.numConsultation} консультации</span>
													<span className="d-block w-100 mb-1">• Диапазон скидки: {item.data.minSale}-{item.data.maxSale}%</span>
													<span className="d-block w-100">• Шаг скидки: {item.data.step}%</span>
												</>
											}
											
										</div>
										<div className="mt-4 d-flex">
											<Link to={"/lk/promo/edit/"+item.idPromo} className="edit-btn w-100"><img src={pencilEditIcon} className="pr-2" alt="" />Редактировать акцию</Link>
											<button className="delete-btn ml-3" onClick={() => deletePromoModal(item.idPromo)}><img src={trash} alt="" /></button>
										</div>
									</div>
								</SwiperSlide>
							)}
						</Swiper>
					</div>
				</div>
				</>
				: <div className="text-center py-7 no-info"><span>У вас ещё нет промоакций</span></div> 
				: <div className="text-center py-7 no-info"><span>Загружаем промоакции</span></div> }

		
		
      </div>
      <ContentModal customOverlayClass="DeleteCheckup-overlay" contentClassName="DeleteCheckup-modal" modalIsOpen={deleteModalIsOpen} modalIsOpenCallback={(state) => setDeleteModalIsOpen(state)} modalHeader="Удаление промоакции">
        <div className="info">
        	<p className="mb-5">Вы уверены, что хотите удалить промоакцию? Её нельзя будет восстановить</p>
        	 <button className="m-btn d-inline-block w-100" onClick={() => deletePromo()}>Удалить</button>
        </div>
      </ContentModal>
      <GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />

    </div> 
  );
}

export default ClinicPromo;