import { Redirect } from "react-router-dom";
import { useState, useEffect, useRef  } from "react";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";

//components
import Input from "../atoms/Input/Input";

import './Auth.scss';

let Auth = (props) => {
	const authAdminForm = useRef(null);
	let auth = props.useAuth();
	let [userIsLoggedIn, setUserIsLoggedIn] = useState(auth.isAdmin);
	let postAuthAdmin = async (data) => {
		let res = await API.post('/auth/admins', data);
		return await res.data;
	}	  
	let authAdminFormHandler = (e) => {
		e.preventDefault();
		let postData = new FormData(authAdminForm.current);
		postAuthAdmin(postData).then((result) => {
			if(result.success) auth.signin(() => setUserIsLoggedIn(true));
		})
	}

	return (
		<div className="Auth">
			<div className="container-fluid">
				<div className="row px-2 py-3 p-md-5 justify-content-center">
					<form onSubmit={authAdminFormHandler} ref={authAdminForm} className="col-12 col-sm-8 col-md-8 col-lg-6 col-xl-4 p-4">
						<h1 className="mb-4">Вход</h1>
						<div className="mb-4 w-100">
							<Input name="login" label="Логин"/>
						</div>
						<div className="mb-4 w-100">
							<Input name="password" type="password" label="Пароль"/>
						</div>
						<button type="submit" className="secondary-button">Войти</button>
					</form>
				</div>
			</div>

			{userIsLoggedIn ? <Redirect to="/applications" /> : ""}
		</div>
	);
}

export default Auth;