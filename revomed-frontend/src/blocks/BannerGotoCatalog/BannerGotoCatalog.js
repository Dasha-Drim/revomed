import { Link } from "react-router-dom";

// styles
import './BannerGotoCatalog.scss';

let BannerGotoCatalog = () => {
  return (
    <div className="BannerGotoCatalog py-6 px-4 px-sm-5 d-flex justify-content-md-between justify-content-center text-md-left text-center align-items-center flex-wrap mx-4 mx-sm-0">
		<div className="mb-4 mb-md-0 py-md-2">
			<h3>Поможем решить вашу проблему!</h3>
			<p className="pt-1 mb-0">Онлайн телемедицина с проверенными врачами</p>
		</div>
		<Link to="/catalog" className="m-btn px-5">Перейти в каталог врачей</Link>
    </div> 
  );
}

export default BannerGotoCatalog;
