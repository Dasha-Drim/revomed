import { useState, useEffect, useRef } from "react";
import { useHistory, Link } from "react-router-dom";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import ContentModal from "../utils/ContentModal/ContentModal";


// components
import Input from "../atoms/Input/Input";
import FileUploadInput from "../atoms/FileUploadInput/FileUploadInput";
import Textarea from "../atoms/Textarea/Textarea";

import ChooseBlock from "../blocks/ChooseBlock/ChooseBlock";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// graphics
import pencilEditIcon from './img/LkUser/pencilEditIcon.svg';
import trash from './img/trash.svg';

import crossIcon from './img/LkUserEdit/crossIcon.svg';
import crossIconClinic from './img/LkUserEdit/crossIconClinic.svg';
import plusIconClinic from './img/LkUserEdit/plusIconClinic.svg';

// styles
import './EditProducts.scss';


let EditProducts = (props) => {

    const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
    const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
    const [generalModalHeader, setGeneralModalHeader] = useState("");
    const [generalModalText, setGeneralModalText] = useState("");
    const [contentModalIsOpen, setContentModalIsOpen] = useState(false);
    const [contentModalText, setContentModalText] = useState(false);
    const [errors, setErrors] = useState({});
    const [errorSubcategory, setErrorSubcategory] = useState(false);
    const [product, setProduct] = useState(null);
    const [uploudPhoto, setUploudPhoto] = useState(false);

    const [countCategory, setCountCategory] = useState(0);

    const [categories, setCategories] = useState([])

    const [shops, setShops] = useState([{ shop: "", link: "" }]);
    const [shopIsCurrentId, setShopIsCurrentId] = useState(null); //!!!

    let updatePhoto = () => {
			setUploudPhoto(true)
		}

    let addShopAdditionalInput = (e) => {
        e.preventDefault();
        let newArr = shops.slice(0);
        newArr.push("")
        setShops(newArr);
        setShopIsCurrentId(null);
    }
    let deleteShopAdditionalInput = (e, key) => {
        e.preventDefault();
        let newArr = shops.slice(0);
        console.log("eduArray1", newArr);
        newArr = newArr.filter((item, k) => k !== key);
        console.log("eduArray2", newArr);
        setShops(newArr);
        setShopIsCurrentId(null);
    }

    let updateShops = (e, id) => {
        let result = shops.map(function(item, index, array) {
            if (index === id) return { shop: e.value, link: item.link };
            else return item;
        });
        console.log("result", result);
        setShops(result);
    }

    let updateLinks = (e, id) => {
        let result = shops.map(function(item, index, array) {
            if (index === id) return { shop: item.name, link: e.value };
            else return item;
        });
        console.log("result", result);
        setShops(result);
    }


    // ON PAGE LOAD
    let history = useHistory();
    useEffect(() => {
        document.cookie = "bookingInfo=;max-age=-1";
        let getProduct = async () => {
            let res = await API.get('/farms/products/' + props.match.params.id);
            return await res.data;
        }
        let getSubcategories = async () => {
            let res = await API.get('/subcategories');
            return await res.data;
        }
        getSubcategories().then((result) => {
            setCategories(result.categories);
            if (props.match.params.id) {
                getProduct().then((result) => {
                    setProduct(result.product);
                    setShops(result.product.shops);
                    setCountCategory(result.product.subcategories.length)
                }, (error) => error.response.status === 404 ? history.replace("/404") : null);
            } else {
                setProduct({ id: null });
            }
        }, (error) => error.response.status === 404 ? history.replace("/404") : null);



    }, [history, props.match.params.id])

    let updateCountCategory = (e) => {
    	setCountCategory(actual => actual+e)
    }
    // END OF ON PAGE LOAD

    let postProduct = async (data) => {
        let res = await API.post('/farms/products', data);
        return await res.data;
    }
    let putProduct = async (data) => {
        let res = await API.put('/farms/products', data);
        return await res.data;
    }

    const postProductForm = useRef(null);
    let postProductRequest = (e) => {
        e.preventDefault();


        let currentFormErrors = FormValidation(postProductForm);
    		setErrors(currentFormErrors);
    		if (countCategory === 0) return setErrorSubcategory(true);
    		//if(Object.keys(currentFormErrors).length) return;

    		//setFormSubmitButtonIsLoading(true);

        let postData = new FormData(postProductForm.current);
        let formItems = postProductForm.current.elements;
        let subcategoriesList = [];
        let shopsList = [];
        let category;
        [...formItems].forEach(item => {
            if (!item.name) return;
            if (item.name === "subcategory" && item.checked) {
							return subcategoriesList.push(item.value);
						}
            if (item.name.split("_")[0] === "shop") return shopsList.push({ shop: item.value });
            if (item.name.split("_")[0] === "link") return shopsList[shopsList.length - 1].link = item.value;

            //postData.append(item.name, item.value);
        })
        postData.delete("subcategory");
        postData.set("subcategories", JSON.stringify(subcategoriesList));
        postData.append('shops', JSON.stringify(shopsList));
        if (!product.idProduct) {
        	if (Object.keys(currentFormErrors).length) return;
        	setFormSubmitButtonIsLoading(true);
            postProduct(postData).then((result) => {
                setFormSubmitButtonIsLoading(false);
                if (result.success) {
                    setContentModalText("Вы успешно добавили новый продукт");
                    setContentModalIsOpen(true);
                } else {
                    setGeneralModalHeader("Ошибка");
                    setGeneralModalText(result.message);
                    setGeneralModalIsOpen(true);
                }
            }, (error) => {
                setFormSubmitButtonIsLoading(false);
                setGeneralModalHeader("Ошибка");
                setGeneralModalText("Что-то пошло не так. Мы не смогли связаться с сервером, обновите страницу и попробуйте ещё раз.");
                setGeneralModalIsOpen(true);
            })
        } else {
        	setFormSubmitButtonIsLoading(true);
            postData.append('idProduct', product.idProduct);
            putProduct(postData).then((result) => {
                setFormSubmitButtonIsLoading(false);
                if (result.success) {
                    setContentModalText("Вы успешно обновили данные продукта");
                    setContentModalIsOpen(true);
                } else {
                    setGeneralModalHeader("Ошибка");
                    setGeneralModalText(result.message);
                    setGeneralModalIsOpen(true);
                }
            }, (error) => {
                setFormSubmitButtonIsLoading(false);
                setGeneralModalHeader("Ошибка");
                setGeneralModalText("Что-то пошло не так. Мы не смогли связаться с сервером, обновите страницу и попробуйте ещё раз.");
                setGeneralModalIsOpen(true);
            })
        }
    }


    return (
        <div className="EditProducts">
    	<div className="container py-7">
		{product ? <>
			<div className="row my-6 header">
				<div className="col-8 text-center">
					<h1 className="mb-4">{product.name ? "Редактирование продукта" : "Новый продукт"}</h1>
					<Link to="/lk/products" className="d-inline-block reset-btn"><img src={crossIcon} className="mr-2" alt="" /> Отменить изменения</Link>
				</div>
			</div>

			{product.name &&
				<div className="row my-6">
					<div className="col-8">
						<div className={`message__block p-5 ${(product.message && product.message.type === "error") ? "error" : (product.message && product.message.type ==="success") ? "success" : ""}`}>
							<h4>{(product.message && product.message.type === "error") ? "Отклонено" : (product.message && product.message.type ==="success") ? "Опубликовано" : "На модерации"}</h4>
							<p className="mb-0">{(product.message && product.message.text) ? product.message.text : "Мы проверяем статью. Если всё отлично, статус сам изменится на “Опубликовано”"}</p>
						</div>
					</div>
				</div>
			}
			
			<div className="row mb-7">
	      <div className="col-8">
					<form onSubmit={postProductRequest} ref={postProductForm}>
						<div className="row px-5 py-6 mx-0">
							<div className="col-8 mb-4">
								<h2>Основные настройки</h2>
							</div>
							<div className="col-8 col-lg-4 mb-4 pr-lg-4">
				      	<Input name="name" label="Название продукта" validation="notEmpty" defaultValue={product.name} errors={errors} />
				      </div>
				      <div className="col-8 my-4">
								<h2>Изображение</h2>
							</div>
							{
				      	(product.photo && !uploudPhoto) &&
				      	<div className="col-8 mb-4 d-flex justify-content-center justify-content-lg-start">
									<div className="photo" style={{"backgroundImage": "url(" + product.photo + ")", "backgroundSize": "cover", "backgroundPosition": "center", "backgroundRepeat": "no-repeat"}}></div>
				      	</div>
				      }
							<div className="col-8 col-lg-4 mb-4 pr-lg-4">
								<FileUploadInput label="Выберите изображение" name="photo" maxLength={1} errors={errors} validation="fileAttached" updateInput={updatePhoto} minWidth={600} minHeight={600} />
				      </div>	
				      <div className="col-8 mb-4">
								<div className="mb-2"><span className="mr-3">•</span><span><b>Разрешение:</b> соотношение сторон 1:1, минимально 600x600 пикселей</span></div>
								<div className="mb-2"><span className="mr-3">•</span><span><b>Максимальный объём файла:</b> 10 МБ</span></div>
								<div className="mb-2"><span className="mr-3">•</span><span><b>Формат файла:</b> jpg, png</span></div>
								<div className="mb-2"><span className="mr-3">•</span><span><b>Общие требования:</b> фотография хорошего качества, продукт находится в фокусе</span></div>
				      </div>
				      <div className="col-8 my-4">
								<h2>Описание препарата</h2>
							</div>
							<div className="col-8 mb-4 mini-textarea">
				      	<Textarea tabIndex="-1" label="Описание" name="description" defaultValue={product.description} />
				      </div>
				      <div className="col-8 mb-4 mt-4">
								<h2>Интернет-магазины</h2>
							</div>
				      <div className="col-8">
				      	{shops.map((item, key) =>
				      		<div className="InputPlusWithDates row align-items-center align-content-center mb-3" key={key}>
						      	<label className="InputPlusWithDates-group col-3 d-block">
									    <input value={item.shop} name={"shop_"+key} required placeholder="Название интернет-магазина" data-validation="notEmpty" tabIndex="-1" className={errors && errors.hasOwnProperty("shop_"+key) && errors["shop_"+key] ? "error" : ""} onChange={(e) => {updateShops(e, key); setErrors(actual => {actual["shop_"+key] = false; return { ...actual };})}} />
									  </label>
									  <label className="InputPlusWithDates-group col-4 d-block">
									    <input value={item.link} name={"link_"+key} required placeholder="Ссылка на интернет-магазин" data-validation="notEmpty" tabIndex="-1" className={errors && errors.hasOwnProperty("link_"+key) && errors["link_"+key] ? "error" : ""} onChange={(e) => {updateLinks(e, key); setErrors(actual => {actual["link_"+key] = false; return { ...actual };})}} />
									  </label>
								    { 20 !== shops.length && key === 0 ? <div className="InputPlusWithDates-plus col-2 col-md-1 d-flex justify-content-end"><div className="icon plus" onClick={(e) => addShopAdditionalInput(e)}><img src={plusIconClinic} alt="plus" /></div></div> : "" }
							    	{ 20 !== shops.length && key !== 0 ? <div className="InputPlusWithDates-plus col-2 col-md-1 d-flex justify-content-end"><div className="icon cross" onClick={(e) => deleteShopAdditionalInput(e, key)}><img src={crossIconClinic} alt="cross" className="cross" /></div></div> : "" }
							    </div>
				      	)}
							</div>
				      
					    {categories.map((item, key) =>
					    	<>
					    	<div className="col-8 my-4">
									<h2>Категория “{item.name}”</h2>
								</div>
					     	<div className="col-8 mb-4" key={key}>
					       	<ChooseBlock name="subcategory" items={item.subcategories} description="Выберите подкатегории для показа" category={item.name} value={product.subcategories} updateCount={(e) => updateCountCategory(e)} isError={errorSubcategory} />
					      </div>
					      </>
					    )}
					    
							<div className="col-8 mt-6">
				      	<button type="submit" className="ui-r-main-button px-6 mx-auto d-flex justify-content-center" disabled={formSubmitButtonIsLoading}>
									<div className={!formSubmitButtonIsLoading ? "d-none" : "mini-loader"}></div>
									<span className={formSubmitButtonIsLoading ? "invisible" : ""}>Сохранить</span>
								</button>
				      </div>
						</div>
					</form>
				</div>
			</div>
			</> : <div className="mb-7"><BigLoadingState text="Загружаем данные продукта" /></div> }
		
      	</div>
      	<ContentModal contentClassName="Checkup-modal" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => {setContentModalIsOpen(state) }} modalHeader="Успешно">
					<p className="mb-4">{contentModalText}</p>
					<Link to="/lk/product" className="m-btn d-inline-block w-100">Хорошо</Link>
				</ContentModal>
      	<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
    </div>
    );
}

export default EditProducts;