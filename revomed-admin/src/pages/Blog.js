import { useState, useEffect } from "react";
import API from "../utils/API";
import { Link } from "react-router-dom";

//components
import Navigation from "../blocks/Navigation/Navigation";
import PostCard from "../blocks/PostCard/PostCard";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// styles
import "./Blog.scss";

let Blog = (props) => {
	const [posts, setPosts] = useState(null);
	
	// ON PAGE LOAD
	useEffect(()=> {
		let getBlog = async (data) => {
			let res = await API.get("/posts", data);
			return await res.data;
		}
		getBlog().then((result) => {
			setPosts(result.posts);
		})
	}, [])
	// END OF ON PAGE LOAD

	return (
		<>
			<Navigation page="blog" useAuth={props.useAuth} />
			<div className="Blog">
				<div className="container-fluid">
					<div className="row px-2 py-3 p-md-5">
					{posts ? <>
						<div className="col-12 mb-5 d-flex align-items-center justify-content-between">
							<h1>Блог</h1>
							<Link to="/addpost" className="secondary-button">Добавить новую статью</Link>
						</div>
						{posts.map((item, key) => 
							<div className="col-12 col-lg-6 pb-4" key={key}>
								<PostCard info={item}/>
							</div>
						)}
						</> : <BigLoadingState  text="Загружаем посты"/>}
					</div>
				</div>
			</div>
		</>
	);
}

export default Blog;