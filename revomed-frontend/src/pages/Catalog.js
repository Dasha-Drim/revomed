import { Link, useHistory } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../utils/API";
import { DateTime } from 'luxon';
import {Helmet} from 'react-helmet';

// components
import DoctorFilter from "../blocks/DoctorFilter/DoctorFilter";
import DoctorCard from "../blocks/DoctorCard/DoctorCard";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";
import Pagination from "../elements/Pagination/Pagination";
import Search from "../blocks/Search/Search";

import arrowLeft from './img/arrowLeft.svg';

// styles
import './Catalog.scss';



let Catalog = () => {
	let history = useHistory();

	const [filters, setFilters] = useState(null);
	const [doctorCardsArray, setDoctorCardsArray] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [pagesAvailable, setPagesAvailable] = useState(null);
	const [currentFilterParams, setCurrentFilterParams] = useState(null);
	const [online, setOnline] = useState(history.location.state && (history.location.state.online === false || history.location.state.online === true) ? history.location.state.online : true)
	const [category, setCategory] = useState(history.location.state && history.location.state.category ? history.location.state.category : null)
	const [categoryTitle, setCategoryTitle] = useState(history.location.state && history.location.state.categoryTitle ? history.location.state.categoryTitle : "")

	// GET CATALOG
	let getCatalog = async (data) => {
		let res = await API.get('/doctors', data);
		return await res.data;
	}
	// END OF GET CATALOG


	// ON PAGE LOAD
	useEffect(() => {
		document.cookie = "bookingInfo=;max-age=-1";
		let getAvailableFilters = async () => {
			let res = await API.get('/doctors/filters', {params: {zone: DateTime.now().zoneName}});
			return await res.data;
		};
		getAvailableFilters().then((result) => {
			setFilters(result.filters);
		})
		return () => window.history.replaceState({}, document.title)
	}, [])
	// END OF ON PAGE LOAD

	useEffect(() => {
		setCategory(history.location.state && history.location.state.category ? history.location.state.category : null)
		setCategoryTitle(history.location.state && history.location.state.categoryTitle ? history.location.state.categoryTitle : "")
	}, [history.location.state])


	// ON FILTERS UPDATE
	let filtersUpdated = (params) => {
		setDoctorCardsArray(null);
		setPagesAvailable(null);
		setCurrentFilterParams(params);
		params.timezone = DateTime.now().zoneName;
		params.limit = 10;
		params.offset = 0;
		params.online = online;
		params.category = category;
		getCatalog({params: params}).then((result) => {
			setDoctorCardsArray(result.doctors);
			setPagesAvailable(result.pagesAvailable);
		})
	}
	// END OF ON FILTERS UPDATE

	useEffect(() => {
		setDoctorCardsArray(null);
		setPagesAvailable(null);
		let params = {...currentFilterParams};
		params.timezone = DateTime.now().zoneName;
		params.limit = 10;
		params.offset = 0;
		params.online = online;
		params.category = category;
		getCatalog({params: params}).then((result) => {
			setDoctorCardsArray(result.doctors);
			setPagesAvailable(result.pagesAvailable);
		})
	}, [online])

	useEffect(() => {
		setDoctorCardsArray(null);
		setPagesAvailable(null);
		let params = {...currentFilterParams};
		params.timezone = DateTime.now().zoneName;
		params.limit = 10;
		params.offset = 0;
		params.online = online;
		params.category = category;
		getCatalog({params: params}).then((result) => {
			setDoctorCardsArray(result.doctors);
			setPagesAvailable(result.pagesAvailable);
		})
	}, [category])


	// ON PAGE CHANGE
	let onUpdatePage = (page) => {
		if(currentPage === page) return;
		setCurrentPage(page);
		let params = currentFilterParams || {};
		setDoctorCardsArray(null);
		params.timezone = DateTime.now().zoneName;
		params.limit = 10;
		params.offset = (page-1)*10;
		params.online = online;
		params.category = category;
		getCatalog({params: params}).then((result) => {
			setDoctorCardsArray(result.doctors);
			setPagesAvailable(result.pagesAvailable);
		})
	}
	// END OF ON PAGE CHANGE

	let [search, setSearch] = useState(false)

	let updateStateSearch = (state) => {
		setSearch(state);
		if (state === true) document.body.classList.add('hidden');
		else document.body.classList.remove('hidden');
	}

  return (
    <div className="Catalog">
    <div className={`search-section py-5 pb-7 py-md-5 pb-md-7 ${search ? "active" : ""}`}>
    			<div className="container">
	    			<div className="row">
		    			<div className="col-8">
		    				<Link to="/" className="d-inline-flex align-items-center back-btn mb-4"><img src={arrowLeft} alt="" className="mr-2"/>На главную</Link>
			    			<h1 className="search-section__heading pb-4">Специалисты</h1>
			    			<div className="d-flex flex-wrap flex-sm-nowrap">
			    				<Search page="doctors" placeholder="Специализация, ФИО" updateState={updateStateSearch} value={categoryTitle} />
			    				<div className="d-flex align-items-center ml-sm-4 search-section__buttons mt-4 mt-sm-0">
			    					<button className={`p-3 ${online ? "active" : ""}`} onClick={() => setOnline(true)}>Онлайн</button>
			    					<button className={`p-3 ${!online ? "active" : ""}`} onClick={() => setOnline(false)}>В клинике</button>
			    				</div>
			    			</div>
		    			</div>
		    		</div>
		    	</div>
    		</div>
	    <div className="container pt-5 pb-7 pb-md-7 pt-md-6">
	    <Helmet encodeSpecialCharacters={true} onChangeClientState={(newState, addedTags, removedTags) => console.log(newState, addedTags, removedTags)}>
	      <title>Найти врача и частного специалиста</title>
	      <meta property="description" content="Выберите специалиста, подходящее время или оставьте заявку." />
	    </Helmet>
		    <div className="row">
			    {filters ?
				    <div className="col-8 pb-5">
				    	<DoctorFilter sticky={true} filters={filters} onFiltersChanged={filtersUpdated} />
				    </div>
				: "" }
				{doctorCardsArray ? 
					doctorCardsArray.length ? doctorCardsArray.map((item, key) => 
					<div className="col-8 pb-5 pt-sm-0" key={key}>
						<DoctorCard doctorData={item} online={online} />
					</div>
				)
				: <div className="col-8 pb-5 pt-sm-0 text-center">Ничего не найдено</div> : <BigLoadingState text="Загружаем каталог" /> }
				{pagesAvailable > 1 ? <div className="col-8 mb-7 mt-5 d-flex justify-content-center">
					<Pagination numOfPages={pagesAvailable} onUpdatePage={(page) => onUpdatePage(page)} />
				</div> : "" }
			</div>
		</div>
    </div> 
  );
}

export default Catalog;