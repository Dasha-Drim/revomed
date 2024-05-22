import { useState, useEffect, useRef } from "react";
import Modal from 'react-modal';

import cross from './cross.svg';
import './ContentModal.scss';

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
      <div className="ContentModal_wrapper row justify-content-center align-content-sm-center align-content-end">
        <div ref={wrapperRef} className="ContentModal col-8 col-md-4 px-6 py-7">
          <button onClick={closeModal} className="close-modal-button mr-3 mt-3"><img src={cross} /></button>
    			<div className="ContentModal__Header d-flex mb-4 justify-content-center align-items-center text-center">
    				<h2>{props.modalHeader}</h2>
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