import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Modal from 'react-modal';
import { useSwipeable } from 'react-swipeable';

import './MobileMenuModal.scss';


Modal.setAppElement('#root')

let MobileMenuModal = (props) => {

  const [modalOverlayRef, setModalOverlayRef] = useState(null);
  const { ref } = useSwipeable({
    onSwipedLeft: () => {console.log('swiped'); props.closeModal()}
  });
  useEffect(() => {
    if(modalOverlayRef) ref(modalOverlayRef);
  }, [modalOverlayRef, ref]);

    return (
      <div>
        <Modal
          isOpen={props.isOpen}
          onRequestClose={props.closeModal}
          overlayClassName="MobileMenuModal__Overlay"
          className="MobileMenuModal__Content"
          overlayRef={setModalOverlayRef}
        >
          <div  className="MobileMenuModal__Content h-100 w-100 pt-6 pb-3 px-5">
            <div className="Footer__nav d-flex flex-column pb-5">
              <span className="pb-4">Навигация</span>
              <Link to="/catalog" onClick={() => props.closeModal()}>Каталог</Link>
              <Link to="/blog" onClick={() => props.closeModal()}>Блог</Link>
              <Link to="/clinics" onClick={() => props.closeModal()}>Клиники</Link>
              <Link to="/auth" onClick={() => props.closeModal()}>Вход</Link>
            </div>
            <div className="Footer__nav d-flex flex-column pb-5">
              <span className="pb-4">Работа с сервисом</span>
              <Link to="/auth/sellers" onClick={() => props.closeModal()}>Вход для врачей</Link>
              <Link to="/reg/doc" onClick={() => props.closeModal()}>Стать врачом</Link>
              <Link to="/reg/clinic" onClick={() => props.closeModal()}>Стать клиникой</Link>
            </div>
            <div className="Footer__nav d-flex flex-column">
              <span className="pb-4">Социальные сети</span>
              <a href="https://vk.com/club197257502">ВКонтакте</a>
              <a href="https://www.instagram.com/revomed.live/">Instagram</a>
              <a href="https://www.facebook.com/Revomed-105987984537751">Facebook</a>
              <a href="https://www.youtube.com/channel/UCHTCUZDuFAbcG7OVuVGllxA?view_as=subscriber">YouTube</a>
            </div>
            <div className="Footer__about-company d-flex flex-wrap flex-column py-5">
              <p className="d-md-none d-lg-inline">REVOMED - сервис онлайн телемедицины с проверенными <br />врачами. Консультации в видео-чате.</p>
              <p>ООО «Ревомед» <br/>ИНН 7702374507, ОГРН 1157746013611</p>
              <Link to="/politics" className="d-block Footer__agreement-link"  onClick={() => props.closeModal()}>Соглашение о персональных данных</Link> 
              <Link to="/agreement" className="d-block Footer__agreement-link pb-3"  onClick={() => props.closeModal()}>Пользовательское соглашение</Link>
              <a href="https://amont.studio" className="d-block Footer__studio-link">Разработка Amont.studio</a>
            </div>
            <div className="w-100 text-center pt-7">
              <span className="warning">ИМЕЮТСЯ ПРОТИВОПОКАЗАНИЯ.</span><span className="warning">НЕОБХОДИМА КОНСУЛЬТАЦИЯ СПЕЦИАЛИСТА.</span>
            </div>
          </div>
          
        </Modal>
      </div>
    );
}
export default MobileMenuModal