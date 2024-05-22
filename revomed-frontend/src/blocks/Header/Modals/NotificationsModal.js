import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Modal from 'react-modal';
import { useSwipeable } from 'react-swipeable';
import ENVIRONMENT from "../../../utils/ENVIRONMENT";
import EmptyState from "../../../elements/EmptyState/EmptyState";
import { DateTime } from 'luxon';

// styles
import './NotificationsModal.scss';


Modal.setAppElement('#root')

let NotificationsModal = (props) => {

  const [modalOverlayRef, setModalOverlayRef] = useState(null);
  const [position, setPosition] = useState(null);

  const { ref } = useSwipeable({
    onSwipedLeft: () => {console.log('swiped'); props.closeModal()}
  });
  useEffect(() => {
    if(modalOverlayRef) ref(modalOverlayRef);
  }, [modalOverlayRef, ref]);

  useEffect(() => {
    setPosition(props.position)
  }, [props.position])

    return (
      <div>
        <Modal
          isOpen={props.isOpen}
          onRequestClose={props.closeModal}
          overlayClassName="NotificationsModal__Overlay"
          className="NotificationsModal__Content"
          overlayRef={setModalOverlayRef}
          style={{content: position}}
          parentSelector={() => props.portal}
        >
          <div className="NotificationsModal__Inner pt-3 pb-1 px-5">
            <span className="mini-heading d-block mb-4">Уведомления</span>
            {props.notifications.length ? props.notifications.map((item, key) => 
              <div key={key} className="notification-item mb-4">
                  <Link to={item.link ? item.link : "/lk"} onClick={() => props.closeModal()}>{item.text}</Link>
                  <span className="d-block">{DateTime.fromISO(item.date, {zone: 'local'}).setLocale('ru').toFormat('dd MMMM yyyy в HH:mm')}</span>
              </div>
            ) : <EmptyState text="Уведомлений пока нет" />}
          </div>
          
        </Modal>
      </div>
    );
}
export default NotificationsModal