import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// components
import UIDocConsultations from "../UI/Doc/Consultations/UIDocConsultations";
import UIDocConsultationsPrice from "../UI/Doc/ConsultationsPrice/UIDocConsultationsPrice";
import UIDocTimetable from "../UI/Doc/Timetable/UIDocTimetable";
import UIDocReviews from "../UI/Doc/Reviews/UIDocReviews";
import UIUsefulTips from "../UI/blocks/UIUsefulTips/UIUsefulTips";

// graphics
import pencilEditIcon from './img/LkUser/pencilEditIcon.svg';

// styles
import './LkDoc.scss';

let LkDoc = (props) => {

  // AUTH METHOD
  let auth = props.useAuth();
  // END OF AUTH METHOD

   const [activeModules, setActiveModules] = useState(false);
  const [modules, setModules] = useState(props.userInfo.modules);

  useEffect(() => {
    console.log("props.userInfo", props.userInfo);
    for (let key in modules) {
      if (modules[key] === true) return setActiveModules(true);
    }
  }, [])

  return (
    <div className="LkDoc">

    	<div className="container py-7">
      	<div className="row align-items-center align-content-center pb-7">
      		<div className="col-8 col-lg-4 d-lg-flex justify-content-lg-start text-center text-lg-left mb-7 mb-lg-0">
      			<img className="LkDoc__avatar" src={props.userInfo.avatar} alt="" />
      			<div className="ml-lg-5 mt-5 mt-lg-0">
      				<h1 className="LkDoc__name w-100 mb-4">{props.userInfo.name}</h1>
      				<Link to="/lk/edit" className="edit-button"><img src={pencilEditIcon} className="mr-2" alt="" /> Редактировать профиль</Link>
      			</div>
      		</div>
      		<div className="col-8 col-lg-4">
      			<UIDocConsultations />
      		</div>
      	</div>

        <div className="row pb-7">
          <div className="col-8">
            <UIUsefulTips userType={props.userType} userId={props.userId} />
          </div>
        </div>

      	<div className="row pb-7">
					<div className="col-8">
						<UIDocTimetable userId={props.userId} />
      		</div>
      	</div>

        {props.userType === "doctor" ?
      	<div className="row pb-7">
					<div className="col-8">
						<UIDocConsultationsPrice />
      		</div>
      	</div>
        : "" }

      	<div className="row pb-7">
					<div className="col-8">
						<UIDocReviews />
      		</div>
      	</div>

        {activeModules &&
          <div className="row pb-7 modules">
            <div className="col-8 mb-4">
              <h2 className="modules-heading mb-0">Модули</h2>
            </div>
            {
              modules.promo &&
              <div className="col-8 col-sm-4 col-lg-3">
                <div className="modules-item p-4">
                  <h3 className="mb-1">Промоакции</h3>
                  <p className="mb-4">Управляйте акциями и программами лояльности</p>
                  <Link to="/lk/promo">Управление промоакциями</Link>
                </div>
              </div>
            }
            
          </div>
      }

      	<div className="row pb-7">
					<div className="col-8">
						<div className="exit">
							<button className="ui-secondary-button w-100 py-4" onClick={() => auth.signout(() => {})}>Выйти из аккаунта</button>
						</div>
					</div>
				</div>

     
      </div>

    </div> 
  );
}

export default LkDoc;
