import Modal from 'react-modal';

// graphics
import cross from './cross.svg';

// styles
import './MobileFilterModal.scss';

// set app elements for modal
Modal.setAppElement('#root')

let MobileFilterModal = (props) => {
  /*
  props.closeModal - close modal function
  props.openModal - open modal function
  props.isOpen - boolean state modal is open
  props.setSelectedSortByValue - set selected variant of sort filter
  props.setSelectedTimeByValue - set selected variant of time filter
  props.filterSort - array of options of sort filter
  props.filterTime - array of options of time filter
  props.defaultVariantSort - index of the object element that will be set by default of sort filter (optional)
  props.defaultVariantTime - index of the object element that will be set by default of time filter (optional)
  */

  let handleSubmit = (event) => {
    event.preventDefault();
    let filterResult = {
      time: event.target.elements['time'].value,
      sort: event.target.elements['sort'].value,
    }
    props.onApply(filterResult);
    props.closeModal();
  }
    return (
      <div>
        <Modal
          isOpen={props.isOpen}
          onRequestClose={props.closeModal}
          contentLabel="Example Modal"
          overlayClassName="MobileFilterModal__Overlay"
          className="MobileFilterModal__Content py-6"
        >
          <div className="MobileFilterModal__Header d-flex mb-5 justify-content-between align-items-center">
            <h2>Настройки поиска</h2>
            <button onClick={props.closeModal} className="close-modal-button"><img src={cross} alt="" /></button>
          </div>
          <form className="MobileFilterModal__Body" onSubmit={handleSubmit}>
            <div className="sort-by">
              <h3 className="mb-4">Сортировать:</h3>
              {props.filterSort.map((item, key) => 
              <label key={key}>
                <input type="radio" name="sort" value={item.value} defaultChecked={props.setSelectedSortByValue ? item.value === props.setSelectedSortByValue : key === props.defaultVariantSort} />
                <span>{item.name}</span>
              </label>
              )}
            </div>

            <div className="time-sort mt-5">
              <h3 className="mb-4">Время консультации:</h3>
              {props.filterTime.map((item, key) => 
              <label key={key}>
                <input type="radio" name="time" value={item.value} defaultChecked={props.setSelectedTimeByValue ? item.value === props.setSelectedTimeByValue : key === props.defaultVariantTime} />
                <span>{item.name}</span>
              </label>
              )}
            </div>

            <div className="mt-5">
              <button type="submit" className="w-100 m-btn">Применить</button>
            </div>
          </form>
        </Modal>
      </div>
    );
}
export default MobileFilterModal