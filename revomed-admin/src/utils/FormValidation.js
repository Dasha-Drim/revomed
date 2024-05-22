export function FormValidation(formRef) {
	let errors = {};
	let oneRadioChecked = {};
	[...formRef.current.elements].forEach(item => {
    let validationMethods = item.getAttribute('data-validation') ? item.getAttribute('data-validation').split(" ") : [];
    validationMethods.forEach(method => {
      if(method === "notEmpty" && !item.value.length) errors[item.name] = true;
      if(method === "onlyLetters" && !new RegExp("^[а-яА-ЯёЁa-zA-Z -]+$").test(item.value)) errors[item.name] = true;
      if(method === "onlyNums" && !/^\d+$/.test(item.value)) errors[item.name] = true;
      if(method === "email" && !new RegExp("^[-A-z0-9.]+@([A-z0-9][-A-z0-9]+\.)+[A-z]{2,4}$").test(item.value)) errors[item.name] = true;
      
      if(method === "fileAttached" && !item.files.length) errors[item.name] = true;

      if(method === "radioChecked" && !item.checked && !oneRadioChecked[item.name]) errors[item.name] = true;
      else if(method === "radioChecked" && item.checked) {oneRadioChecked[item.name] = true; delete errors[item.name];}

      if(method === "4numbers" && !/[0-9]{4}/.test(item.value)) errors[item.name] = true;
      if(method === "mark" && item.value > 5 && item.value < 1) errors[item.name] = true;

    })
  })
  return errors;
}
