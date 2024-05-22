import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../utils/API";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Navigation } from "swiper";
import { DateTime } from 'luxon';

// components
import SliderControl from "../UI/elements/SliderControl/SliderControl";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";
import EmptyState from "../elements/EmptyState/EmptyState";
import banner from './img/banner.jpg';
import product from './img/product.jpg';
import back from './img/back.svg';

// styles
import './Subcategory.scss';
// slider init
import 'swiper/swiper.scss';
SwiperCore.use([ Navigation]);

let Subcategory = (props) => {
    let [subcategory, setSubcategory] = useState(null)

    let getSubcategory = async () => {
      let res = await API.get('/subcategories/'+props.match.params.url);
      return await res.data;
  }

  useEffect(() => {

    getSubcategory().then((result) => {
      console.log("result", result)
      setSubcategory(result.subcategory);
    });
  }, [])

    return (
      <div className="Subcategory">

      <div className="container py-7">
      {subcategory ? 
        <>
        <div className="row goto-previous-page py-7 d-none d-sm-block">
              <div className="col-auto goto-previous-page__button-holder">
                <Link to={{pathname: "/lk", state: {section: "helpful"}}} className="ui-r-secondary-button px-4 d-inline-flex align-items-center"><img src={back} className="mr-3" alt="back" />Вернуться назад</Link>
              </div>
            </div>
          <div className="row pb-7">
            <div className="col-8">
              <h1>{subcategory.name}</h1>
              <span>Полезный контент</span>
            </div>
          </div>
          {subcategory.banners.length ?
            <div className="row pb-7 banners">
              <div className="col-8">
                <Swiper className="Banners__carousel" spaceBetween={15} loop={subcategory.banners.length > 3 ? true : false} autoplay={{delay: 3000, pauseOnMouseEnter: true, disableOnInteraction: false}} modules={[Autoplay]} slidesPerView={1.1} breakpoints={{450: {slidesPerView: 1.3}, 576: {slidesPerView: 1.5}, 768: {slidesPerView: 2}, 992: {slidesPerView: 2.5}}} >
                  {subcategory.banners.map((item, key) =>
                    <SwiperSlide key={key}>
                      <a href={item.link} target="_blank" className="image" style={{"backgroundColor": "#E9EAFE", "backgroundImage": "url("+item.photo+")", "backgroundSize": "cover", "backgroundPosition": "center"}}></a>
                    </SwiperSlide>
                  )}
                </Swiper>
              </div>
            </div>
          : ""}
          {subcategory.articles.length ?
            <div className="row pb-7 pt-5 articles">
              <div className="col-8">
                <h2>Статьи по теме</h2>
              </div>
              {subcategory.articles.map((item, index) => 
                <Link to={"/lk/article/"+item.id} key={index} className="col-8 col-md-4 article-item-col mb-4">
                  <div className="article-item">
                    <div className="article-item__photo-preview" style={{"backgroundColor": "#272848", "backgroundImage": "url("+item.photo+")", "backgroundSize": "cover", "backgroundPosition": "center"}}>
                      <div className="article-item__info mb-xl-3 mb-2">
                        <span>{item.author}</span>
                        <span>{DateTime.fromISO(item.date, {zone: 'local'}).setLocale('ru').toFormat('dd MMMM yyyy')}</span>
                      </div>
                      <div className="position-absolute overlay"></div>
                    </div>
                    <div className="article-item__content p-5">
                      <h2 className="article-item__heading">{item.title}</h2>
                      <p>{item.description}</p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          : ""}
          {subcategory.products.length ?
            <div className="row pb-7 pt-5 products">
              <div className="col-8 d-flex justify-content-between align-items-center mb-4">
                <h2>Полезная аптечка</h2>
                <SliderControl sliderName="SliderProducts" />
              </div>
               <div className="col-8">
              <Swiper className="SliderProducts__carousel" spaceBetween={15} navigation={{prevEl: '.SliderProducts-button-prev', nextEl: '.SliderProducts-button-next'}} modules={[Navigation]} slidesPerView={1.2} breakpoints={{450: {slidesPerView: 1.6}, 576: {slidesPerView: 2.2}, 768: {slidesPerView: 3}, 992: {slidesPerView: 3.5}, 1200: {slidesPerView: 4}}} >
              {subcategory.products.map((item, key) =>
                <SwiperSlide key={key}>
                  <Link to={"/lk/product/"+item.id}>
                    <div className="photo__holder position-relative">
                      <div className="image" style={{"backgroundColor": "#E9EAFE", "backgroundImage": "url("+item.photo+")", "backgroundSize": "cover", "backgroundPosition": "center"}}></div>
                    </div>
                    <div className="p-5 name__holder">
                      <h2>{item.name}</h2>
                    </div>
                  </Link>
                </SwiperSlide>
              )}
              </Swiper>
              </div>
            </div>
          : ""}

          {
            !subcategory.products.length && !subcategory.articles.length && !subcategory.banners.length ?
            <EmptyState text="Здесь пока нет информации" />
            : ""
          }
          </>
          : <div className="pt-7"><BigLoadingState text="Загружаем данные" /></div>}
        </div>
    </div>
    );
}

export default Subcategory;