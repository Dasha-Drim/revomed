import { Link } from "react-router-dom";

// styles
import "./ApplicationCard.scss";

let ApplicationCard = (props) => {
	return (
		<div className="ApplicationCard w-100 p-4 d-flex flex-wrap flex-md-nowrap align-items-center justify-content-between position-ralative">
			<div className="d-flex align-items-center">
			{
				props.info.type == "clinic" || props.info.type == "farm" 
				? <div className="avatar clinic flex-shrink-0" style={{"backgroundImage": "url("+props.info.avatar+")", "backgroundPosition": "center", "backgroundSize": "cover"}}></div>
				: <div className="avatar flex-shrink-0" style={{"backgroundImage": "url("+props.info.avatar+")", "backgroundPosition": "center", "backgroundSize": "cover"}}></div>
			}
				<div className="ml-4 info">
					<h2>{props.info.type == "farm" && "ФАРМ"} {props.info.name}</h2>
					{
						props.info.type == "doctor" &&
						<span className="mt-2">{props.info.category}</span>
					}
					{
						props.info.type == "clinic" &&
						<>
						<span className="pr-1 mt-2">{props.info.managerPosition}</span>
						<span>{props.info.managerName}</span>	
						</>		
					}
					{
						props.info.type == "farm" &&
						<>
						<span className="mt-2">{props.info.managerName}</span>	
						</>
					}
					{
						props.info.type == "clinicDoctor" &&
						<>
						<span className="d-block mt-2">{props.info.category}</span>
						<Link to="/editclinic" className="clinicName">{props.info.nameClinic}</Link>	
						</>
					}
				</div>
			</div>
			{
				props.info.type == "clinic" &&
				<Link to={"/editclinic/" + props.info.id} className="main-button mt-4 mt-md-0">Редактировать</Link>
			}
			{
				props.info.type == "farm" &&
				<Link to={"/editfarm/" + props.info.id} className="main-button mt-4 mt-md-0">Редактировать</Link>
			}
			{
				((props.info.type == "doctor") || (props.info.type == "clinicDoctor")) &&
				<Link to={"/editdoctor/" + props.info.id} className="main-button mt-4 mt-md-0">Редактировать</Link>
			}
			{
				props.info.status == "new" &&
				<span className="status new position-absolute">Новый</span>
			}
			{
				props.info.status == "blocked" &&
				<span className="status blocked position-absolute">Заблокирован</span>	
			}
			{
				props.info.status == "accepted" &&
				<span className="status accepted position-absolute">Принят</span>
			}
		</div>
	);
}

export default ApplicationCard;