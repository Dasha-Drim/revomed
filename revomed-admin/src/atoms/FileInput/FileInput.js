import { useState, useEffect } from "react";

import uploadFileIcon from './uploadFileIcon.svg';
import './FileInput.scss';

let FileInput = (props) => {
	/*
	props.label - label
	props.name - input's name attribute
	props.validation - validation method
	props.errors - validation errors
	*/

	let [currrentFile, setCurrrentFile] = useState(null);
    let [uploadedPhotoProfileStyles, setUploadedPhotoProfileStyles] = useState({});



	// UPLOAD FILES
    let [uploadedPhotoProfileName, setUploadedPhotoProfileName] = useState(null);
    let readURL = (input) => {
        console.log(input.target.files)
        if (input.target.files[0]) {
            setCurrrentFile(input.target.files[0])
            let file = input.target.files[0];
            let reader = new FileReader();
            reader.onload = (e) => {
                setUploadedPhotoProfileStyles({
                    "backgroundImage": "url(" + e.target.result + ")",
                    "backgroundSize": "cover",
                    "backgroundPosition": "center",
                    "backgroundRepeat": "no-repeat"
                })
                setUploadedPhotoProfileName(input.target.files[0].name);
            }
            reader.readAsDataURL(input.target.files[0]);
        }
    }
    // END OF UPLOAD FILES

    useEffect(() => {
    	if (props.value) {
    		 setUploadedPhotoProfileStyles({
                    "backgroundImage": "url(" + props.value + ")",
                    "backgroundSize": "cover",
                    "backgroundPosition": "center",
                    "backgroundRepeat": "no-repeat"
                })
    	}
    }, [props.value])


  return (

		<div className="FileInput" style={uploadedPhotoProfileStyles}>
			<label className="file">
				<input type="file" name={props.name} className="file-input" onChange={(e) => readURL(e)}/>
				<img src={uploadFileIcon} alt=""/>
			</label>
		</div>

  );
}

export default FileInput;
