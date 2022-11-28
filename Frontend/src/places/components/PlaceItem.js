import React from "react";
import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import { useState } from "react";
import Modal from "../../shared/components/UIElements/Modal";
import Map from "../../shared/components/UIElements/Map";
import "./PlaceItem.css";
import { useContext } from "react";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hooks";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";


const PlaceItem = (props) => {
  const {isLoading, error, sendrequest, clearError} = useHttpClient()
  const auth = useContext(AuthContext)
  const [showMap, setSHowMap] = useState(false);
  const [showConfirModal, setShowConfirmModal] = useState(false)
  const openMap = () => setSHowMap(true);
  const closemap = () => setSHowMap(false);
  
  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false)
    try{
    await sendrequest(`${process.env.REACT_APP_BACKEND_URL}/places/${props.id}`, 'DELETE', null, {Authorization: 'Bearer ' + auth.token})
    props.onDelete(props.id)
    }catch(err){console.log(err.message);}
  }
  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true)
  }
  const cancelDeleteWarningHandler = () => {
    setShowConfirmModal(false)
  }
  
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />

      <Modal
        show={showMap}
        onCancel={closemap}
        header={props.address}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={closemap}>Close</Button>}
      >
        <div className='map-container'>
          <Map center={props.coordinates} zoom={16} />
        </div>
      </Modal>
      <Modal show={showConfirModal} onCancel={cancelDeleteWarningHandler} header='R U sure?' footerClass='place-item__modal-actions' footer={
        <React.Fragment>
          <Button onClick={cancelDeleteWarningHandler} inverse>Cancel</Button>
          <Button onClick={confirmDeleteHandler} danger>DELETE</Button>
        </React.Fragment>
      }>
        <p> Do u want to proceed and delete this place?</p>
      </Modal>
      <li className="place-item">
        <Card className="place-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="place-item__image">
            <img src={`${process.env.REACT_APP_BACKEND_ASSET_URL}/${props.image}`} alt={props.title} />
          </div>
          <div className="place-item__info">
            <h2>{props.title}</h2>
            <h3>{props.address}</h3>
            <p>{props.description}</p>
          </div>
          <div className="place-item__actions">
            <Button inverse  onClick={openMap}>VIEW ON MAP</Button>

            {auth.userId === props.creatorId && <Button to={`/places/${props.id}`}>EDIT</Button>}
            {auth.userId === props.creatorId  && <Button onClick={showDeleteWarningHandler} danger>DELETE</Button>}
          </div>
        </Card>
      </li>
    </React.Fragment>
  );
};

export default PlaceItem;
