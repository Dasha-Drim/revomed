import { useState, useEffect, useRef } from "react";
import API from "../utils/API";
import ENVIRONMENT from '../utils/ENVIRONMENT';
import { Link, useHistory } from "react-router-dom";
import EditorJs from "react-editor-js";
import { DateTime } from 'luxon';
import {
    FacebookShareButton,
    TelegramShareButton,
    TwitterShareButton,
    VKShareButton,
} from "react-share";
import EditorJsEmbed from '@editorjs/embed'
import EditorJsParagraph from '@editorjs/paragraph'
import EditorJsList from '@editorjs/list'
import EditorJsLinkTool from '@editorjs/link'
import EditorJsImage from '@editorjs/image'
import EditorJsHeader from '@editorjs/header'
import EditorJsQuote from '@editorjs/quote'
import EditorJsMarker from '@editorjs/marker'
import EditorJsSimpleImage from '@editorjs/simple-image'
import { browserName, browserVersion, osVersion, osName } from 'react-device-detect';

import BigLoadingState from "../elements/BigLoadingState/BigLoadingState";

// graphics
import back from './img/back.svg';
import shareIcon from './img/shareIcon.svg';
import vkIcon from './img/vkIcon.svg';
import telegramIcon from './img/telegramIcon.svg';
import twitterIcon from './img/twitterIcon.svg';
import facebookIcon from './img/facebookIcon.svg';

// styles
import './Article.scss';

