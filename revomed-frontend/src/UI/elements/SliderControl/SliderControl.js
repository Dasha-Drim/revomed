// graphics
import chevronLeftIcon from './chevronLeftIcon.svg';
import chevronRightIcon from './chevronRightIcon.svg';

// styles
import './SliderControl.scss';

let SliderControl = (props) => {
	/*
	props.sliderName
	*/
	
	return (
		<div className="SliderControl d-none d-lg-flex">
			<button className={props.sliderName+"-button-prev d-flex align-items-center justify-content-center mr-3"}><img src={chevronLeftIcon} alt="" /></button>
			<button className={props.sliderName+"-button-next d-flex align-items-center justify-content-center"}><img src={chevronRightIcon} alt="" /></button>
		</div>
	);
}
export default SliderControl;