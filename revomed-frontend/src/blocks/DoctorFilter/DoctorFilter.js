import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Thumbs, Navigation } from 'swiper/core';

// components
import NewSelectMini from "../../atoms/NewSelectMini/NewSelectMini";
import MobileFilterModal from "./Modals/MobileFilterModal";

// graphics
import clockIcon from './clockIcon.svg';
import Filter from './Filter.svg';
import filterFunnelIcon from './filterFunnelIcon.svg';
import filterSettingsIcon from './filterSettingsIcon.svg';

// styles
import './DoctorFilter.scss';

// slider init
import 'swiper/swiper.scss';
SwiperCore.use([Thumbs, Navigation]);

let DoctorFilter = (props) => {
	/*
	props.sticky - true or false
	props.filters - filters object from backend
	props.onFiltersChanged - fires on filters change
	*/

	const [currentCategory, setCurrentCategory] = useState(false);
	const [currentDate, setCurrentDate] = useState(false);
	const [currentSort, setCurrentSort] = useState(false);
	const [currentFilter, setCurrentFilter] = useState(false);
	const [filterSpecializations, setFilterSpecializations] = useState([]);
	const [filterDate, setFilterDate] = useState([]);
	const [filterSort, setFilterSort] = useState([]);
	const [filter, setFilter] = useState([]);
	const [filterIsInit, setFilterIsInit] = useState(false);

	// GET DOC SPECIALIZATIONS
	useEffect(() => {
		if(!props.filters) return false;
		setFilterSpecializations(props.filters.categories);
		setFilterDate(props.filters.date);
		setFilterSort(props.filters.sort);
		setFilter(props.filters.filter);
		setCurrentDate(props.filters.date[0].value);
		setCurrentSort(props.filters.sort[0].value);
		setCurrentFilter(props.filters.filter[0].value);
		setFilterIsInit(true);
	}, [props.filters])
	// END OF GET DOC SPECIALIZATIONS


	// MODAL CONTROL
	const [modalIsOpen, setIsOpen] = useState(false);
	let openModal = () => setIsOpen(true);
	let closeModal = () => setIsOpen(false);
	// END OF MODAL CONTROL


	// STICKY FILTER POSITION
	const formElementRef = useRef(null);
	const [isSticky, setSticky] = useState(false);
	let topPosition;
	let handleScroll = () => {
		if (formElementRef.current) {
			if(window.pageYOffset <= topPosition) setSticky(false);
			else setSticky(true);
		}
	};

	useEffect(() => {
		topPosition = formElementRef.current ? formElementRef.current.getBoundingClientRect().top || formElementRef.current.offsetTop : 0;
	}, [formElementRef])

	useEffect(() => {
		if(!props.sticky) return false;
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);
	// END OF STICKY FILTER POSITION


	// FILTER FORM HANDLER
	useEffect(() => {
		if(!filterIsInit) return false;
		let data = {
			date: currentDate,
			filter: currentFilter,
			sort: currentSort,
		};
		props.onFiltersChanged && props.onFiltersChanged(data);
	}, [currentFilter, currentDate, currentSort])
	// END OF FILTER FORM HANDLER

	// <Swiper navigation={{prevEl: '.swiper-button-prev-psychologist1', nextEl: '.swiper-button-next-psychologist1'}} spaceBetween={20} breakpoints={{368: {slidesPerView: 2.2}, 420: {slidesPerView: 2.3}, 480: {slidesPerView: 2.9}, 576: {slidesPerView: 2.9, spaceBetween: 20}, 768: {slidesPerView: 4.5}, 992: {slidesPerView: 5.5}, 1200: {slidesPerView: 6.1}, 1600: {slidesPerView: 5.5}}} slidesPerView={2.2}>

  return (
 
    <div ref={formElementRef} className={`  DoctorFilter d-flex justify-content-between pb-4`}>

      {filterDate.length && filterSort.length && filter.length ?
      	<>
      	<div className="DoctorFilter__parameters w-100">
     <Swiper spaceBetween={20} slidesPerView={'auto'}>
      
      <SwiperSlide>
      	<div className="d-block">
      		<NewSelectMini 
      		name="date"
      		closeOnScroll={true}
      		onChange={(selected) => setCurrentDate(selected.value)}
      		setSelectedVariantByValue={currentDate}
      		decoration={{icon: clockIcon, disableChevron: true}}
      		defaultVariant={0} 
      		variants={filterDate} />
      	</div>
      </SwiperSlide>
      <SwiperSlide>
      	<div className="d-block">
      		<NewSelectMini 
      		name="sort" 
      		position="right"
      		closeOnScroll={true}
      		onChange={(selected) => setCurrentSort(selected.value)} 
      		setSelectedVariantByValue={currentSort}
      		decoration={{icon: filterFunnelIcon, disableChevron: true}} 
      		defaultVariant={0} 
      		variants={filterSort} />
      	</div>
      	</SwiperSlide>
      	<SwiperSlide>
      	<div className="d-block">
      		<NewSelectMini 
      		name="filter"
      		closeOnScroll={true}
      		onChange={(selected) => setCurrentFilter(selected.value)}
      		setSelectedVariantByValue={currentFilter}
      		decoration={{icon: Filter, disableChevron: true}}
      		defaultVariant={0} 
      		variants={filter} />
      	</div>
      	</SwiperSlide>
      </Swiper>
      </div>
      </>
	: ""}
    </div>
    
    
  );
}

export default DoctorFilter;
