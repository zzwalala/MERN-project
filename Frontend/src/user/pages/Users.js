import React, { useEffect, useState } from "react";
import UserList from "../components/UsersList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner"; 
import { useHttpClient } from "../../shared/hooks/http-hooks";

const Users = () => {
  const {isLoading, error, sendrequest, clearError} = useHttpClient()
  const [loaderUsers, setLoaderUsers] = useState()
  
  useEffect(() => {
    const fetchUsers = async () => {
    try{
    const response = await sendrequest(`${process.env.REACT_APP_BACKEND_URL}/users`)
    setLoaderUsers(response.users)
    } catch (err) {
    }
    }
    fetchUsers()
  }, [sendrequest])

  return( 
    
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
  {!isLoading && loaderUsers &&<UserList items={loaderUsers} />}
  </React.Fragment>
  )
};

export default Users;
