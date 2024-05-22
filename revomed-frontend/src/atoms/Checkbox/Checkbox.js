import { useState, useEffect } from "react";

// styles
import './Checkbox.scss';

let Checkbox = (props) => {

	//const [selectedCategoriesCounter, setSelectedCategoriesCounter] = useState(0);
	//const [errors, setErrors] = useState({});

	/*let checkItem = (e) => {
		if (e.target.checked) setSelectedCategoriesCounter(actual => actual+1)
		else setSelectedCategoriesCounter(actual => actual-1)
	}*/

	let [checkboxState, setCheckboxState] = useState(false);

 	let updateCheckbox = (e) => {
        !checkboxState ? setCheckboxState(true) : setCheckboxState(false);
        props.checkItem(e);
    }

    useEffect(() => {
    	if (props.items && props.items.find((value) => +value === +props.value)) {
    		setCheckboxState(true);
    		props.checkItem(1);
    	}
    }, [])

  	return (
		<label className="Checkbox">
	        <input type="checkbox" data-category={props.category} checked={checkboxState} data-validation="radioChecked" name={props.name} value={props.value} onChange={(e) => {updateCheckbox(e)}} />
	        <span>{props.label}</span>
	    </label>

  );
}

export default Checkbox;