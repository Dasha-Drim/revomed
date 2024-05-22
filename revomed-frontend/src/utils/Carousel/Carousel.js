import { useState, useEffect, useRef } from "react";
import './Carousel.scss';

let Carousel = (props) => {
	/* 
	props.onCarousel - returns a set of functions for working with the carousel
	props.onSlideChange - event will fired on active index change
	props.spaceBetween - offset between slides
	props.slidesOffsetAfter - offset after slides
	props.className - additional className for container
	*/

	//refs
	let container = useRef(null);
	let inner = useRef(null);

	let moveFromX = 0;
	let currentOffset = 0;
	let thisScrollOffset = 0;
	let [currentSlideIndex, setCurrentSlideIndex] = useState(0);
	let isMoved = false;
	let isTouchScreen;

	// forming onCarousel
	useEffect(() => {
		props.onCarousel({
			slideTo: (slideIndex) => {
				setCurrentSlideIndex(slideIndex);
				scrollTo(slideIndex);
			}
		});
	}, [])

	// update current slide's className and fire onSlideChange
	useEffect(() => {
		inner.current.querySelectorAll('.Carousel-slide').forEach((item, key) => {
			if(key === currentSlideIndex) item.classList.add('Carousel-slide-active');
			else item.classList.remove('Carousel-slide-active');
		})
		try {
			if(props.onSlideChange) props.onSlideChange(currentSlideIndex);
		} catch{};
		
	}, [currentSlideIndex])

	// go next slide
	let goNext = () => {
		setCurrentSlideIndex(actualCount => {
			if(actualCount !== inner.current.querySelectorAll('.Carousel-slide').length-1) {
				scrollTo(actualCount + 1); 
				return (actualCount + 1)
			} else return (actualCount);
		});
	}

	// go previous slide
	let goPrev = () => {
		setCurrentSlideIndex(actualCount => {
			if(actualCount !== 0) {
				scrollTo(actualCount - 1); 
				return (actualCount - 1)
			} else return (actualCount);
		});
	}

	// private | onSlideClick event
	let onSlideClick = (key) => {
		if(!isMoved) {
	        setCurrentSlideIndex(key);
	        scrollTo(key);
		}
		isMoved = false;
	}

	// private | scrollTo slide function
	let scrollTo = (index) => {
		let slidesBeforeWidth = getSlidesBeforeIndexWidth(index);
		let slidesWidth = getSlidesWidth();
		let containerWidth = getContainerWidth();

		thisScrollOffset = slidesBeforeWidth >= slidesWidth-containerWidth ? -(slidesWidth-containerWidth) : -slidesBeforeWidth;

		inner.current.style.transform = "translate3d(" + thisScrollOffset + "px, 0px, 0px)";
		inner.current.style.transitionDuration = ".3s";
		currentOffset = thisScrollOffset;
	}

	// private | onMouseMove event
	let onMouseMove = (event) => {
		isMoved = true;
		let moveToXTouch = event.targetTouches ? event.targetTouches[0].pageX - inner.current.offsetLeft : 0;
		let moveToX = Math.round(event.layerX || moveToXTouch);
		moveAt(moveFromX, moveToX);
	}

	// private | moveAt function
	let moveAt = (moveFromX, moveToX) => {
		thisScrollOffset = currentOffset - (moveFromX - moveToX);
		let slidesWidth = getSlidesWidth();
		let containerWidth = getContainerWidth();

		if (thisScrollOffset >= 0) thisScrollOffset = 0;
  		if(-thisScrollOffset >= slidesWidth-containerWidth) {
			thisScrollOffset = -(slidesWidth-containerWidth);
		}

		inner.current.style.transitionDuration = "0s";
		inner.current.style.transform = "translate3d(" + thisScrollOffset + "px, 0px, 0px)";
	}

	// private | get width of carousel container
	let getContainerWidth = () => {
		return inner.current.getBoundingClientRect().width;
	}

	// private | get full width of slides
	let getSlidesWidth = () => {
		let width = 0;
		inner.current.querySelectorAll('.Carousel-slide').forEach(item => {
			width += item.getBoundingClientRect().width;
		})
		if(props.spaceBetween) width += (inner.current.querySelectorAll('.Carousel-slide').length-1)*props.spaceBetween;
		if(props.slidesOffsetAfter) width += props.slidesOffsetAfter;
		return width;
	}

	// private | get full width of slides before current slide (by index)
	let getSlidesBeforeIndexWidth = (index) => {
		let width = 0;
		inner.current.querySelectorAll('.Carousel-slide').forEach((item, key) => {
			if(key < index) {
				width += item.getBoundingClientRect().width;
				if(props.spaceBetween) width += props.spaceBetween;
			}
		})
		return width;
	}

	// private | endScroll function
	let endScroll = () => {
		currentOffset = thisScrollOffset;
		inner.current.removeEventListener('mousemove', onMouseMove);
		inner.current.removeEventListener('mouseup', endScroll);
		inner.current.removeEventListener('mouseleave', endScroll);
		inner.current.removeEventListener('touchmove', onMouseMove);
		inner.current.removeEventListener('touchend', endScroll);
		if(isTouchScreen) isMoved = false;
	}

	// private | on carousel init
	useEffect(() => {
		inner.current.onmousedown = (event) => {
			isTouchScreen = false;
			moveFromX = Math.round(event.layerX);

		 	inner.current.addEventListener('mousemove', onMouseMove)
			inner.current.addEventListener('mouseup', endScroll);
		 	inner.current.addEventListener('mouseleave', endScroll);
		}
		let touchstart = (event) => {
			isTouchScreen = true;
			moveFromX = Math.round(event.targetTouches[0].pageX - inner.current.offsetLeft);

			inner.current.addEventListener("touchmove", onMouseMove);
			inner.current.addEventListener('touchend', endScroll);
		}
		inner.current.addEventListener('touchstart', touchstart, {passive: true});


	 	inner.current.querySelectorAll('.Carousel-slide').forEach((item, key) => {
	 		item.onclick = () => onSlideClick(key);
	 	})

	 	if(container.current.querySelector('.Carousel-button-next')) container.current.querySelector('.Carousel-button-next').addEventListener('click', goNext);
	 	if(container.current.querySelector('.Carousel-button-prev')) container.current.querySelector('.Carousel-button-prev').addEventListener('click', goPrev);


	 	if(props.spaceBetween && inner.current.querySelectorAll('.Carousel-slide').length) {
		 	inner.current.querySelectorAll('.Carousel-slide').forEach((item, key) => {
				if(key !== inner.current.querySelectorAll('.Carousel-slide').length-1) item.style.marginRight = props.spaceBetween+"px";
			})
		}

		if(props.slidesOffsetAfter && inner.current.querySelectorAll('.Carousel-slide').length) {
			inner.current.querySelectorAll('.Carousel-slide')[inner.current.querySelectorAll('.Carousel-slide').length-1].style.marginRight = props.slidesOffsetAfter+"px";
		}
	}, [])

	return (
		<div ref={container} className={"Carousel " + props.className}>
		{[props.children].flat().map((item, key) => {
			return (
				item.type === "slides" ? 
				<div ref={inner} key={key} className="Carousel-inner">
					{item.props.children.map((slide, key) =>
						<div key={item.props.children.length-1 + key} className="Carousel-slide">{slide}</div>
					)}
				</div>
				: item.type === "next" ? 
					<div key={key} className={"Carousel-button-next"}>{item.props.children}</div>
				: item.type === "prev" ?
					<div key={key} className={"Carousel-button-prev"}>{item.props.children}</div>
				: ""
			)
		})}
		</div>
	);
}

export default Carousel;
