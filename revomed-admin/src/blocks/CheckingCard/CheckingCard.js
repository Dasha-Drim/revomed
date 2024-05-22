import { Link } from "react-router-dom";
import { DateTime } from "luxon";

// styles
import "./CheckingCard.scss";

let CheckingCard = (props) => {
	return (
		<div className="CheckingCard w-100 p-4 d-flex flex-wrap flex-md-nowrap align-items-center justify-content-between position-ralative">
			<div className="d-flex align-items-center info__holder">
			
				<div className="info">
					<h2 className="mb-1">{props.info.type == "product" && "Продукт."} {props.info.type == "article" && "Статья."} {props.info.type == "banner" && "Баннер."} {props.info.name}</h2>
					<div>
						<span className="d-inline-block mr-3">{props.info.farm}</span>
						<span>{DateTime.fromISO(props.info.date).toFormat("dd.MM.yyyy")}</span>
					</div>
				</div>
			</div>
			{
				props.info.type == "article" &&
				<Link to={"/editarticle/" + props.info.idArticle} className="main-button mt-4 mt-md-0">Модерировать</Link>
			}
			{
				props.info.type == "product" &&
				<Link to={"/editproduct/" + props.info.idProduct} className="main-button mt-4 mt-md-0">Модерировать</Link>
			}
			{
				props.info.type == "banner" &&
				<Link to={"/editbanner/" + props.info.idBanner} className="main-button mt-4 mt-md-0">Модерировать</Link>
			}
			{
				props.info.status == "checking" &&
				<span className="status new position-absolute">Новый</span>
			}
			{
				props.info.status == "rejected" &&
				<span className="status blocked position-absolute">Отклонено</span>	
			}
			{
				props.info.status == "show" &&
				<span className="status accepted position-absolute">Одобрено</span>
			}
		</div>
	);
}

export default CheckingCard;