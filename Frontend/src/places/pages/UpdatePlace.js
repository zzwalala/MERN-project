import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hooks';
import './PlaceForm.css';
import { useEffect } from 'react';
import Card from '../../shared/components/UIElements/Card';
import { useHttpClient } from '../../shared/hooks/http-hooks';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';


const UpdatePlace = () => {
  const auth = useContext(AuthContext)
  const {isLoading, error, sendrequest, clearError} = useHttpClient()
  const [LoadedPlace, setLoadedPlace] = useState()
  const placeId = useParams().placeId;
  const history = useHistory()
  const [formState, inputHandler, setFormData] = useForm({
    title: {
      value: '',
      isValid: false
    },
    description: {
      value: '',
      isValid: false
    }
  }, false)
  useEffect(() => {
    const fetchPlace = async () => {
      try{
      const responseData = await sendrequest(`${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`)
      setLoadedPlace(responseData.place)
      setFormData({
        title: {
          value: responseData.place.title,
          isValid: true
        },
        description: {
          value: responseData.place.description,
          isValid: true
        }
      }, true)

      } catch(err){console.log(err.message);}
    }
    fetchPlace()
  }, [placeId, sendrequest, setFormData])
  
  
  const placeUpdateSubmitHandler = async event => {
    event.preventDefault()
    try{
    await sendrequest(`${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`, 'PATCH', JSON.stringify({
      title: formState.inputs.title.value,
      description: formState.inputs.description.value
    }),
    {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + auth.token
    })
    history.push('/'+auth.userId+'/places')
  } catch (err){console.log(err.message);}
  }

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!LoadedPlace && !error) {
    return (
      <div className="center">
        <Card>
        <h2>Could not find place!</h2>
        </Card>
      </div>
    );
  }
  
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
  {!isLoading && LoadedPlace && <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
      <Input
        id="title"
        element="input"
        type="text"
        label="Title"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid title."
        onInput={inputHandler}
        initialvalue={LoadedPlace.title}
        initialvalid={true}
      />
      <Input
        id="description"
        element="textarea"
        label="Description"
        validators={[VALIDATOR_MINLENGTH(5)]}
        errorText="Please enter a valid description (min. 5 characters)."
        onInput={inputHandler}
        initialvalue={LoadedPlace.description}
        initialvalid={true}
      />
      <Button type="submit" disabled={!formState.isValid}>
        UPDATE PLACE
      </Button>
    </form>}
    </React.Fragment>
  );
};

export default UpdatePlace;