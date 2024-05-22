import { useState, useEffect } from "react";

// graphics
import attachFileIcon from './attachFileIcon.svg';
import crossIcon from './crossIcon.svg';

// styles
import './FileUploadInput.scss';

let FileUploadInput = (props) => {
    /*
    props.label - label
    props.name - input's name attribute
    props.validation - validation method
    props.errors - validation errors
    props.maxLength - maximum number of attached files
    props.mergeAttaches
    props.updateInput
    */
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [errors, setErrors] = useState(props.errors);
    const [errorText, setErrorText] = useState(null);

    // ON CHANGE INPUT TYPE FILE
    let uploadFiles = (input) => {
        let filesArray = Array.from(input.target.files);
        filesArray = filesArray.length >= props.maxLength ? filesArray.slice(0, props.maxLength) : filesArray;
        //setUploadedFiles(filesArray);
        setErrors(null);
        setErrorText(null)

        if (props.minWidth && props.minHeight) {
            if (input.target.files[0]) {
                let reader = new FileReader();
                reader.onload = () => {
                    var image = new Image();
                    image.src = reader.result;
                    image.onload = function() {
                        if ((image.width >= props.minWidth) && (image.height >= props.minHeight)) {
                            setUploadedFiles(filesArray);
                        } else {
                            setErrorText("Неправильные размеры файла")
                        }
                    };

                }
            	reader.readAsDataURL(input.target.files[0]);
            }
        } else {
            setUploadedFiles(filesArray);
            setErrors(null);
        }

        if (props.updateInput) props.updateInput();
    }

    // END OF ON CHANGE INPUT TYPE FILE

    // ON DELETE FILES
    let deleteUploadedFile = (key) => {
        setUploadedFiles(uploadedFiles.filter(p => p.lastModified !== key));
    }
    let deleteAllFiles = () => {
        setUploadedFiles([]);
    }
    // END OF ON DELETE FILES

    // ERRORS SETTER
    useEffect(() => {
        setErrors(props.errors);
    }, [props.errors])
    // END OF ERRORS SETTER
    return (
        <div className="FileUploadInput row">
        	{errorText && <div className="col-8 error-text"><p>{errorText}</p></div>}
			<div className={`justify-content-between ${uploadedFiles.length === 0 ? 'col-8' : 'col-lg-4'} `}>
				<label className={`FileUploadInput__start-attach d-flex align-items-center justify-content-between py-4 px-3 ${errors && errors.hasOwnProperty(props.name) && errors[props.name] ? "error" : ""}`}>
					<input type="file" name={props.name} multiple={props.maxLength !== 1} onChange={uploadFiles} data-validation={props.validation} />
					{props.label}
					<img className="pr-3 pl-2" src={attachFileIcon} alt="" />
				</label>
			</div>
			{!props.mergeAttaches ? uploadedFiles.map((item, key) => 
			<div key={item.lastModified} className={uploadedFiles.length === 1 ? 'col-lg-4 mt-3 mt-lg-0' : uploadedFiles.length === 2 ? 'col-lg-2 mt-3 mt-lg-0' : ''}>
				<div className="FileUploadInput__uploaded-item py-4 px-3">
					<span>{item.name}</span>
					<button onClick={() => deleteUploadedFile(item.lastModified)}><img src={crossIcon} alt="" /></button>
				</div>
			</div>
			) : uploadedFiles.length ?
			<div className="col-lg-4 mt-3 mt-lg-0">
				<div className="FileUploadInput__uploaded-item py-4 px-3">
					<span>Загружено файлов: {uploadedFiles.length}</span>
					<button onClick={() => deleteAllFiles()}><img src={crossIcon} alt="" /></button>
				</div>
			</div>
			: ""}
		</div>
    );
}

export default FileUploadInput;