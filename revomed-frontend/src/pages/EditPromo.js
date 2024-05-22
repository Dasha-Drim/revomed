import { useState, useEffect, useRef } from "react";
import { useHistory, Link } from "react-router-dom";
import API from "../utils/API";
import SEO from "../utils/SEO";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import ContentModal from "../utils/ContentModal/ContentModal";
import DatePicker from "react-datepicker";
import {DateTime} from "luxon";
import { FormValidation } from "../utils/FormValidation";


// components
import Input from "../atoms/Input/Input";
import Textarea from "../atoms/Textarea/Textarea";

import SelectWithLabel from "../atoms/SelectWithLabel/SelectWithLabel";
import Select from "../atoms/Select/Select";
import Description from "../blocks/Description/Description";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// graphics
import pencilEditIcon from './img/LkUser/pencilEditIcon.svg';
import trash from './img/trash.svg';


import crossIcon from './img/LkUserEdit/crossIcon.svg';
import crossIconClinic from './img/LkUserEdit/crossIconClinic.svg';
import plusIconClinic from './img/LkUserEdit/plusIconClinic.svg';

// styles
import './EditPromo.scss';


let EditPromo = (props) => {
	
	const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
	const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
	const [generalModalHeader, setGeneralModalHeader] = useState("");
	const [generalModalText, setGeneralModalText] = useState("");
	const [errors, setErrors] = useState({});
	const [promo, setPromo] = useState(null);

	const [contentModalIsOpen, setContentModalIsOpen] = useState(false);
	const [contentModalText, setContentModalText] = useState(false);


	const [categories, setCategories] = useState([{name: "Все категории", value: "all"}]);
	const [type, setType] = useState("cumulative");
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [noDate, setNoDate] = useState(false);
	const [typeArr] = useState([{name: "Накопительная", value: "cumulative"}, {name: "Фиксированная", value: "fixed"}])
	
	

	let onTypeSelectChange = (selected) => {
		setType(selected.value)
	}


	// ON PAGE LOAD
	let history = useHistory();
	useEffect(() => {
		document.cookie = "bookingInfo=;max-age=-1";
		// get clinic catalog
		let getPromo = async () => {
			let res = await API.get('/clinics/promos/'+props.match.params.promoId);
			return await res.data;
		}
		let getDoctorCategories = async () => {
      let res = await API.get('/categories');
      return await res.data;
    }
		let getCategories = async () => {
			let res = await API.get('/categories');
			return await res.data;
		}
		getCategories().then(result => {
				let arrCategories = categories;
				result.categories.forEach(item => {
					arrCategories.push({name: item.title, value: item.name})
				})
				setCategories(arrCategories);
				if (props.match.params.promoId) {
			getPromo().then((result) => {
				setPromo(result.promo);
				setType(result.promo.type);
				if (result.promo.type === "fixed") {
					if (result.promo.data.dateEnd && result.promo.data.dateStart) {
						setEndDate(DateTime.fromISO(result.promo.data.dateEnd).toJSDate());
						setStartDate(DateTime.fromISO(result.promo.data.dateStart).toJSDate());
					} else {
						setNoDate(true)
					}
				}
			}, (error) => error.response.status === 404 ? history.replace("/404") : null);	
		} else {
			setPromo({id: null});
		}
			})
		

	}, [history, props.match.params.promoId])
	// END OF ON PAGE LOAD

	let postPromo = async (data) => {
		let res = await API.post('/clinics/promos', data);
		return await res.data;
	}
	let putPromo = async (data) => {
		let res = await API.put('/clinics/promos', data);
		return await res.data;
	}

	const postPromoForm = useRef(null);
	let postPromoRequest = (e) => {
		e.preventDefault();
		let currentFormErrors = FormValidation(postPromoForm);
    		setErrors(currentFormErrors);
    		if(!Object.keys(currentFormErrors).length) {
	    	setFormSubmitButtonIsLoading(true);
	    	let postData = new FormData(postPromoForm.current);
	    	if (!promo.idPromo) {
	    		postPromo(postData).then((result) => {
					setFormSubmitButtonIsLoading(false);
					if (result.success) {
						setContentModalText("Вы успешно добавили новую промоакцию");
						setContentModalIsOpen(true);
					} else {
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
	    	} else {
	    		postData.append('id', promo.idPromo);
	    		putPromo(postData).then((result) => {
					setFormSubmitButtonIsLoading(false);
					if (result.success) {
						setContentModalText("Вы успешно обновили данные промоакции");
						setContentModalIsOpen(true);
					} else {
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
	}

	let changeDateRadio = (e) => {
		console.log(e.target.checked);
		if (e.target.checked) setNoDate(e.target.checked)
	}
	let chengeDateStart = (date) => {
		setStartDate(date);
		if (endDate && endDate<date) setEndDate(null)
	}

  return (
    <div className="EditPromo">
    	<div className="container py-7">
		{promo ? <>
			<div className="row my-6 header">
				<div className="col-8 text-center">
					<h1 className="mb-4">{promo.name ? "Редактирование акции" : "Новая промоакция"}</h1>
					<Link to="/lk/promo" className="d-inline-block reset-btn"><img src={crossIcon} className="mr-2" alt="" /> Отменить изменения</Link>
				</div>
			</div>
			
			<div className="row mb-7">
	      	 	<div className="col-8">
					<form onSubmit={postPromoRequest} ref={postPromoForm}>
						<div className="row px-5 py-6 mx-0">
							<div className="col-8 mb-4">
								<h2>Тип скидки</h2>
							</div>
							<div className="col-8 col-lg-4 mb-4 pr-lg-4">
								<SelectWithLabel name="type" label="Тип скидки" onChange={onTypeSelectChange} defaultVariant={promo.type ? typeArr.findIndex(cat => cat.value === promo.type) : 0} variants={typeArr} />
							</div>
							<div className="col-8 mb-4">
								<h2>Основные настройки</h2>
							</div>
							<div className="col-8 col-lg-4 mb-4 pr-lg-4">
				      			<Input name="name" label="Название (не публично)" validation="notEmpty" defaultValue={promo.name} errors={errors} />
				      		</div>
				      		<div className="col-8 col-lg-4 mb-4 pl-lg-4">
								{categories.length > 1 && <SelectWithLabel name="category" label="Категория специалистов" defaultVariant={promo.category ? categories.findIndex(cat => cat.value === promo.category) : 0} variants={categories} />}
							</div>
							{
								type === "fixed" &&
								<>
								{
									!noDate &&
									<>
									<div className="col-8 col-lg-4 mb-4 pr-lg-4">
										<DatePicker
											dateFormat="dd.MM.yyyy"
									      	selected={props.data ? props.data.dateStart : startDate}
									      	onChange={(date) => chengeDateStart(date)}
									      	minDate={new Date()}
									      	className="dateSelect"
									      	placeholderText="Дата начала акции"
									      	name="dateStart"
									    />
									</div>
									<div className="col-8 col-lg-4 mb-4 pl-lg-4">
										<DatePicker
											dateFormat="dd.MM.yyyy"
									      	selected={props.data ? props.data.dateEnd : endDate}
									      	onChange={(date) => setEndDate(date)}
									      	minDate={startDate ? startDate : new Date()}
									      	className="dateSelect"
									      	placeholderText="Дата окончания акции"
									      	name="dateEnd"
								    	/>
									</div>
								</>
								}
								
								<div className="col-8 mb-4">
									<label className="InputPlusWithDates-toggle  d-flex align-items-center ">
							    		<input name="isDateEnd" type="checkbox" tabIndex="-1" checked={noDate} onChange={(e)=>setNoDate(e.target.checked)}/>
							    		<span className="InputPlusWithDates-toggle__label ml-3">Без ограничений по времени (акция может быть удалена вручную)</span>
							    	</label>
								</div>
								</>
							}
							{
								type === "cumulative" &&
								<>
								<div className="col-8 mb-4 mt-4">
									<h2>Настройки накопительной скидки</h2>
								</div>
								<div className="col-8 col-lg-4 mb-4 pr-lg-4">
					      			<Input name="numConsultation" label="После консультации №" validation="notEmpty onlyNums" defaultValue={promo.data ? promo.data.numConsultation : null} errors={errors} availableSymbols="numbers" />
					      		</div>
					      		<div className="col-8 col-lg-4 mb-4 pl-lg-4">
					      			<Input name="minSale" label="Первоначальный размер скидки, %" defaultValue={promo.data ? promo.data.minSale : null} validation="notEmpty onlyNums procentValue" errors={errors} availableSymbols="numbers"/>
					      		</div>					      		<div className="col-8 col-lg-4 mb-4 pr-lg-4">
					      			<Input name="step" label="Шаг скидки, %" validation="notEmpty onlyNums procentValue" defaultValue={promo.data ? promo.data.step : null} errors={errors} availableSymbols="numbers"/>
					      		</div>
					      		<div className="col-8 col-lg-4 mb-4 pl-lg-4">
					      			<Input name="maxSale" label="Максимальный размер скидки, %" defaultValue={promo.data ? promo.data.maxSale : null} validation="notEmpty onlyNums procentValue" errors={errors} availableSymbols="numbers"/>
					      		</div>
					      		<div className="col-8 mb-4 mt-4">
									<div className="d-flex"><span className="pr-3">•</span><p><b>После консультации №</b> — здесь указывается после какой по счёту консультации начинает действовать накопительная скидка у пациента. Например, если вы укажите 2, то скидка начнёт действовать после второй завершённой консультации пациента в Вашей клинике</p></div>
									<div className="d-flex"><span className="pr-3">•</span><p><b>Первоначальный размер скидки</b> — процент первой скидки</p></div>
									<div className="d-flex"><span className="pr-3">•</span><p><b>Шаг скидки</b> — процент, на который увеличивается скидка с каждой новой завершённой консультацией пациента. Например, если указать 2, то каждый раз после завершения сеанса скидка пациента на новое бронирование будет увеличиваться на 2%</p></div>
									<div className="d-flex"><span className="pr-3">•</span><p><b>Максимальный размер скидки</b> — максимальный процент, которого может достигнуть накопительная скидка пациента</p></div>
								</div>
								</>
							}
							{
								type === "fixed" &&
								<>
								<div className="col-8 mb-4 mt-4">
									<h2>Настройки фиксированной скидки</h2>
								</div>
								<div className="col-8 col-lg-4 mb-4 pr-lg-4">
					      			<Input name="sale" label="Размер скидки, %" defaultValue={promo.data ? promo.data.sale : null} validation="notEmpty onlyNums procentValue" errors={errors} availableSymbols="numbers" />
					      		</div>
					      		<div className="col-8 mb-4 mt-4">
									<div className="d-flex"><span className="pr-3">•</span><p><b>Размер скидки</b> — процент, на который снижается стоимость консультации</p></div>
								</div>
								</>
							}

							<div className="col-8 mt-6">
				      			<button type="submit" className="ui-r-main-button px-6 mx-auto d-flex justify-content-center" disabled={formSubmitButtonIsLoading}>
									<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
									<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Сохранить</span>
								</button>
				      		</div>
						</div>
					</form>
				</div>
			</div>
			</> : <div className="mb-7"><BigLoadingState text="Загружаем данные промоакции" /></div> }
		
      	</div>
      	<ContentModal contentClassName="promo-modal" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => {setContentModalIsOpen(state) }} modalHeader="Успешно">
			<p className="mb-4">{contentModalText}</p>
			<Link to="/lk/promo" className="m-btn d-inline-block w-100">Хорошо</Link>
		</ContentModal>
      	<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
    </div> 
  );
}

export default EditPromo;