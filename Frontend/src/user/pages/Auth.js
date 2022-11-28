import React from "react";
import Card from "../../shared/components/UIElements/Card";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
} from "../../shared/util/validators";
import { useContext } from "react";
import { AuthContext } from "../../shared/context/auth-context";
import { useState } from "react";
import { useForm } from "../../shared/hooks/form-hooks";
import "./Auth.css";
import { VALIDATOR_REQUIRE } from "../../shared/util/validators";
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import { useHttpClient } from "../../shared/hooks/http-hooks";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";


const Auth = () => {
  const auth = useContext(AuthContext)
  const [isLoginMode, setIsLogin] = useState(true);
  const {isLoading, error, sendrequest, clearError} = useHttpClient()

  const [formState, inputHandler, setFormData] = useForm({
    email: {
      value: "",
      isValid: false,
    },
    password: {
      value: "",
      isValid: false,
    },
  });

  const authSubmitHandler = async (event) => {
    event.preventDefault();
    // console.log(formState.inputs);
    
    if (isLoginMode){
      try{
        
        const respnseData = await sendrequest(`${process.env.REACT_APP_BACKEND_URL}/users/login`, 'POST', JSON.stringify({
          email: formState.inputs.email.value,
          password: formState.inputs.password.value
        }),
        {
          'Content-Type': 'application/json'
        }
      )
      auth.login(respnseData.userId, respnseData.token);
      } catch (err) {
        console.log(err.message);
      }
    } else {
      try{
        const formData = new FormData()
        formData.append('email', formState.inputs.email.value)
        formData.append('name', formState.inputs.name.value)
        formData.append('password', formState.inputs.password.value)
        formData.append('image', formState.inputs.image.value)

        const respnseData = await sendrequest(`${process.env.REACT_APP_BACKEND_URL}/users/signup`, 'POST', formData
      )
      auth.login(respnseData.userId, respnseData.token);
    } catch (err) {
      console.log(err)
    }
  }
  
    
  };
  
  const switchModeHandler = () => {
      if (!isLoginMode){
          setFormData({
            ...formState.inputs,
              name: undefined,
              image: undefined
          }, formState.inputs.email.isValid && formState.inputs.password.isValid)
      }
      else {
        setFormData({
            ...formState.inputs,
            name:{
                value: '',
                isValid: false
            },
            image:{
              value: null,
              isValid: false
          }
        }, false)
      }
    setIsLogin((prevMode) => !prevMode);
  };

  const errorHandler = () => {
    clearError()
  }

  return (
    <React.Fragment>
    <ErrorModal error={error} onClear={errorHandler}/>
    <Card className="authentication">
      {isLoading && <LoadingSpinner asOverlay />}
      <h2>login required</h2>
      <hr />
      <form onSubmit={authSubmitHandler}>
        {!isLoginMode && (
          <Input
            element="input"
            id="name"
            type="text"
            label="Username"
            validators={[VALIDATOR_REQUIRE()]}
            errorText = 'Please enter a name'
            onInput={inputHandler}
          />
        )}
        {!isLoginMode && <ImageUpload onInput={inputHandler} center id='image' errorText='PLEASE PROVIDE ONE IMAGE'/>}
        <Input
          id="email"
          element="input"
          type="email"
          label="E-Mail"
          validators={[VALIDATOR_EMAIL()]}
          errorText="Please enter a valid email address"
          onInput={inputHandler}
        />
        <Input
          id="password"
          element="input"
          type="password"
          label="Password"
          validators={[VALIDATOR_MINLENGTH(6)]}
          errorText="Please enter a valid password (6 characters)"
          onInput={inputHandler}
        />
        <Button type="submit" disabled={!formState.isValid}>
          {isLoginMode ? "LOGIN" : "SIGNUP"}{" "}
        </Button>
      </form>

      <Button inverse onClick={switchModeHandler}>
        SWITCH TO {isLoginMode ? "SIGNUP" : "LOGIN"}
      </Button>
    </Card>
    </React.Fragment>
  );
  
};

export default Auth;
