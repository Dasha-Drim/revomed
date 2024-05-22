import { useState, useEffect, useRef } from "react";
import { useHistory, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from 'swiper/core';
import API from "../utils/API";
import ENVIRONMENT from '../utils/ENVIRONMENT';
import SEO from "../utils/SEO";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import ContentModal from "../utils/ContentModal/ContentModal";



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
import plus from './img/plus.svg';
import plusWhite from './img/plusWhite.svg';
import success from './img/success.svg';
import back from './img/back.svg';

// styles
import './ClinicCheckup.scss';

// slider init
import 'swiper/swiper.scss';
SwiperCore.use([Navigation]);

let ClinicCheckup = (props) => {
	const [checkups, setCheckups] = useState([])
	const [applications, setApplications] = useState([])
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	const [deleteID, setDeleteID] = useState(null);
	const [inviteID, setInviteID] = useState(null);

	const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
	const [sendInviteModalIsOpen, setSendInviteModalIsOpen] = useState(false);

	let getApplications = async () => {
		let res = await API.get('/clinics/checkups/applications');
		return await res.data;
	}

	let applicationsRequest = () => {
		getApplications().then((result) => setApplications(result.applications), (error) => {
			setGeneralModalHeader("Ошибка");
			setGeneralModalText("Что-то пошло не так. Мы не смогли связаться с сервером, обновите страницу и попробуйте ещё раз.");
			setGeneralModalIsOpen(true);
		})
	}

	let getCheckups = async () => {
		let res = await API.get('/clinics/checkups');
		return await res.data;
	}

	let checkupsRequest = () => {
		getCheckups().then((result) => setCheckups(result.checkups), (error) => {
			setGeneralModalHeader("Ошибка");
			setGeneralModalText("Что-то пошло не так. Мы не смогли связаться с сервером, обновите страницу и попробуйте ещё раз.");
			setGeneralModalIsOpen(true);
		})
	}

	// ON PAGE LOAD
	let history = useHistory();
	useEffect(() => {
		document.cookie = "bookingInfo=;max-age=-1";
		checkupsRequest();
		applicationsRequest();
	}, [history, props.match.params.checkupId])
	// END OF ON PAGE LOAD


	let deleteCheckupRequest = async (id) => {
		let res = await API.delete('/clinics/checkups/' + id);
		return await res.data;
	}

	let deleteCheckupModal = (id) => {
		setDeleteID(id);
		setDeleteModalIsOpen(true);
	}

	let deleteCheckup = () => {
		console.log("delete id", deleteID);
		deleteCheckupRequest(deleteID).then(result => {
			setDeleteModalIsOpen(false);
			if (result.success) {
				setGeneralModalHeader("Успешно");
				setGeneralModalText("Вы успешно удалили чекап");
				setGeneralModalIsOpen(true);
				checkupsRequest();
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

	let inviteCheckupRequest = async (id) => {
		let res = await API.post('/clinics/checkups/applications/invite', {id: id});
		return await res.data;
	}

	let inviteCheckupModal = (id) => {
		setInviteID(id);
		setSendInviteModalIsOpen(true);
	}

	let inviteCheckup = () => {
		console.log("inviteCheckup id", inviteID)
		inviteCheckupRequest(inviteID).then(result => {
			setSendInviteModalIsOpen(false);
			if (result.success) {
				setGeneralModalHeader("Успешно");
				setGeneralModalText("Вы успешно отправили приглашение");
				setGeneralModalIsOpen(true);
				applicationsRequest();
			} else {
				setFormSubmitButtonIsLoading(false);
				setGeneralModalHeader("Ошибка");
				setGeneralModalText("Что-то пошло не так. Обновите страницу и попробуйте ещё раз.");
				setGeneralModalIsOpen(true);
			}
		},
		(error) => {
			setSendInviteModalIsOpen(false);
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
    <div className="ClinicCheckup">
    	<div className="container py-7">
		<div className="row my-6 header">
			<div className="col-8 mb-6">
				<Link to="/lk" className="back-button mb-4 mb-sm-0 mr-sm-4"><img src={back} className="mr-3" alt="" />Вернуться назад</Link>
			</div>
			<div className="col-8 d-flex justify-content-between flex-wrap align-items-center">
				<div className="mb-3 mb-sm-0 title">
					<h1 className="mb-2">Чекапы</h1>
					<span>Предложите пациентам комплексные обследования</span>
				</div>
				<Link to="/lk/checkup/edit" className="add-btn"><img src={plusWhite} alt="" className="mr-3" />Создать чекап</Link>
			</div>
		</div>

		{checkups ?
		 checkups.length ?
				<>
				<div className="row mt-6 mb-3">
					<div className="col-8">
						<Swiper slidesPerColumnFill="row" spaceBetween={30} slidesPerView={1} breakpoints={{576: {slidesPerView: 1.5}, 1200: {slidesPerView: 2.5}}} navigation={{prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next'}} >
							{checkups.map((item, key) => 
								<SwiperSlide>
									<div className="checkup p-5">
										<h3>{item.name}</h3>
										<p className="pb-4 mb-0">{item.annotation}</p>
										<div className="d-flex flex-wrap pb-4">
											<span className="d-block w-100 pb-1">Стоимость</span>
											<span className="price">{item.price}₽</span>
										</div>
										<div className="surveys p-4">
											<span className="d-block w-100 pb-1">• {item.surveys.length} {declOfNum(item.surveys.length, ["обследование", "обследования", "обследований"])}</span>
											{item.consultation 
												? 
												<span className="d-block w-100">• 1 консультация с врачём</span>
												:
												<span className="d-block w-100">• Нет консультации с врачём</span>
											}
										</div>
										<div className="mt-4 d-flex">
											<Link to={"/lk/checkup/edit/"+item.idCheckup} className="edit-btn w-100"><img src={pencilEditIcon} className="pr-2" alt="" />Редактировать чекап</Link>
											<button className="delete-btn ml-3" onClick={() => deleteCheckupModal(item.idCheckup)}><img src={trash} alt="" /></button>
										</div>
									</div>
								</SwiperSlide>
							)}
						</Swiper>
					</div>
				</div>
				</>
				: <div className="text-center py-7 no-info"><span>У вас ещё нет чекапов</span></div> 
				: <div className="text-center py-7 no-info"><span>Загружаем чекапы</span></div> }

		<div className="row mt-7">
			<div className="col-8">
				<div className="header w-100">
					<h2 className="mb-0">Заявки</h2>
				</div>
			</div>
			{applications ?
				applications.length ?
				<>
					<div className="col-8 mt-6 applications py-5">
					<div  className="applications__holder">
						{applications.map((item, key) => 
							<div className={`applications-item py-5 px-5 ${key+1 !== applications.length ? "border-true" : ""}`}>
								<div className="item-content mb-0 mb-sm-4">
									<div className="mb-4 mb-lg-0">
										<h3 className="mb-2">{item.nameClient}</h3>
										<span>№ {item.id}</span>
									</div>
									<div className="mb-3 mb-lg-0">
										<span className="d-block w-100 title mb-2">Желаемая дата</span>
										<span className="d-flex align-items-center w-100"><img src={calendarLK} className="mr-2" />{item.date}</span>
									</div>
									<div className="mb-3 mb-lg-0 text-right text-sm-left">
										<span className="d-block w-100 title mb-2">Желаемое время</span>
										<span className="d-flex align-items-center justify-content-end justify-content-sm-start w-100"><img src={clock} className="mr-2" />{item.time}</span>
									</div>
									<div className="mb-3 mb-lg-0">
										<span className="d-block w-100 title mb-2">Чекап</span>
										<span className="d-block w-100">{item.nameCheckup}</span>
									</div>
									<div className="text-right invite-btns mb-4 mb-lg-0">
										{
											!item.invite 
											?
											<button className="invite-btn ml-3 d-inline-flex align-items-center" onClick={() => inviteCheckupModal(item.id)}><img src={plus} className="mr-3" />Пригласить</button> 
											:
											<span className="invited d-inline-flex align-items-center"><img src={success} className="mr-3" />Приглашён</span>
									}
									</div>
								</div>
								<span className="d-block w-100 title mb-2">Филиал</span>
								<span className="d-flex align-items-center w-100"><img src={filial} className="mr-3" />{item.adress}</span>
							</div>
						)}
						</div>
					</div>
				</>
			: <div className="col-8 text-center py-7 no-info"><span>У вас ещё нет заявок</span></div>
			: <div className="col-8 text-center py-7 no-info"><span>Загружаем чекапы</span></div>}
		</div>
		
      </div>
      <GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />

      <ContentModal customOverlayClass="DeleteCheckup-overlay" contentClassName="DeleteCheckup-modal" modalIsOpen={deleteModalIsOpen} modalIsOpenCallback={(state) => setDeleteModalIsOpen(state)} modalHeader="Удаление чекапа">
        <div className="info">
        	<p className="mb-5">Вы уверены, что хотите удалить чекап? Его нельзя будет восстановить</p>
        	 <button className="m-btn d-inline-block w-100" onClick={() => deleteCheckup()}>Удалить</button>
        </div>
      </ContentModal>

      <ContentModal customOverlayClass="SendInvite-overlay" contentClassName="SendInvite-modal" modalIsOpen={sendInviteModalIsOpen} modalIsOpenCallback={(state) => setSendInviteModalIsOpen(state)} modalHeader="Пригласить на чекап">
        <div className="info">
        	<p className="mb-5">Пациент получит смс-сообщение, с номером телефона клиники и уникальным номером ID записи. Мы попросим его позвонить Вам, чтобы обсудить детали и подтвердить дату и время</p>
        	 <button className="m-btn d-inline-block w-100" onClick={() => inviteCheckup()}>Отправить приглашение</button>
        </div>
      </ContentModal>
    </div> 
  );
}

export default ClinicCheckup;