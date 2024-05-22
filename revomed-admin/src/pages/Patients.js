import { useState, useEffect } from "react";
import API from "../utils/API";
import { Link } from "react-router-dom";

//components
import Navigation from "../blocks/Navigation/Navigation";
//import PatientsCard from "../blocks/PatientsCard/PatientsCard";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// styles
import "./Patients.scss";

let Patients = (props) => {
	const [patients, setPatients] = useState(null);
	const [count, setCount] = useState(0);
	
	// ON PAGE LOAD
	useEffect(()=> {
		let getPatients = async (data) => {
			let res = await API.get("/clients", data);
			return await res.data;
		}
		getPatients().then((result) => {
			setPatients(result.patients);
			setCount(result.count)
		})
	}, [])
	// END OF ON PAGE LOAD

	return (
		<>
			<Navigation page="patients" useAuth={props.useAuth} />
			<div className="Patients">
				<div className="container-fluid">
					<div className="row px-2 py-3 p-md-5">
					{patients ? <>
						<div className="col-12 mb-5">
							<h1>Пациенты</h1>
						</div>
						<div className="col-12 col-lg-6 col-xl-3 mb-4 Patients__count p-5 d-flex flex-wrap justify-content-center align-items-center text-center">
							<h2 className="d-block w-100">{count}</h2>
							<span>Общее количество</span>
						</div>
						<div className="col-12 Patients__container py-4">
							<div className="row px-4 pt-2 pb-3">
								<div className="col-4 col-sm-3">
									<h3 className="m-0">Имя</h3>
								</div>
								<div className="col-4 col-sm-3">
									<h3 className="m-0">Номер телефона</h3>
								</div>
								<div className="col-4 col-sm-3">
									<h3 className="m-0">Дата рождения</h3>
								</div>
								<div className="col-4 col-sm-3 d-none d-sm-block">
									<h3 className="m-0">Пол</h3>
								</div>
							</div>
							{patients.map((item, key) => 
								<div className="row px-4 py-2 my-1" key={key}>
									<div className="col-4 col-sm-3">
										<span>{item.name}</span>
									</div>
									<div className="col-4 col-sm-3">
										<span>{item.phone}</span>
									</div>
									<div className="col-4 col-sm-3">
										<span>{!item.dateBirth ? "-" : item.dateBirth}</span>
									</div>
									<div className="col-4 col-sm-3 d-none d-sm-block">
										<span>{item.sex}</span>
									</div>
								</div>
							)}
						</div>
						</> : <BigLoadingState  text="Загружаем пациентов"/>}
					</div>
				</div>
			</div>
		</>
	);
}

export default Patients;

/*

*/