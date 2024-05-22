import { Link } from "react-router-dom";

// graphics
import regHeaderPersonPhoto from './regHeaderPersonPhoto.png';

// styles
import './RegistrationSellersPageHeader.scss';

let RegistrationSellersPageHeader = (props) => {
	/*
	props.active - "doc" || "clinic"
	*/
	
	return (
		<div className="RegistrationSellersPageHeader py-7">
			<div className="container">
				<div className="row justify-content-center justify-content-md-between">
					<div className="col-8 col-md-5">
						<h2>Регистрация</h2>
						<span>Выберите в качестве кого Вы регистрируетесь</span>
						<div className="user-type-choice d-flex mt-5">
							<Link to="/reg/doc" className={`px-5 d-inline-block mr-3 ${props.active === "doc" ? "active" : ""}`}>Врач<span className="d-none d-sm-inline"> / Консультант частной практики</span></Link>
							<Link to="/reg/clinic" className={`px-5 d-inline-block ${props.active === "clinic" ? "active" : ""}`}>Клиника</Link>
						</div>
					</div>
					<div className="RegistrationSellersPageHeader__image d-none d-md-block col-md-3">
						<img src={regHeaderPersonPhoto} alt="" />
					</div>
				</div>
			</div>
		</div> 
		);
}

export default RegistrationSellersPageHeader;
