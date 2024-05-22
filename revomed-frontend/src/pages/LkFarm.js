import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../utils/API";
import { Swiper, SwiperSlide } from 'swiper/react';
// components


// graphics
import pencilEditIcon from './img/LkUser/pencilEditIcon.svg';

// styles
import './LkFarm.scss';
// slider init
import 'swiper/swiper.scss';

let LkFarm = (props) => {

  // AUTH METHOD
  let auth = props.useAuth();
  // END OF AUTH METHOD

  useEffect(() => {
    console.log("props.userInfo", props.userInfo);
  }, [])

  return (
    <div className="LkFarm">

    	<div className="container py-7">
      	<div className="row pb-7">
      		<div className="col-8 d-flex flex-wrap justify-content-between align-items-start">
            <div className="d-flex flex-column align-content-center mb-5">
        			<h1 className="LkFarm__name">{props.userInfo.managerFio}</h1>
              <span>{"Фармакологическая компания “"+ props.userInfo.name +"”"}</span>
        			<div className="mt-4">
        				<Link to="/lk/edit" className="edit-button mb-4 mb-sm-0 mr-sm-4 d-block d-sm-inline-block"><img src={pencilEditIcon} className="mr-2" alt="" /> Редактировать профиль</Link>
        			</div>
            </div>
      		</div>
      	</div>

          <div className="row pb-7 modules">
            <div className="col-8 mb-4">
              <h2 className="modules-heading mb-0">Возможности</h2>
            </div>
            <Swiper className="reviews-carousel m-0 w-100" slidesPerView={'auto'} breakpoints={{768: {slidesPerView: 2}}}>
              <SwiperSlide className="col-8 col-sm-4 col-lg-3 mb-3">
                <div className="modules-item p-4">
                  <h3 className="mb-1">Баннеры</h3>
                  <p className="mb-4">Добавьте рекламные баннеры</p>
                  <Link to="/lk/banners">Управление баннерами</Link>
                </div>
              </SwiperSlide>

              <SwiperSlide className="col-8 col-sm-4 col-lg-3 mb-3">
                <div className="modules-item p-4">
                  <h3 className="mb-1">Статьи</h3>
                  <p className="mb-4">Привлекайте внимание пациентов статьями в блоге</p>
                  <Link to="/lk/articles">Управление статьями</Link>
                </div>
              </SwiperSlide>

              <SwiperSlide className="col-8 col-sm-4 col-lg-3 mb-3">
                <div className="modules-item p-4">
                  <h3 className="mb-1">Продукция</h3>
                  <p className="mb-4">Расскажите пациентам о продукции</p>
                  <Link to="/lk/products">Управление продукцией</Link>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>


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

export default LkFarm;
