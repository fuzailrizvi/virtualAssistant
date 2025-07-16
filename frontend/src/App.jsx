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
  function App() {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://virtualassistant-k3gj.onrender.com/ping") // replace with your backend URL and a safe route
        .then((res) => console.log("Pinged backend:", res.status))
        .catch((err) => console.error("Ping failed:", err));
    }, 10 * 60 * 1000); // every 10 minutes

    return () => clearInterval(interval); // cleanup on unmount
  }, []);
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
