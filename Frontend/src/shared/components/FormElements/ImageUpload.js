import React from "react";
import "./ImageUpload.css";
import Button from "./Button";
import { useRef, useState, useEffect } from "react";


const ImageUpload = (props) => {

    const [file, setFile] = useState()
    const [previewUrl, setpreviewUrl] = useState()
    const [isValid, setisValid] = useState(false)

    useEffect(() => {
        if (!file) {
            return
        }else{
            const filereader = new FileReader()
            filereader.onload = () => {
                setpreviewUrl(filereader.result)
            }
            filereader.readAsDataURL(file)
        }
    }, [file])

    const filePickeref = useRef()

    const pickImageHandler = () => {
        filePickeref.current.click()
    }

    const pickedHandler = event => {
        let pickedFile
        let fileIsValid = isValid
        if (event.target.files && event.target.files.length === 1){
            pickedFile = event.target.files[0]
            setFile(pickedFile)
            setisValid(true)
            fileIsValid = true
        }else{
            setisValid(false)
            fileIsValid = false
        }
        props.onInput(props.id, pickedFile, fileIsValid)
    }
  return (
    <div className="form-control">
      <input
        type="file"
        ref={filePickeref}
        id={props.id}
        style={{ display: "none" }}
        accept="./jpg,.jpeg,.png"
        onChange={pickedHandler}
      />
      <div className={`image-upload ${props.center && "center"}`}>
        <div className="image-upload__preview">
          {previewUrl && <img src={previewUrl} alt="preview" />}
          {!previewUrl && <p>Please pick one image</p>}
        </div>
        <Button type='button' onClick={pickImageHandler}>PICK IMAGE FOR AVATAER</Button>
      </div>
      <div className={`image-upload ${props.center && "center"}`}>
      {!isValid && <p >{props.errorText}</p>}
      </div>
    </div>
  );
};

export default ImageUpload;