let Article = (props) => {
    let history = useHistory();

    const [postData, setPostData] = useState(null);
    const [dropdownIsOpen, setDropdownIsOpen] = useState(false);
    const [shareObj, setShareObj] = useState(null);

    const EDITOR_JS_TOOLS = {
        embed: EditorJsEmbed,
        paragraph: EditorJsParagraph,
        list: EditorJsList,
        linkTool: EditorJsLinkTool,
        image: EditorJsImage,
        header: EditorJsHeader,
        quote: EditorJsQuote,
        marker: EditorJsMarker,
        simpleImage: EditorJsSimpleImage,
    }

    // SHARE DROPDOWN
    let shareDropdownOpen = (e) => {
        e.preventDefault();
        if (!shareObj) return;
        if (typeof navigator.share === "undefined") return setDropdownIsOpen(!dropdownIsOpen);
        navigator.share(shareObj)
            .then(() => console.log("Shareing successfull"))
            .catch(() => console.log("Sharing failed"))
    }
    const socialListMobileRef = useRef(null);
    const socialListDesktopRef = useRef(null);

    useEffect(() => {
        document.cookie = "bookingInfo=;max-age=-1";

        function handleClickOutside(event) {
            if (socialListDesktopRef.current && socialListMobileRef && !socialListDesktopRef.current.contains(event.target) && !socialListMobileRef.current.contains(event.target)) {
                setDropdownIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    // END OF SHARE DROPDOWN

    //let history = useHistory();
    useEffect(() => {
        let getPost = async (data) => {
            let res = await API.get('/farms/articles/' + props.match.params.id, data);
            return await res.data;
        }
        getPost().then((result) => {
            if (!result.success) return;
            setPostData(result.article);
            setShareObj({
                title: result.article.name,
                url: ENVIRONMENT.frontendURL + props.match.path
            })
        }, (error) => error.response.status === 404 ? history.replace("/404") : null);
    }, [history, props.match.params.id, props.match.path])

    return (
        <div className="Article">
        <div className="container py-7">
        {postData ? <>
          <div className="row goto-previous-page pb-6 py-sm-7">
            <div className="col-auto goto-previous-page__button-holder">
              <button onClick={() => history.goBack()} className="ui-r-secondary-button px-4 d-inline-flex align-items-center"><img src={back} className="mr-3" alt="back" />Вернуться назад</button>
            </div>
          </div>

          <div className="row">
            <div className="col-8 mb-5 px-0 px-sm-col">
              <div className="post-container pb-6">
                <div className="post-container__photo d-flex flex-wrap" style={{background: (browserName === "Safari" && +browserVersion < 15) ? "url("+postData.photo+")" : "url("+postData.photoWebp+")", "backgroundSize": "cover", "backgroundPosition": "center"}}>
                  <div className="post-container__name px-4 px-sm-7 my-6 w-100">
                    <h1>{postData.name}</h1>
                  </div>
                  <div className="post-container__info ml-4 ml-sm-0 px-sm-7 mt-5 mt-sm-0 mb-sm-6">
                    <span className="mr-4">{postData.author}</span>
                    <span>{DateTime.fromISO(postData.date, {zone: 'local'}).setLocale('ru').toFormat('dd MMMM yyyy')}</span>
                  </div>
                  <div className="post-container__action-links d-none d-lg-flex align-items-center mb-sm-6 px-7">
                    <div className="d-block share-widget ml-4" ref={socialListDesktopRef}>
                      <button className="m-btn-mini px-4" onClick={(e) => shareDropdownOpen(e)}><img src={shareIcon} className="mr-3" alt="share" /> Поделиться</button>
                      <div className={`share-widget__dropdown ${!dropdownIsOpen ? 'd-none' : ''}`}>
                        <FacebookShareButton beforeOnClick={() => setDropdownIsOpen(false)} {...shareObj} resetButtonStyle={false} className="m-btn-mini facebook" ><img src={facebookIcon} alt="facebook" /></FacebookShareButton>
                        <TelegramShareButton beforeOnClick={() => setDropdownIsOpen(false)} {...shareObj} resetButtonStyle={false} className="m-btn-mini telegram" ><img src={telegramIcon} alt="telegram" /></TelegramShareButton>
                        <VKShareButton beforeOnClick={() => setDropdownIsOpen(false)} {...shareObj} resetButtonStyle={false} className="m-btn-mini vk" ><img src={vkIcon} alt="vk" /></VKShareButton>
                        <TwitterShareButton beforeOnClick={() => setDropdownIsOpen(false)} {...shareObj} resetButtonStyle={false} className="m-btn-mini twitter" ><img src={twitterIcon} alt="twitter" /></TwitterShareButton>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="post-container__content pt-6 px-4 px-md-7 pb-2" id="editorjs">
                  <EditorJs minHeight={0} tools={EDITOR_JS_TOOLS} data={postData.description} readOnly />
                </div>
                <div className="post-container__action-links d-flex d-lg-none align-items-center px-4 px-md-7 pt-4">
                  <div className="d-block share-widget" ref={socialListMobileRef}>
                    <button className="m-btn-mini px-4" onClick={(e) => shareDropdownOpen(e)}><img src={shareIcon} className="mr-3" alt="share" /> Поделиться</button>
                    <div className={`share-widget__dropdown ${!dropdownIsOpen ? 'd-none' : ''}`}>
                      <FacebookShareButton beforeOnClick={() => setDropdownIsOpen(false)} url={ENVIRONMENT.frontendURL+props.match.path} resetButtonStyle={false} className="m-btn-mini facebook" ><img src={facebookIcon} alt="facebook" /></FacebookShareButton>
                      <TelegramShareButton beforeOnClick={() => setDropdownIsOpen(false)} url={ENVIRONMENT.frontendURL+props.match.path} resetButtonStyle={false} className="m-btn-mini telegram" ><img src={telegramIcon} alt="telegram" /></TelegramShareButton>
                      <VKShareButton beforeOnClick={() => setDropdownIsOpen(false)} url={ENVIRONMENT.frontendURL+props.match.path} resetButtonStyle={false} className="m-btn-mini vk" ><img src={vkIcon} alt="vk" /></VKShareButton>
                      <TwitterShareButton beforeOnClick={() => setDropdownIsOpen(false)} url={ENVIRONMENT.frontendURL+props.match.path} resetButtonStyle={false} className="m-btn-mini twitter" ><img src={twitterIcon} alt="twitter" /></TwitterShareButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </> : <div className="pt-7"><BigLoadingState text="Загружаем статью" /></div> }
      </div>
    </div>
    );
}

export default Article;