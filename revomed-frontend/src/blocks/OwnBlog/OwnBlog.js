import { Link } from "react-router-dom";
import { DateTime } from "luxon";
import LazyLoad from 'react-lazy-load';
import { browserName, browserVersion, osVersion, osName } from 'react-device-detect';

// styles
import './OwnBlog.scss';

let OwnBlog = (props) => {
	/*
	props.posts
	*/

	return (
		<div className="OwnBlog">
			<div className="row mb-4">
				<div className="col-8">
					<h2 className="OwnBlog__heading py-5 px-6 mb-0">Новости и блог</h2>
				</div>
			</div>
			<div className="OwnBlog__posts row">
				{props.posts.map((item, key) => 
				<div key={key} className="col-8 col-md-4 post-item-col mb-4">
					<div className="post-item">
						<LazyLoad>
						<div className="post-item__photo-preview" style={{"backgroundColor": "#272848", "backgroundImage": (browserName === "Safari" && +browserVersion <  15) ? "url("+item.photo+")" : "url("+item.photoWebp+")", "backgroundSize": "cover", "backgroundPosition": "center"}}>
							<div className="post-item__info mb-xl-3 mb-2">
								<span>{item.author}</span>
								<span>{DateTime.fromISO(item.date, {zone: 'local'}).setLocale('ru').toFormat('dd MMMM yyyy')}</span>
							</div>
						</div>
						</LazyLoad>
						<div className="post-item__content p-5">
							<Link className="post-item__heading" to={"/post/"+item.id}>{item.title}</Link>
							<p>{item.description}</p>
						</div>
					</div>
				</div>
				)}
			</div>
		</div>
	);
}

export default OwnBlog;