import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"
import API from "../utils/API";

//components
import Navigation from "../blocks/Navigation/Navigation";
import ApplicationCard from "../blocks/ApplicationCard/ApplicationCard";
import CheckingCard from "../blocks/CheckingCard/CheckingCard";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// graphics
/*import search from "./img/Applications/search.svg";
import filter from "./img/Applications/filter.svg";*/
import cross from "./img/cross.svg";
import plus from "./img/plus.svg";

// styles
import "./Checking.scss";

let Checking = (props) => {

	let [items, setItems] = useState(null)
	let [filter, setFilter] = useState("all")
	let [itemsFiltered, setItemsFiltered] = useState(null)

	// GET CATALOG
	let getCatalog = async (data) => {
		let res = await API.get("/checking", data);
		return await res.data;
	}
	// END OF CATALOG

	
	// ON PAGE LOAD
	useEffect(() => {
		getCatalog().then((result) => {
			setItems(result.items);
			setItemsFiltered(result.items);
		})
	}, [])
	// END OF ON PAGE LOAD

	useEffect(() => {
		if (filter === "all") setItemsFiltered(items);
		else {
			let arr = items.filter(el => (el.status === filter));
			setItemsFiltered(arr);
		}
	}, [filter])
	
	return (
		<>
		<Navigation page="checking" useAuth={props.useAuth} />
		<div className="Checking">
			<div className="container-fluid">
				<div className="row px-2 py-3 p-md-5">
				<div className="col-12 mb-5 d-flex align-items-center justify-content-between">
					<h1>Модерация</h1>
				</div>
				<div className="col-12 mb-5 d-flex align-items-center justify-content-between">
					<div className="d-flex botton-holer">
						<button className={`py-1 px-3 ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Все</button>
						<button className={`py-1 px-3 ${filter === "checking" ? "active" : ""}`} onClick={() => setFilter("checking")}>Новые</button>
						<button className={`py-1 px-3 ${filter === "rejected" ? "active" : ""}`} onClick={() => setFilter("rejected")}>Отклонено</button>
						<button className={`py-1 px-3 ${filter === "show" ? "active" : ""}`} onClick={() => setFilter("show")}>Одобрено</button>
					</div>
				</div>
				{itemsFiltered && itemsFiltered.map((item, key) => 
						<div className="col-12 pb-4" key={key}>
							<CheckingCard info={item}/>
						</div>
					)}
				</div>
			</div>
		</div>
	</>
	);
}

export default Checking;