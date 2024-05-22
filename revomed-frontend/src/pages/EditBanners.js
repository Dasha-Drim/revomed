import { useState, useEffect, useRef } from "react";
import { useHistory, Link } from "react-router-dom";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import ContentModal from "../utils/ContentModal/ContentModal";


// components
import Input from "../atoms/Input/Input";
import FileUploadInput from "../atoms/FileUploadInput/FileUploadInput";

import ChooseBlock from "../blocks/ChooseBlock/ChooseBlock";
import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// graphics
import pencilEditIcon from './img/LkUser/pencilEditIcon.svg';
import trash from './img/trash.svg';

import crossIcon from './img/LkUserEdit/crossIcon.svg';
import crossIconClinic from './img/LkUserEdit/crossIconClinic.svg';
import plusIconClinic from './img/LkUserEdit/plusIconClinic.svg';

// styles
import './EditBanners.scss';


let EditBanners = (props) => {

    const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
    const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
    const [generalModalHeader, setGeneralModalHeader] = useState("");
    const [generalModalText, setGeneralModalText] = useState("");
    const [contentModalIsOpen, setContentModalIsOpen] = useState(false);
    const [contentModalText, setContentModalText] = useState(false);
    const [errors, setErrors] = useState({});
    const [banner, setBanner] = useState(null);
    const [uploudPhoto, setUploudPhoto] = useState(false);

    const [errorSubcategory, setErrorSubcategory] = useState(false);
    const [countCategory, setCountCategory] = useState(0);

    const [categories, setCategories] = useState([])

    let updateCountCategory = (e) => {
        setCountCategory(actual => actual+e)
    }

    // ON PAGE LOAD
    let history = useHistory();
    useEffect(() => {
        document.cookie = "bookingInfo=;max-age=-1";
        let getBanner = async () => {
            let res = await API.get('/farms/banners/' + props.match.params.id);
            return await res.data;
        }


        let getSubcategories = async () => {
            let res = await API.get('/subcategories');
            return await res.data;
        }
        getSubcategories().then((result) => {
            setCategories(result.categories);
            if (props.match.params.id) {
                getBanner().then((result) => {
                	console.log("banner", result.banner);
                    setBanner(result.banner);
                    setCountCategory(result.banner.subcategories.length)
                }, (error) => error.response.status === 404 ? history.replace("/404") : null);
            } else {
                setBanner({ id: null });
            }
        }, (error) => error.response.status === 404 ? history.replace("/404") : null);


    }, [history, props.match.params.id])
    // END OF ON PAGE LOAD

    let postBanner = async (data) => {
        let res = await API.post('/farms/banners', data);
        return await res.data;
    }
    let putBanner = async (data) => {
        let res = await API.put('/farms/banners', data);
        return await res.data;
    }

    const postBannerForm = useRef(null);
    let postBannerRequest = (e) => {
        e.preventDefault();

        let currentFormErrors = FormValidation(postBannerForm);
        setErrors(currentFormErrors);
        console.log("countCategory", countCategory)
        if (countCategory === 0) return setErrorSubcategory(true);

        let postData = new FormData(postBannerForm.current);
        let formItems = postBannerForm.current.elements;
        let subcategoriesList = [];
        let category;
        [...formItems].forEach(item => {
            if (!item.name) return;
            if (item.name === "subcategory" && item.checked) {
                console.log("item.value", item.value)
                return subcategoriesList.push(item.value);
            }
        })
        postData.delete("subcategory");
        postData.set("subcategories", JSON.stringify(subcategoriesList));
        if (!banner.idBanner) {
        	if (Object.keys(currentFormErrors).length) return;
        	setFormSubmitButtonIsLoading(true);

            postBanner(postData).then((result) => {
                setFormSubmitButtonIsLoading(false);
                if (result.success) {
                    setContentModalText("Вы успешно добавили новый баннер");
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
            postData.append('idBanner', banner.idBanner);
            console.log("123")
            putBanner(postData).then((result) => {
                setFormSubmitButtonIsLoading(false);
                if (result.success) {
                    setContentModalText("Вы успешно обновили данные баннера");
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

    let updatePhoto = () => {
        setUploudPhoto(true)
    }


    return (
        <div className="EditBanners">
    	<div className="container py-7">
		{banner ? <>
			<div className="row my-6 header">
				<div className="col-8 text-center">
					<h1 className="mb-4">{banner.name ? "Редактирование баннера" : "Новый баннер"}</h1>
					<Link to="/lk/banners" className="d-inline-block reset-btn"><img src={crossIcon} className="mr-2" alt="" /> Отменить изменения</Link>
				</div>
			</div>

			{banner.name &&
				<div className="row my-6">
					<div className="col-8">
						<div className={`message__block p-5 ${(banner.message && banner.message.type === "error") ? "error" : (banner.message && banner.message.type ==="success") ? "success" : ""}`}>
							<h4>{(banner.message && banner.message.type === "error") ? "Отклонено" : (banner.message && banner.message.type ==="success") ? "Опубликовано" : "На модерации"}</h4>
							<p className="mb-0">{(banner.message && banner.message.text) ? banner.message.text : "Мы проверяем статью. Если всё отлично, статус сам изменится на “Опубликовано”"}</p>
						</div>
					</div>
				</div>
			}
			
			<div className="row mb-7">
	      <div className="col-8">
					<form onSubmit={postBannerRequest} ref={postBannerForm}>
						<div className="row px-5 py-6 mx-0">
							<div className="col-8 mb-4">
								<h2>Основные настройки</h2>
							</div>
							<div className="col-8 col-lg-4 mb-4 pr-lg-4">
				      	<Input name="name" label="Название (не публично)" validation="notEmpty" defaultValue={banner.name} errors={errors} />
				      </div>
				      <div className="col-8 col-lg-4 mb-4 pl-lg-4">
				      	<Input name="link" label="Ссылка при клике" defaultValue={banner.link} validation="notEmpty" errors={errors} />
				      </div>
				      <div className="col-8 my-4">
								<h2>Изображение</h2>
							</div>
							{
				      	(banner.photo && !uploudPhoto) &&
				      	<div className="col-8 mb-4 d-flex justify-content-center justify-content-lg-start">
									<div className="photo" style={{"backgroundImage": "url(" + banner.photo + ")", "backgroundSize": "cover", "backgroundPosition": "center", "backgroundRepeat": "no-repeat"}}></div>
				      	</div>
				      }
							<div className="col-8 col-lg-4 mb-4 pr-lg-4">
								<FileUploadInput label="Выберите изображение" name="photo" maxLength={1} errors={errors} validation="fileAttached" updateInput={updatePhoto} minWidth={800} minHeight={400} />
				      </div>	
				      <div className="col-8 mb-4">
								<div className="mb-2"><span className="mr-3">•</span><span><b>Разрешение:</b> горизонтальный формат с соотношением сторон 2:1, минимально 800x400 пикселей</span></div>
								<div className="mb-2"><span className="mr-3">•</span><span><b>Максимальный объём файла:</b> 10 МБ</span></div>
								<div className="mb-2"><span className="mr-3">•</span><span><b>Формат файла:</b> jpg, png, gif</span></div>
								<div className="mb-2"><span className="mr-3">•</span><span><b>Общие требования:</b> изображение хорошего качества</span></div>
				      </div>

					    {categories.map((item, key) =>
					    	<>
					    	<div className="col-8 my-4">
									<h2>Категория “{item.name}”</h2>
								</div>
					     	<div className="col-8 mb-4" key={key}>
					       	<ChooseBlock name="subcategory" items={item.subcategories} description="Выберите подкатегории для показа" category={item.name} value={banner.subcategories}  updateCount={(e) => updateCountCategory(e)} isError={errorSubcategory} />
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
			</> : <div className="mb-7"><BigLoadingState text="Загружаем данные баннера" /></div> }
		
      	</div>
      	<ContentModal contentClassName="Checkup-modal" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => {setContentModalIsOpen(state) }} modalHeader="Успешно">
					<p className="mb-4">{contentModalText}</p>
					<Link to="/lk/banner" className="m-btn d-inline-block w-100">Хорошо</Link>
				</ContentModal>
      	<GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
    </div>
    );
}

export default EditBanners;