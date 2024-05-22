// styles
import "./Textarea.scss";

let Textarea = (props) => {
  /*
  props.placeholder - placeholder
  props.name - input"s name attribute
  props.value - value
  */

  return (
    <label className="Textarea w-100">
      <textarea readOnly={props.readOnly ? true : false} name={props.name} placeholder={props.placeholder} defaultValue={props.value || ""}></textarea>
    </label> 
  );
}

export default Textarea;