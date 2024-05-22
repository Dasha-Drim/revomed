import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../utils/API";
import ContentModal from "../utils/ContentModal/ContentModal";
import ENVIRONMENT from "../utils/ENVIRONMENT";

// components
import UIClinicConsultationsPrice from "../UI/Clinic/ConsultationsPrice/UIClinicConsultationsPrice";
import UIClinicTimetable from "../UI/Clinic/Timetable/UIClinicTimetable";
import UIClinicHistory from "../UI/Clinic/History/UIClinicHistory";
import UIUsefulTips from "../UI/blocks/UIUsefulTips/UIUsefulTips";

// graphics
import pencilEditIcon from './img/LkUser/pencilEditIcon.svg';
import plusAddIcon from './img/LkUser/plusAddIcon.svg';
import copyIcon from './img/LkUser/copyIcon.svg';
import successfullyCopiedIcon from './img/LkUser/successfullyCopiedIcon.svg';
import prompt from './img/LkClinic/prompt.svg';

// styles
import './LkClinic.scss';

let LkClinic = (props) => {
  const [isCopied, setIsCopied] = useState(false);
  const [promtOpen, setPromtOpen] = useState(false);
  const [activeOffline, setactiveOffline] = useState(props.userInfo.offline);

  const [activeModules, setActiveModules] = useState(false);
  const [modules, setModules] = useState(props.userInfo.modules);

  // AUTH METHOD
  let auth = props.useAuth();
  // END OF AUTH METHOD


  // ADDING A NEW DOCTOR
  const [contentModalIsOpen, setContentModalIsOpen] = useState(false);
  const [contentModalHeader] = useState("Добавить нового врача");
  // END OF ADDING A NEW DOCTOR

  let promtOpenRef = useRef(null)

  let closePrompt = () => {
    setPromtOpen(false)
  }
  let listener = event => {
    // operators list
    if (promtOpenRef.current && !promtOpenRef.current.contains(event.target)) {
      closePrompt();
    }
  };

  useEffect(() => {
    console.log("props.userInfo", props.userInfo);
    for (let key in modules) {
      if (modules[key] === true) return setActiveModules(true);
    }
    document.addEventListener('click', listener, false);
    return () => {
      document.removeEventListener('click', listener, false);
    }

  }, [])
  // Close Dropdown When Click Outside
  
  // COPY TEXT TO CLIPBOARD
  let copyTextToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1000)
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }
  // END OF COPY TEXT TO CLIPBOARD

  let updateInfoClinic = async (data) => {
    let res = await API.put('/clinics', data);
    return await res.data;
  }
  let updateInfoClinicRequest = (offline) => {
    //e.preventDefault();
    //postFavorites({offline: offline}).then((result) => result.success ?setDoctorIsAddedToFavourites(result.isInFavoritesNow) : null);
    if (activeOffline && offline) return;
    if (!activeOffline && !offline) return;
    updateInfoClinic({offline: offline}).then((result) => result.success ? console.log("success") : null);
  }

  return (
    <div className="LkClinic">

    	<div className="container py-7">
      	<div className="row pb-7">
      		<div className="col-8 d-flex flex-wrap justify-content-between align-items-start">
            <div className="d-flex flex-column align-content-center mb-5">
        			<h1 className="LkDoc__name">{props.userInfo.managerName}</h1>
              <span>Клиника "{props.userInfo.name}". Всего врачей: {props.userInfo.totalDoctors}</span>
        			<div className="mt-4">
        				<Link to="/lk/edit" className="edit-button mb-4 mb-sm-0 mr-sm-4 d-block d-sm-inline-block"><img src={pencilEditIcon} className="mr-2" alt="" /> Редактировать профиль</Link>
        				<button onClick={() => setContentModalIsOpen(true)} className="edit-button d-block d-sm-inline-block"><img src={plusAddIcon} className="mr-2" alt="" /> Добавить нового врача</button>
        			</div>
            </div>
            <div className="LkClinic_offline-btns p-4">
              <span className="d-flex">Очные консультации<div className="prompt ml-3" ref={promtOpenRef} onClick={() => {setPromtOpen(true)}}><img src={prompt} alt="" /><div className={`${promtOpen ? "d-block" : "d-none"} prompt__info position-absolute p-4`}><p>При включении, не забудьте указать адрес(а) клиники в разделе “Редактирование профиля”, и всем врачам, принимающим очно, заполнить адрес в блоке “Управление сотрудниками”</p></div></div></span>
              <div className="offline-btns__container mt-3">
                <button className={`${activeOffline ? "active" : ""}`} onClick={() => {setactiveOffline(true); updateInfoClinicRequest(true)}}>Включено</button>
                <button className={`${!activeOffline ? "active" : ""}`} onClick={() => {setactiveOffline(false); updateInfoClinicRequest(false)}}>Выключено</button>
              </div>
            </div>
      		</div>
      	</div>

        <div className="row pb-7">
          <div className="col-8">
            <UIUsefulTips userType="clinic" userId={props.userId} />
          </div>
        </div>

      	<div className="row pb-7">
					<div className="col-8">
						<UIClinicTimetable userId={props.userId} offline={activeOffline}/>
      		</div>
      	</div>

      	<div className="row pb-7">
			<div className="col-8">
				<UIClinicConsultationsPrice userId={props.userId} offline={activeOffline}/>
      		</div>
      	</div>

      	<div className="row pb-7">
			    <div className="col-8">
				    <UIClinicHistory />
      	  </div>
      	</div>

        {activeModules &&
          <div className="row pb-7 modules">
            <div className="col-8 mb-4">
              <h2 className="modules-heading mb-0">Модули</h2>
            </div>
            {
              modules.checkups &&
              <div className={`col-8 col-sm-4 col-lg-3 mb-3 ${modules.checkups && modules.promo ? "mb-3" : ""}`}>
                <div className="modules-item p-4">
                  <h3 className="mb-1">Чекапы</h3>
                  <p className="mb-4">Предложите пациентам комплексные обследования</p>
                  <Link to="/lk/checkup">Управление чекапами</Link>
                </div>
              </div>
            }
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

      <ContentModal customOverlayClass="LkClinicAddDoctor-overlay" contentClassName="LkClinicAddDoctor-modal" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => setContentModalIsOpen(state)} modalHeader={contentModalHeader}>
        <p className="mb-4">Ссылка для регистрации нового врача. Не выкладывайте её в публичный доступ.</p>
        <div className="copy-input-holder">
          <input className="copy-input-holder__input" value={ENVIRONMENT.frontendURL + "/reg/doc/" + props.userInfo.link} readOnly/>
          <button className="copy-input-holder__button" onClick={() => copyTextToClipboard(ENVIRONMENT.frontendURL + "/reg/doc/" + props.userInfo.link)}>
            <img src={!isCopied ? copyIcon : successfullyCopiedIcon} alt="" />
          </button>
        </div>
      </ContentModal>

    </div> 
  );
}

export default LkClinic;
