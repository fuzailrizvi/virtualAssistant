import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './Pages/SignUp'
import SignIn from './Pages/SignIn'
import { Toaster } from 'react-hot-toast'
import Customize from './Pages/Customize'
import { userDataContext } from './context/UserContext'
import Home from './Pages/Home'
import LoadingSpinner from './Pages/LoadingSpinner'
import Customize2 from './Pages/Customize2'

const App = () => {
  const { currentUser, setCurrentUser, loading, setLoading } = useContext(userDataContext);
  return loading ? (
    <>
      <LoadingSpinner />
    </>
  ) : (
    <>
      <Toaster position='top-center' reverseOrder={false} />

      <Routes>
        <Route path="/" element={(currentUser?.assistantImage && currentUser?.assistantName) ? <Home /> : <Navigate to={'/customize'} />} />

        <Route path="/signup" element={!currentUser ? <SignUp /> : <Navigate to={'/'} />} />
        <Route path="/signin" element={!currentUser ? <SignIn /> : <Navigate to={'/'} />} />
        <Route path="/customize" element={currentUser ? <Customize /> : <Navigate to={'/signin'} />} />
        <Route path="/customize2" element={currentUser ? <Customize2 /> : <Navigate to={'/signin'} />} />

      </Routes>
    </>)
}

export default App