import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"
import API from "../utils/API";

//components
import Navigation from "../blocks/Navigation/Navigation";
import ApplicationCard from "../blocks/ApplicationCard/ApplicationCard";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// graphics
import search from "./img/Applications/search.svg";
import filter from "./img/Applications/filter.svg";
import cross from "./img/cross.svg";
import plus from "./img/plus.svg";

// styles
import "./Applications.scss";

let Applications = (props) => {
	const [applications, setApplications] = useState(null);
	const [filteredApplications, setFilteredApplications] = useState(null);
	let [openSearch, setOpenSearch] = useState(false);

	let [modalOpen, setModalOpen] = useState(false);
	let [filtersArray, setFiltersArray] = useState([]);
	let [actionFiltersArray, setActionFiltersArray] = useState(1); //1 - add 2 - delete


	// GET CATALOG
	let getCatalog = async (data) => {
		let res = await API.get("/sellers", data);
		return await res.data;
	}
	// END OF CATALOG

	
	// ON PAGE LOAD
	useEffect(()=> {
		getCatalog().then((result) => {
			setApplications(result.applications);
			// now w/o applied filters
			setFilteredApplications(result.applications);
		})
	}, [])
	// END OF ON PAGE LOAD


	// FILTERS DROPDOWN
	let filters = [
		{ title: "Только врачи", value: "doctor"},
		{ title: "Только клиники", value: "clinic"},
		{ title: "Только фармкомпании", value: "farm"},
		{ title: "Принятые", value: "accepted"},
		{ title: "Заблокированые", value: "blocked"},
		{ title: "Новые", value: "new"}
	]

	let wrapperRef = useRef(null);
	useEffect(() => {
		function handleClickOutside(event) {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
				setModalOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [wrapperRef])
	// END OF FILTERS DROPDOWN
	

	// ADD FILTER
	let addFilter = (item) => {
		let arr = filtersArray.slice(0);
		let oneFilter = {};
		let isItemAlreadyInFiltersArray = arr.findIndex(filterItem => item.target.childNodes[0].defaultValue === filterItem.value);
		if (isItemAlreadyInFiltersArray === -1) {
			oneFilter = {title: item.target.innerText, value: item.target.childNodes[0].defaultValue};
			arr.push(oneFilter);
			setFiltersArray(arr);
			setActionFiltersArray(1)
		}
	}
	// END OF ADD FILTER


	// DELETE FILTER
	let deleteFilter = (item, value) => {
		let arr = filtersArray.slice(0);
		setFiltersArray(arr.filter(el => el.value !== value));
		setActionFiltersArray(2)
	}
	// END OF DELETE FILTER

	// FILTERS APPLICATIONS
	useEffect(()=> {
		if (filtersArray.length == 0) {
			setFilteredApplications(applications);
			return;
		}
		let arr = (actionFiltersArray === 1) ? filteredApplications.slice(0) : applications.slice(0);
		filtersArray.forEach(item => {
			if (item.value == "clinic") {
				arr = arr.filter(el => el.type == "clinic");
				setFilteredApplications(arr);
			}
			if (item.value == "farm") {
				arr = arr.filter(el => el.type == "farm");
				setFilteredApplications(arr);
			}
			if (item.value == "doctor") {
				arr = arr.filter(el => ((el.type == "doctor") || (el.type == "clinicDoctor")));
				setFilteredApplications(arr);
			}
			if (item.value == "accepted") {
				arr = arr.filter(el => el.status == "accepted");
				setFilteredApplications(arr);
			}
			if (item.value == "blocked") {
				arr = arr.filter(el => el.status == "blocked");
				setFilteredApplications(arr);
			}
			if (item.value == "new") {
				arr = arr.filter(el => el.status == "new");
				setFilteredApplications(arr);
			}
		})
	}, [filtersArray, actionFiltersArray])
	// END OF FILTERS APPLICATIONS


	// SEARCH APPLICATION ON INPUT CHANGE
	let searchApplication = (e) => {
		let searchInput = e.target.value;
		let regexp = new RegExp(searchInput.toLowerCase(), "g");
		let arr = applications.slice(0);
		let newArr = [];
		arr.forEach(item => {
			let name = item.name.toLowerCase();
			let firstMatch = Array.from(name.matchAll(regexp))[0];
			if (firstMatch) newArr.push(item);
		});
		setFilteredApplications(newArr);
		// update filter UI items
		let arrFilters = filtersArray.slice(0);
		let result = arrFilters.filter(el => el.value !== "search");
		let searchFilter = {title: "Поиск: " + searchInput, value: "search"}
		if (searchInput !== "") result.push(searchFilter);
		setFiltersArray(result);
	}
	// END OF SEARCH APPLICATION ON INPUT CHANGE
	
		
	// OPEN SEARCH
	let openSearchInput = (e) => {
		e.preventDefault();
		setOpenSearch(!openSearch);
	}
	// END OF OPEN SEARCH

	return (
		<>
		<Navigation page="applications" useAuth={props.useAuth} />
		<div className="Applications">
			<div className="container-fluid">
				<div className="row px-2 py-3 p-md-5">
				{filteredApplications ? <>
					<div className="col-12 mb-5 d-flex align-items-center justify-content-between">
						<h1>Врачи и клиники</h1>
						<div className="d-flex postion-relative align-items-center">
							<Link to="/sellers/new" className="mr-3"><img src={plus} alt="" /></Link>
							<form className="mr-3">
								<input className={`${openSearch ? "open" : ""}`} onChange={(e) => searchApplication(e)} type="text" name="search"/>
								<button className="search" onClick={openSearchInput}><img src={search} alt="" /></button>
							</form>
							<div ref={wrapperRef}>
								<img className="filters-btn" src={filter} alt="" onClick={()=>{!modalOpen ? setModalOpen(true) : setModalOpen(false)}}/>
								<div className="applications-filters" style={(modalOpen) ? {} : {"display": "none"}}>
									<ul>
									{filters.map((item, key) => 
										<li data={item.value} key={key} onClick={(e)=>{addFilter(e); !modalOpen ? setModalOpen(true) : setModalOpen(false)}}>
											<input type="hidden" value={item.value} />
											{item.title}
										</li>
									)}
									</ul>
								</div>
							</div>
						</div>
					</div>

					{filtersArray.length > 0 ?
						<div className="col-12 mb-4 d-flex align-items-center flex-wrap">
							{filtersArray.map((item, key) => 
								<div className="mr-3 mb-3 d-flex align-items-baseline item-filters" key={key}>
									<span>{item.title}</span>
									<img className="ml-2" onClick={(e)=>deleteFilter(e, item.value)} src={cross} alt="" />
								</div>
							)}
						</div>	
					: ""}

					{filteredApplications.map((item, key) => 
						<div className="col-12 pb-4" key={key}>
							<ApplicationCard info={item}/>
						</div>
					)}
				</> : <BigLoadingState text="Загружаем заявки" /> }
				</div>
			</div>
		</div>
	</>
	);
}

export default Applications;