import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
// import PlaceItem from "../components/PlaceItem";
import PlaceList from "../components/PlaceList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { useHttpClient } from "../../shared/hooks/http-hooks";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

const UserPlaces = () =>{
    const [loadedPlaces, setLoadedPlaces] = useState()

    const {isLoading, error, sendrequest, clearError} = useHttpClient()
    const userId = useParams().userId;
    useEffect(() => {
        const fetchPlaces = async () => {
            try{
                console.log(process.env.REACT_APP_BACKEND_URL);
            const responseData = await sendrequest(`${process.env.REACT_APP_BACKEND_URL}/places/user/${userId}`)
            setLoadedPlaces(responseData.places)
            } catch (err){console.log(err.message);}
        }
        fetchPlaces()
    }, [sendrequest, userId])

    const placeDeleteHandler = (deletedPlaceId) => {
        setLoadedPlaces(prevPlaces => prevPlaces.filter(place => place.id !== deletedPlaceId))
    }

    return (
        <React.Fragment>
        <ErrorModal error={error} onClear={clearError} />
        {isLoading && (
            <div className="center">
                <LoadingSpinner />
            </div>
        )
        }
        
    {!isLoading && loadedPlaces &&<PlaceList items={loadedPlaces} onDeletePlace={placeDeleteHandler}/>}
    </React.Fragment>)
};

export default UserPlaces