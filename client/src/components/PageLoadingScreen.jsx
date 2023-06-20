import React from 'react'
import Spinner from 'react-bootstrap/Spinner'

const PageLoadingScreen = () => {
  return (
    <div className="loading-screen">
        <Spinner animation="grow" variant="light" role="status"/>
    </div>	
  )
}

export default PageLoadingScreen