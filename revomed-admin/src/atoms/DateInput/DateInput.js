import React, { Fragment, useState, useEffect, forwardRef } from "react";
import { KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import ruLocale from "date-fns/locale/ru";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { DateTime } from "luxon";

// styles
import "./DateInput.scss";
/*
  props.value
  props.placeholder
  props.name
*/
function DateInput(props) {
  const [date, setDate] = useState("");

  // ON LOAD PAGE
  useEffect((e) => {
    let arrDate = [];
    if (props.value !== "") {
        setDate(props.value)
      }
  }, [])
  // END OF LOAD PAGE

  let updateDate = (date) => {
    setDate(date)
  }
  
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={ruLocale} >
      <KeyboardDatePicker
        name={props.name}
        className="DateInput"
        clearable
        value={date}
        placeholder={props.placeholder}
        onChange={date => updateDate(date)}
        format="dd/MM/yyyy"
        okLabel="Готово"
        clearLabel="Очистить"
        cancelLabel="Закрыть"
      />
    </MuiPickersUtilsProvider>
  );
}

export default DateInput;