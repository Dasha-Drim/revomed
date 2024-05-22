import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../utils/API";
import {Helmet} from 'react-helmet';

// components
import ClinicCard from "../blocks/ClinicCard/ClinicCard";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";
import Pagination from "../elements/Pagination/Pagination";
import Search from "../blocks/Search/Search";

import arrowLeft from './img/arrowLeft.svg';

// styles
import './CatalogClinic.scss';

let CatalogClinic = () => {
	const [clinicCardsArray, setClinicCardsArray] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [pagesAvailable, setPagesAvailable] = useState(null);

	// GET CATALOG CLINIC
	let getCatalog = async (data) => {
		let res = await API.get('/clinics', data);
		return await res.data;
	}
	// GET CATALOG CLINIC


	// ON PAGE LOAD
	useEffect(() => {
		document.cookie = "bookingInfo=;max-age=-1";
		// get catalog
		let params = {
			limit: 10,
			offset: 0
		}
		getCatalog({params: params}).then((result) => {
			setClinicCardsArray(result.clinics);
			setPagesAvailable(result.pagesAvailable);
		})
	}, [])
	// END OF ON PAGE LOAD


	// ON PAGE CHANGE
	let onUpdatePage = (page) => {
		if(currentPage === page) return;
		setCurrentPage(page);
		setClinicCardsArray(null);
		let params = {
			limit: 10,
			offset: (page-1)*10
		}
		getCatalog({params: params}).then((result) => {
			setClinicCardsArray(result.clinics);
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
    <div className="CatalogClinic">
    	<div className={`search-section py-5 pb-7 py-md-5 pb-md-7 pb-md-7 ${search ? "active" : ""}`}>
    			<div className="container">
	    			<div className="row">
		    			<div className="col-8">
		    				<Link to="/" className="d-inline-flex align-items-center back-btn mb-4"><img src={arrowLeft} alt="" className="mr-2"/>На главную</Link>
			    			<h1 className="search-section__heading pb-4">Клиники</h1>
			    			<Search page="clinics" placeholder="Поиск по названию" updateState={updateStateSearch} />
		    			</div>
		    		</div>
		    	</div>
    		</div>
    	<div className="container pb-7 pt-6">
    	<Helmet encodeSpecialCharacters={true} onChangeClientState={(newState, addedTags, removedTags) => console.log(newState, addedTags, removedTags)}>
	      <title>Найти медицинский центр</title>
	      <meta property="description" content="Изучайте профиль мед центра. Записывайтесь на прием или услугу онлайн." />
	    </Helmet>
    		<div className="row">
	    		{clinicCardsArray ? clinicCardsArray.map((item, key) =>
					<div key={key} className="col-8 pb-5 pt-sm-0">
						<ClinicCard clinicData={item} />
					</div>
	    		) : <BigLoadingState text="Загружаем клиники" />}
	    		{pagesAvailable > 1 ? <div className="col-8 mb-7 mt-5 d-flex justify-content-center">
					<Pagination numOfPages={pagesAvailable} onUpdatePage={(page) => onUpdatePage(page)} />
				</div> : "" }
    		</div>
      </div>
    </div> 
  );
}

export default CatalogClinic;
