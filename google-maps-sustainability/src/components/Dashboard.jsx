import { useMemo } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";

const Dashboard = function () {
  useLoadScript({ googleMapsAPIKey: "AIzaSyAGZoSeRrwH7zI9rR5OUxTGh--4ePQPItA" });

  return (
    <>
      <Map />
    </>
  );
}

function Map() {
  const center = useMemo(() => ({ lat: 44, lng: -80 }), []);
  
  return (
    <GoogleMap zoom={10} center={center} mapContainerClassName="map-container">
      <Marker position={center} />
    </GoogleMap>
  );
}

export default Dashboard;
