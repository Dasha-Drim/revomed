import { useState, useEffect, useRef } from "react";
import Modal from 'react-modal';

import cross from './cross.svg';
import './GeneralModal.scss';

Modal.setAppElement("#root");

let GeneralModal = (props) => {
  /*
  props.modalIsOpen
  props.modalIsOpenCallback
  props.modalHeader
  props.modalText
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
      overlayClassName="GeneralModal__Overlay"
      className="GeneralModal__Content container h-100"
    >
      <div className="row justify-content-center h-100 align-content-center align-items-center">
        <div ref={wrapperRef} className="GeneralModal col-12 col-md-6 px-5 py-5">
          <button onClick={closeModal} className="close-modal-button mr-3 mt-3"><img src={cross} /></button>
    			<div className="GeneralModal__Header d-flex mb-4 justify-content-center align-items-center text-center">
    				<h2>{props.modalHeader}</h2>
    			</div>
    			<div className="GeneralModal__Body text-center">
    				<p className="mb-5">{props.modalText}</p>
            <button className="secondary-button d-inline-block w-100" onClick={closeModal}>Хорошо</button>
    			</div>
        </div>
      </div>
    </Modal>
  );
}

export default GeneralModal;
