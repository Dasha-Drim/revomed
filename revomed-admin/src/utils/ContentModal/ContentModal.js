import { useState, useEffect, useRef } from "react";
import Modal from 'react-modal';

import cross from './cross.svg';
import './ContentModal.scss';

Modal.setAppElement("#root");
let ContentModal = (props) => {
  /*
  props.modalIsOpen
  props.modalIsOpenCallback
  props.modalHeader
  props.contentClassName
  props.customOverlayClass
  */
	let [modalIsOpen, setModalIsOpen] = useState(false);

  let closeModal = () => {
    setModalIsOpen(false);
    props.modalIsOpenCallback(false);
  }

  useEffect(() => {
    setModalIsOpen(props.modalIsOpen);
  }, [props.modalIsOpen])

  const wrapperRef = useRef(null);
  useEffect(() => {
    let handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) closeModal();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
  	<Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="Example Modal"
      overlayClassName={"ContentModal__Overlay "+props.customOverlayClass}
      className="ContentModal__Content container h-100"
    >
      <div className="ContentModal_wrapper row justify-content-center align-content-center align-items-center">
        <div ref={wrapperRef} className="ContentModal col-12 col-md-6 px-5 py-5">
          <button onClick={closeModal} className="close-modal-button mr-3 mt-3"><img src={cross} /></button>
    			<div className="ContentModal__Header d-flex mb-4 justify-content-center align-items-center text-center">
    				<h4>{props.modalHeader}</h4>
    			</div>
    			<div className={"ContentModal__Body text-center "+props.contentClassName}>
            {[props.children].flat().map((item, key) => {
              return (
                item
              )
            })}
    			</div>
        </div>
      </div>
    </Modal>
  );
}

export default ContentModal;
