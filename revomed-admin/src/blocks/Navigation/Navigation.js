import { Link } from "react-router-dom";

//graphics
import logo from "./logo.svg";
import blogIcon from "./blogIcon.svg";
import blogIconActive from "./blogIconActive.svg";
import personIcon from "./personIcon.svg";
import personIconActive from "./personIconActive.svg";
import reviewIcon from "./reviewIcon.svg";
import reviewIconActive from "./reviewIconActive.svg";
import settingIcon from "./settingIcon.svg";
import settingIconActive from "./settingIconActive.svg";
import patientsIcon from "./patientsIcon.svg";
import patientsIconActive from "./patientsIconActive.svg";
import checkingIcon from "./CheckingIcon.svg";
import checkingIconActive from "./CheckingIconActive.svg";

// styles
import "./Navigation.scss";
/*
props.page
*/
let Navigation = (props) => {
	// AUTH METHOD
	let auth = props.useAuth();
	// END OF AUTH METHOD

	return (
		<div className="Navigation d-flex flex-wrap flex-md-column align-items-center justify-content-between p-4">
			<img src={logo} alt="" />
			<div className="d-flex flex-wrap flex-md-column nav">
				<Link to="/applications"><img src={props.page == "applications" ? personIconActive : personIcon} alt=""/></Link>
				<Link to="/patients"><img src={props.page == "patients" ? patientsIconActive : patientsIcon} alt=""/></Link>
				<Link to="/blog"><img src={props.page == "blog" ? blogIconActive : blogIcon} alt=""/></Link>
				<Link to="/reviews"><img src={props.page == "reviews" ? reviewIconActive : reviewIcon} alt=""/></Link>
				<Link to="/settings"><img src={props.page == "settings" ? settingIconActive : settingIcon} alt=""/></Link>
				<Link to="/checking"><img src={props.page == "checking" ? checkingIconActive : checkingIcon} alt=""/></Link>
			</div>
			<button className="exit" onClick={() => auth.signout(() => {})}>Выйти</button>
		</div>
	);
}

export default Navigation;
