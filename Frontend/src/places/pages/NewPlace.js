import React from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
// import { useReducer } from "react/cjs/react.development";
import Input from "../../shared/components/FormElements/Input";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import Button from "../../shared/components/FormElements/Button";
import "./NewPlace.css";
import { useForm } from "../../shared/hooks/form-hooks";
import { useHttpClient } from "../../shared/hooks/http-hooks";
import { AuthContext } from "../../shared/context/auth-context";
import { useContext } from "react";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";

const NewPlace = () => {
  const auth = useContext(AuthContext)
  const {isLoading, error, sendrequest, clearError} = useHttpClient()
  const [formState, InputHandler] =  useForm({
    title: {
      vlaue: "",
      isValid: false,
    },
    description: {
      vlaue: "",
      isValid: false,
    },
    address: {
        value: '',
        isValid: false
    },
    image: {
      value: null,
      isValid: false
  }
  }, false)
  const history = useHistory()
  const placeSubmitHandler = async event => {
    event.preventDefault()
    try {
      const formData = new FormData()
      formData.append('title', formState.inputs.title.value)
      formData.append('description', formState.inputs.description.value)
      formData.append('address', formState.inputs.address.value)
      formData.append('image', formState.inputs.image.value)
      // console.log(auth.userId);
      console.log(process.env.REACT_APP_BACKEND_URL+'/places');
    await sendrequest(process.env.REACT_APP_BACKEND_URL+'/places', 'POST', formData, {Authorization: 'Bearer ' + auth.token})
    history.push('/')
  } catch (err){
    console.log(err.message);
  }
}
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}
    <form className="place-form" onSubmit={placeSubmitHandler}>
      <Input
        id="title"
        element="input"
        type="text"
        label="Title"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid title"
        onInput={InputHandler}
      />
      <Input
        id="description"
        element="textarea"
        label="Description"
        validators={[VALIDATOR_MINLENGTH(6)]}
        errorText="Please enter a valid description (6 characters)"
        onInput={InputHandler}
      />
      <Input
        id="address"
        element="input"
        label="Address"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid address"
        onInput={InputHandler}
      />
      {/* <input /> */}
      <ImageUpload id='image' center onInput={InputHandler} errorText='PLEASE PROVIDE ONE IMAGE' />
      <Button type='submit' disabled={!formState.isValid}> ADD PLACE </Button>
    </form>
    </React.Fragment>
  );
};
export default NewPlace;
