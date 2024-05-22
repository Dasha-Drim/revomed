import { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";

// styles
import './ChooseBlock.scss';

import Checkbox from '../../atoms/Checkbox/Checkbox';

let ChooseBlock = (props) => {

	const [selectedCategoriesCounter, setSelectedCategoriesCounter] = useState(0);
	//const [errors, setErrors] = useState(props.errors || {});

	let checkItem = (e) => {
			if (e === 1) return setSelectedCategoriesCounter(actual => actual+1);
			if (e.target.checked) {
				setSelectedCategoriesCounter(actual => actual+1)
				props.updateCount(1)
			} else {
				setSelectedCategoriesCounter(actual => actual-1)
				props.updateCount(-1)
			}
	}

  return (
    <div className={`ChooseBlock w-100 ${props.isError ? "error" : ""}`}>
    	<div className="d-flex justify-content-between px-3 pt-2 pb-3">
        <span className="ChooseBlock__heading">{props.description}</span>
        <span className="ChooseBlock__counter d-none d-md-inline-block">Выбрано {selectedCategoriesCounter}</span>
      </div>
	    	{props.items.map((item, key) =>
	        <Checkbox checkItem={checkItem} category={props.category} label={item.name} name={props.name} value={item.id} items={props.value}/>
	      )}
    </div>
  );
}

export default ChooseBlock;