import LazyLoad from 'react-lazy-load';
import { browserName, browserVersion, osVersion, osName } from 'react-device-detect';
// styles
import './ClinicCard.scss';

let ClinicCard = (props) => {
	/*
	props.clinicData
	*/

  return (
  	<div className="ClinicCard d-lg-flex justify-content-between p-6">
    {props.clinicData ? <>
      <div className="ClinicCard__content">
      	<div className="clinic-profile-info d-md-flex">
      		<LazyLoad><div className="clinic-profile-info__avatar m-auto m-md-0 flex-shrink-0" style={{"background": (browserName === "Safari" && +browserVersion < 15) ? "url("+props.clinicData.logo+")" : "url("+props.clinicData.logoWebp+")", "backgroundPosition": "center", "backgroundSize": "cover"}}></div></LazyLoad>
      		<div className="clinic-profile-info__main pl-md-5">
      			<h2 className="d-flex justify-content-center justify-content-md-start mt-4 mt-md-0">
      				<a href={"/clinic/"+props.clinicData.id} className="clinic-profile-info__name">{props.clinicData.name}</a>
      			</h2>
      			<div className="clinic-profile-info__facts mt-3 text-center text-md-left">
      				<span className="pr-4">Клиника</span>
      				<span>{props.clinicData.country}, {props.clinicData.city}</span>
      			</div>
      			<div className="clinic-profile-info__description mt-5 mt-md-4">
      				<p>{props.clinicData.description.slice(0, 255)}...</p>
      			</div>
      		</div>

      	</div>
      	<div className="indicators d-flex align-items-center mt-3 justify-content-center justify-content-md-start">
					<div className="indicators__info d-none d-md-block">
						<span>Всего специалистов: {props.clinicData.doctorsTotal}</span>
						<span>Всего отзывов: {props.clinicData.reviewsTotal}</span>
					</div>
      	</div>
    	</div>
      <div className="ClinicCard__specializations d-flex flex-wrap align-items-start flex-shrink-0 align-content-start mt-5 mt-lg-0 pl-lg-5 pb-3 pb-lg-0">
      	{props.clinicData.directions && props.clinicData.directions.map(item => 
          <span className="specializations-item">{item}</span>
        )}
      </div>
      </> : "" }
    </div>
  );
}

export default ClinicCard;
