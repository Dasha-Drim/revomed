import { Link } from "react-router-dom";

//graphics
import "./NoMatch.scss";

let NoMatch = () => {
	return (
		<div className="NoMatch">
			<div className="container py-7">
				<div className="row py-7">
					<div className="col-8 text-center">
						<h1>404: Ничего не найдено...</h1>
						<p>Похоже, вы заблудились. Такой страницы не существует.</p>
						<Link to="/" className="ui-r-main-button d-inline-block px-6 mt-4">На главную</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default NoMatch;