// graphics
import starFilledIcon from './starFilledIcon.svg';
import starStrokedIcon from './starStrokedIcon.svg';

// styles
import './Rating.scss';

let Rating = (props) => {
	/*
	props.rating
	props.styleClassString - html class string
	*/

  return (
    <div className={`Rating d-flex align-items-center ${!props.styleClassString ? 'p-3' : props.styleClassString}`}>
			<img src={+props.rating >= 1 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
			<img src={+props.rating >= 1.5 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
			<img src={+props.rating >= 2.5 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
			<img src={+props.rating >= 3.5 ? starFilledIcon : starStrokedIcon} className="mr-1" alt="" />
			<img src={+props.rating >= 4.5 ? starFilledIcon : starStrokedIcon} alt="" />
			<span className="pl-3">{props.rating}</span>
    </div> 
  );
}

export default Rating;
