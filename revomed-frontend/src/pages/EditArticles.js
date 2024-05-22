import { useState, useEffect, useRef } from "react";
import { useHistory, Link } from "react-router-dom";
import { FormValidation } from "../utils/FormValidation";
import API from "../utils/API";
import GeneralModal from "../utils/GeneralModal/GeneralModal";
import ContentModal from "../utils/ContentModal/ContentModal";
import ENVIRONMENT from "../utils/ENVIRONMENT";
import EditorJs from "react-editor-js";

import List from "@editorjs/list";
import LinkTool from "@editorjs/link";
import Header from "@editorjs/header";
import Image from '@editorjs/image'

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
import './EditArticles.scss';


let EditArticles = (props) => {

    const [formSubmitButtonIsLoading, setFormSubmitButtonIsLoading] = useState(false);
    const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
    const [generalModalHeader, setGeneralModalHeader] = useState("");
    const [generalModalText, setGeneralModalText] = useState("");
    const [contentModalIsOpen, setContentModalIsOpen] = useState(false);
    const [contentModalText, setContentModalText] = useState(false);
    const [errors, setErrors] = useState({});
    const [article, setArticle] = useState(null);
    const instanceRef = useRef(null);
    const [uploudPhoto, setUploudPhoto] = useState(false);

    const [errorSubcategory, setErrorSubcategory] = useState(false);
    const [countCategory, setCountCategory] = useState(0);

    let updatePhoto = () => {
        setUploudPhoto(true)
    }

    let updateCountCategory = (e) => {
        setCountCategory(actual => actual+e)
    }

    const [categories, setCategories] = useState([])

    const EDITOR_JS_TOOLS = {
        list: List,
        linkTool: {
            class: LinkTool,
            config: {
                endpoint: ENVIRONMENT.backendURL + '/farms/articles/link',
            }
        },
        header: Header,
        image: {
            class: Image,
            config: {
                endpoints: {
                    byFile: ENVIRONMENT.backendURL + '/farms/articles/image',
                }
            }
        },
    }

    // ON PAGE LOAD
    let history = useHistory();
    useEffect(() => {
        document.cookie = "bookingInfo=;max-age=-1";
        let getArticle = async () => {
            let res = await API.get('/farms/articles/' + props.match.params.id);
            return await res.data;
        }


        let getSubcategories = async () => {
            let res = await API.get('/subcategories');
            return await res.data;
        }
        getSubcategories().then((result) => {
            setCategories(result.categories);
            if (props.match.params.id) {
                getArticle().then((result) => {
                    setArticle(result.article);
                    setCountCategory(result.article.subcategories.length)
                }, (error) => error.response.status === 404 ? history.replace("/404") : null);
            } else {
                setArticle({ id: null });
            }
        }, (error) => error.response.status === 404 ? history.replace("/404") : null);



    }, [history, props.match.params.id])
    // END OF ON PAGE LOAD

    let postBanner = async (data) => {
        let res = await API.post('/farms/articles', data);
        return await res.data;
    }
    let putBanner = async (data) => {
        let res = await API.put('/farms/articles', data);
        return await res.data;
    }

    let handleSave = async () => {
        const savedData = await instanceRef.current.save();
        return await savedData;
    }



    const postArticleForm = useRef(null);
    let postArticleRequest = (e) => {
        e.preventDefault();

        let currentFormErrors = FormValidation(postArticleForm);
        setErrors(currentFormErrors);
        if (countCategory === 0) return setErrorSubcategory(true);
        /*if (Object.keys(currentFormErrors).length) return;*/

        //setFormSubmitButtonIsLoading(true);


        let postData = new FormData(postArticleForm.current);
        let formItems = postArticleForm.current.elements;
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
        handleSave().then((textPost) => {
            postData.append("description", JSON.stringify(textPost));
            if (!article.idArticle) {
                if (Object.keys(currentFormErrors).length) return;
                setFormSubmitButtonIsLoading(true);
                postBanner(postData).then((result) => {
                    setFormSubmitButtonIsLoading(false);
                    if (result.success) {
                        setContentModalText("Вы успешно добавили новую статью");
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
                postData.append('idArticle', article.idArticle);
                putBanner(postData).then((result) => {
                    setFormSubmitButtonIsLoading(false);
                    if (result.success) {
                        setContentModalText("Вы успешно обновили данные статьи");
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
        })
    }

    return (
        <div className="EditArticles">
            <div className="container py-7">
        {article ? <>
            <div className="row my-6 header">
                <div className="col-8 text-center">
                    <h1 className="mb-4">{article.name ? article.name : "Новая статья"}</h1>
                    <Link to="/lk/articles" className="d-inline-block reset-btn"><img src={crossIcon} className="mr-2" alt="" /> Отменить изменения</Link>
                </div>
            </div>

            {article.name &&
                <div className="row my-6">
                    <div className="col-8">
                        <div className={`message__block p-5 ${(article.message && article.message.type === "error") ? "error" : (article.message && article.message.type ==="success") ? "success" : ""}`}>
                            <h4>{(article.message && article.message.type === "error") ? "Отклонено" : (article.message && article.message.type ==="success") ? "Опубликовано" : "На модерации"}</h4>
                            <p className="mb-0">{(article.message && article.message.text) ? article.message.text : "Мы проверяем статью. Если всё отлично, статус сам изменится на “Опубликовано”"}</p>
                        </div>
                    </div>
                </div>
            }
            
            <div className="row mb-7">
                <div className="col-8">
                    <form onSubmit={postArticleRequest} ref={postArticleForm}>
                        <div className="row px-5 py-6 mx-0">
                            <div className="col-8 mb-4">
                                <h2>Название статьи</h2>
                            </div>
                            <div className="col-8 mb-4">
                                <Input name="name" label="Название" validation="notEmpty" defaultValue={article.name} errors={errors} />
                            </div>
                            <div className="col-8 my-4">
                                <h2>Изображение</h2>
                            </div>
                            {
                                (article.photo && !uploudPhoto) &&
                                <div className="col-8 mb-4 d-flex justify-content-center justify-content-lg-start">
                                    <div className="photo" style={{"backgroundImage": "url(" + article.photo + ")", "backgroundSize": "cover", "backgroundPosition": "center", "backgroundRepeat": "no-repeat"}}></div>
                                </div>
                            }
                            <div className="col-8 col-lg-4 mb-4 pr-lg-4">
                                <FileUploadInput label="Выберите изображение" name="photo" maxLength={1} errors={errors} validation="fileAttached" updateInput={updatePhoto} minWidth={1600} minHeight={460}/>
                            </div>
                            <div className="col-8 mb-4">
                                <div className="mb-2"><span className="mr-3">•</span><span><b>Разрешение:</b> горизонтальный формат с любым соотношением сторон (изображение центрируется), минимально 1600x460</span></div>
                                <div className="mb-2"><span className="mr-3">•</span><span><b>Максимальный объём файла:</b> 10 МБ</span></div>
                                <div className="mb-2"><span className="mr-3">•</span><span><b>Формат файла:</b> jpg, png</span></div>
                                <div className="mb-2"><span className="mr-3">•</span><span><b>Общие требования:</b> изображение хорошего качества</span></div>
                            </div>
                            <div className="col-8 my-4">
                                <h2>Текст статьи</h2>
                            </div>
                            <div className="col-8 mb-4">
                                    <EditorJs instanceRef={instance => (instanceRef.current = instance)} tools={EDITOR_JS_TOOLS} i18n={{messages: {}}} data={article.description}/>                                 
                                </div>
                            {categories.map((item, key) =>
                                <>
                                <div className="col-8 my-4">
                                    <h2>Категория “{item.name}”</h2>
                                </div>
                                <div className="col-8 mb-4" key={key}>
                                       <ChooseBlock name="subcategory" items={item.subcategories} description="Выберите подкатегории для показа" category={item.name} value={article.subcategories} updateCount={(e) => updateCountCategory(e)} isError={errorSubcategory} />
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
            </> : <div className="mb-7"><BigLoadingState text="Загружаем данные статьи" /></div> }
        
                </div>
                <ContentModal contentClassName="Checkup-modal" modalIsOpen={contentModalIsOpen} modalIsOpenCallback={(state) => {setContentModalIsOpen(state) }} modalHeader="Успешно">
                    <p className="mb-4">{contentModalText}</p>
                    <Link to="/lk/articles" className="m-btn d-inline-block w-100">Хорошо</Link>
                </ContentModal>
                <GeneralModal modalIsOpen={generalModalIsOpen} modalIsOpenCallback={(state) => setGeneralModalIsOpen(state)} modalHeader={generalModalHeader} modalText={generalModalText} />
        </div>
    );
}

export default EditArticles;