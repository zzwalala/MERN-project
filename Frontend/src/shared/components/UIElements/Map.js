import React, {useRef, useEffect} from "react";
import './Map.css'

const Map = props => {
    const mapref = useRef()

    const {center, zoom} = props
    useEffect(() => { const map = new window.google.maps.Map(mapref.current, {
        center: center,
        zoom: zoom
    });

    new window.google.maps.Marker({position: center, map: map})}, [center, zoom])
   

    return <div ref={mapref} className={`map ${props.className}`} style={props.style}>

    </div>
}

export default Map