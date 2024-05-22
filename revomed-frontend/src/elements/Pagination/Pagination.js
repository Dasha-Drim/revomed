import { useState, useEffect } from "react";

// styles
import './Pagination.scss';

let Pagination = (props) => {
	/*
	props.currentPage
	props.onUpdatePage
	*/
	const [currentPageIndex, setCurrentPageIndex] = useState(1);
	const [numOfPages, setNumOfPages] = useState(props.numOfPages);

	// onUpdatePage
	useEffect(() => {
		if(!currentPageIndex) return;
		if(props.onUpdatePage) props.onUpdatePage(currentPageIndex)
	}, [currentPageIndex])
	return (
		<div className="Pagination w-100 d-flex justify-content-center">
			<div className="Pagination-container d-flex">
				{new Array(numOfPages).fill().map((item, key, arr) => {
					let pageIndex = key+1;
					if((pageIndex < currentPageIndex-2 && pageIndex < arr.length-4) || (pageIndex > currentPageIndex+2 && pageIndex > 5)) return ("");
					else return (<button className={"d-block mr-2" + (currentPageIndex === pageIndex ? " active" : "")} key={pageIndex} onClick={() => setCurrentPageIndex(pageIndex)}>{pageIndex}</button>);
				})}
				{currentPageIndex < numOfPages ? <button onClick={() => setCurrentPageIndex(currentPageIndex + 1)} className="next px-4">Дальше</button> : ""}
			</div>
		</div>
	);
}

export default Pagination;