import { useState, useEffect, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import API from "../utils/API";
import { Link as LinkScroll, DirectLink, Element, Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'

import productImg from './img/product.jpg';
import back from './img/back.svg';

import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// styles
import './Product.scss';

let Product = (props) => {
    let history = useHistory();
    /*let [product, setProduct] = useState({
        name: "Ревит «Алтайвитамины», комплекс витаминов А, В1, В2, С, 100 драже по 0.5г",
        photo: productImg,
        shops: [{ shop: "Аптеки Столицы", link: "https://ya.ru" }, { shop: "МосГорЗдрав", link: "https://ya.ru" }],
        description: "Вы можете обратиться к Денису, если чувствуете, что вам стало тяжело справляться с тем, что происходит в жизни. Или то, как вы с этим справляетесь, не приносит удовлетворения. \nМир, в котором мы живем, невероятно быстро развивается, меняется, становиться все больше, предъявляет все больше требований. Нам сложнее понимать кто мы, чего хотим, что нас беспокоит. Это рождает тревогу, усиливает чувство одиночества и покинутости. "
    })*/


    let [product, setProduct] = useState(null)

    let getProduct = async () => {
        let res = await API.get('/farms/products/' + props.match.params.id);
        return await res.data;
    }

    useEffect(() => {

        getProduct().then((result) => {
            console.log("result", result)
            setProduct(result.product);
        });
    }, [])


    return (
        <div className="Product">
			<div className="container py-7">
				{product ?
					<>
					<div className="row goto-previous-page py-7 d-none d-sm-block">
						<div className="col-auto goto-previous-page__button-holder">
				  			<button onClick={() => history.goBack()} className="ui-r-secondary-button d-inline-flex align-items-center px-4"><img src={back} className="mr-3" alt="back" />Вернуться назад</button>
						</div>
			  		</div>
			  		<div className="row pb-7">
						<div className="col-8 d-flex flex-wrap flex-lg-nowrap mb-7 justify-content-center justify-content-lg-start">
				  			{/*<img src={product.photo} alt="" className="mb-5 mb-lg-0" />*/}
				  			<div className="img mb-5 mb-lg-0" style={{"backgroundColor": "#E9EAFE", "backgroundImage": "url("+product.photo+")", "backgroundSize": "cover", "backgroundPosition": "center"}} />
				  				<div className="w-100">
									<h1>{product.name}</h1>
									<LinkScroll className="link mb-6 d-inline-block" activeClass="active" to="description" spy={true} smooth={true} duration={500}>Перейти к описанию</LinkScroll>
									<div className="shops px-6 py-4">
									{
								  		product.shops.length &&
								  		product.shops.map((item, key) => 
										<div className="d-flex justify-content-between align-items-center py-4 item">
									  		<span>{item.shop}</span>
									  		<a href={item.link} target="_blank" className="d-inline-block m-btn">В магазин</a>
										</div>
								  		)
									}
								</div>
							  	</div>
							</div>
							<Element name="description" className="col-8 col-lg-4">
				  				<h2>Описание</h2>
				  				<div className="deacription__holder p-6">
									<p>{product.description}</p>
				  				</div>
							</Element>
						</div>
						</>
				: <div className="pt-7"><BigLoadingState text="Загружаем данные" /></div>}
			</div>
		</div>
    );
}

export default Product;