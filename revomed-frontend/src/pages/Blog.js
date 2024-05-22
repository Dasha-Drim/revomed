import { useState, useEffect } from "react";
import API from "../utils/API";
import {Link} from "react-router-dom";
import { DateTime } from 'luxon';
import {Helmet} from 'react-helmet';

// components
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";
import Pagination from "../elements/Pagination/Pagination";

// graphics 
import magnifierIcon from './img/magnifierIcon.svg';

// styles
import './Blog.scss';

let Blog = () => {
	const [posts, setPosts] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [pagesAvailable, setPagesAvailable] = useState(null);

	// GET POSTS
	let getPosts = async (data) => {
		let res = await API.get('/posts', data);
		return await res.data;
	}
	// END OF GET POSTS


	// ON PAGE LOAD
	useEffect(() => {
		document.cookie = "bookingInfo=;max-age=-1";
		let params = {
			limit: 10,
			offset: 0
		}
		getPosts({params: params}).then((result) => {
			setPosts(result.posts)
			setPagesAvailable(result.pagesAvailable);
		})
	}, [])
	// END OF ON PAGE LOAD


	// ON PAGE CHANGE
	let onUpdatePage = (page) => {
		if(currentPage === page) return;
		setCurrentPage(page);
		setPosts(null);
		let params = {
			limit: 10,
			offset: (page-1)*10
		}
		getPosts({params: params}).then((result) => {
			setPosts(result.posts);
			setPagesAvailable(result.pagesAvailable);
		})
	}
	// END OF ON PAGE CHANGE





  return (
    <div className="Blog">
    	<div className="container py-5 py-md-7">
    	<Helmet encodeSpecialCharacters={true} onChangeClientState={(newState, addedTags, removedTags) => console.log(newState, addedTags, removedTags)}>
	      <title> Полезный блог для девушек и женщин</title>
	      <meta property="description" content="Полезные статьи о детях, семье, женском здоровье и психологии." />
	    </Helmet>
    		<div className="page-header-blog row pb-5 mb-2">
					<div className="pb-4 pb-md-0 col-8 col-md-auto d-none d-sm-block">
						<h1>Блог</h1>
					</div>
				</div>

				<div className="row blog-posts">
					{posts ? posts.map((item, index) => 
					<Link to={"/post/"+item.id} key={index} className="col-8 col-md-4 post-item-col mb-4">
						<div className="post-item">
							<div className="post-item__photo-preview" style={{"backgroundColor": "#272848", "backgroundImage": "url("+item.photo+")", "backgroundSize": "cover", "backgroundPosition": "center"}}>
								<div className="post-item__info mb-xl-3 mb-2">
									<span>{item.author}</span>
									<span>{DateTime.fromISO(item.date, {zone: 'local'}).setLocale('ru').toFormat('dd MMMM yyyy')}</span>
								</div>
							</div>
							<div className="post-item__content p-5">
								<h2 className="post-item__heading">{item.title}</h2>
								<p>{item.description}</p>
							</div>
						</div>
					</Link>
					) : <BigLoadingState text="Загружаем блог" />}
				</div>
				{pagesAvailable > 1 ? <div className="col-8 mb-7 mt-5 d-flex justify-content-center">
					<Pagination numOfPages={pagesAvailable} onUpdatePage={(page) => onUpdatePage(page)} />
				</div> : "" }
    	</div>
    </div> 
  );
}

export default Blog;
