import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import API from "../../utils/API";

// components
import SearchIcon from "./SearchIcon";
import BigLoadingState from "../../elements/BigLoadingState/BigLoadingState";


import cross from "./cross.svg";

// styles
import './Search.scss';

let Search = (props) => {

	let select = useRef(null);

	const [search, setSearch] = useState(false);
	const [searchStr, setSearchStr] = useState("");
	const [value, setValue] = useState(props.value ? props.value : "");

	const [doctors, setDoctors] = useState(null);
	const [clinics, setClinics] = useState(null);
	const [categories, setCategories] = useState(null);

	// GET SEARCH
	let getSearch = async (data) => {
		let res = await API.get('/search', {params: data});
		return await res.data;
	}
	// END OF GET SEARCH

	let updateInput = (e) => {
		console.log("e", e.target.value);
		setSearch(true);
		setSearchStr(e.target.value);
		setValue(e.target.value);
		let item = {
			page: props.page ? props.page : "home",
			search: e.target.value,
		}
		getSearch(item).then(result => {
			console.log("result", result);
			setDoctors(result.doctors);
			setClinics(result.clinics);
			setCategories(result.categories);
		})
	}

	useEffect(() => {
		setValue(props.value ? props.value : "");
		setSearchStr("");
		console.log("props", props.value)
		
	}, [props.value])

	useEffect(() => {
		if (props.value) {
			let item = {
			page: props.page ? props.page : "home",
			search: props.value,
		}
		getSearch(item).then(result => {
			console.log("result", result);
			setDoctors(result.doctors);
			setClinics(result.clinics);
			setCategories(result.categories);
		})
		}
		
	}, [])
	
	let closePromt = (event) => {
	    // close promt if click outside
		if (select.current && !select.current.contains(event.target)) {
			props.updateState(false); 
			setSearch(false);
		}
	}
    
	useEffect(() => {
    	document.addEventListener('click', closePromt, false);
    	return () => {
      		document.removeEventListener('click', closePromt, false)
    	}
  	}, [])
  	
    useEffect(() => {
        // if search opened and mobile device
        if(search && document.querySelector("body").classList.contains("touch-screen")) {
            window.scrollTo(0, 0);
            document.querySelector("body").classList.add("h-100");
  	        document.querySelector("body").classList.add("overflow-hidden");
        } else {
            document.querySelector("body").classList.remove("h-100");
  	        document.querySelector("body").classList.remove("overflow-hidden");
        }
        // lock scroll if seacrh opened and mobile device
        let scrollListner = (e) => {
            if(search && document.querySelector("body").classList.contains("touch-screen")) {
                e.preventDefault();
                window.scrollTo(0, 0);
            }
        }
    	window.addEventListener('scroll', scrollListner, false);
    	return () => {
      		window.removeEventListener('scroll', scrollListner, false)
    	}
    }, [search])
  	
  	
  	let inputOnClick = (event) => {
  	    props.updateState(true); 
  	    setSearch(true);
  	}
  	
	return (
		<div className="Search w-100">
			<div ref={select} className={`Search__input-holder position-relative ${searchStr === "" && value !== "" && props.value ? "active" : ""}`}>
				<input onClick={inputOnClick} defaultValue={value} value={value} name="search" onChange={(e) => updateInput(e)} placeholder={props.placeholder} autoComplete="new-password" />
				<SearchIcon />
				{searchStr === "" && value !== "" && props.value ? <img className="cross" src={cross} alt="" onClick={() => {setValue("")}} /> : ""}
				{
					search &&
					<div className="Search__results mt-2 mt-sm-0 p-5 text-left">
						{
						value !== ""
						?
						<>
						{
							doctors && clinics && categories 
							?
							categories.length || doctors.length || clinics.length
							?
							<>
							{
								categories.length 
								?
								<>
								<h5>Специализации</h5>
								{categories.map((item, key) =>
									<div className="results__item" key={key}>
									
										<Link onClick={() => {props.updateState(false); setSearch(false)}} to={{pathname: "/catalog", state: {category: item.name, categoryTitle: item.title}}}>{item.title}</Link>
									
									
									</div>
								)}
								</>
								:
								""
							}
							
							{
								doctors.length 
								?
								<>
								<h5>Специалисты</h5>
								{doctors.map((item, key) =>
									<div className="results__item" key={key}>
										<Link onClick={() => props.updateState(false)} to={"/doctor/"+item.idDoctor}>{item.fio}</Link>

									</div>
								)}
								</>
								:
								""
							}

							{
								clinics.length 
								?
								<>
								<h5>Клиники</h5>
								{clinics.map((item, key) =>
									<div className="results__item" key={key}><Link onClick={() => props.updateState(false)} to={"/clinic/"+item.idClinic}>{item.name}</Link></div>
								)}
								</>
								:
								""
							}
							</>
							:
							<div className="load_content d-flex flex-column justify-content-center p-5 text-center">
								<h2 className="smile mb-4">&#128566;</h2>
								<h2 className="header">Ничего не нашли</h2>
								<p>Переформулируйте запрос или поищите что-нибудь другое</p>
								
							</div>
							:
							<div className="load_content d-flex flex-column justify-content-center h-100 text-center">
								<BigLoadingState />
							</div>
						}
						</>
						:
						
						<div className="load_content d-flex flex-column justify-content-center p-5 text-center">
							<h2 className="smile mb-4">&#128512;</h2>
							<h2 className="header">Мы готовы искать</h2>
							<p>Начните вводить поисковый запрос...</p>
							
						</div>
					}
					</div>
				}
			</div>
		</div>
	);
}

export default Search;
