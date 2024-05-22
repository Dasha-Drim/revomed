import { useState, useEffect } from "react";
import { Link } from "react-router-dom"
import API from "../utils/API";

//components
import Navigation from "../blocks/Navigation/Navigation";
import ReviewCard from "../blocks/ReviewCard/ReviewCard";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

import plus from "./img/plus.svg";

// styles
import './Reviews.scss';

let Reviews = (props) => {
	let [reviews, setReviews] = useState(null);

	// ON PAGE LOAD
	useEffect(() => {
		let getReviews = async (data) => {
			let res = await API.get("/reviews", data);
			return await res.data;
		}
		getReviews().then((result) => {
			setReviews(result.reviews);
		})
	}, [])
	// END OF ON PAGE LOAD

	return (
		<>
			<Navigation page="reviews" useAuth={props.useAuth} />
			<div className="Reviews">
				<div className="container-fluid">
					<div className="row px-2 py-3 p-md-5">
					{reviews ? <>
						<div className="col-12 mb-5 d-flex align-items-center justify-content-between">
							<h1>Отзывы</h1>
							<Link to="/editreviews"><img src={plus} alt="" /></Link>
						</div>
						{reviews.map((item, key) => 
							<div className="col-12 col-lg-6 pb-4" key={key}>
								<ReviewCard info={item}/>
							</div>
						)}
						</> : <BigLoadingState text="Загружаем отзывы"/>}
					</div>
				</div>
			</div>
		</>
	);
}

export default Reviews;