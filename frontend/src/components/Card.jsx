import React, { useContext } from 'react'
import { userDataContext } from '../context/UserContext';

const Card = ({image}) => {
            const{serverUrl,currentUser, setCurrentUser,loading, setLoading, frontEndImage, setFrontEndImage,backEndImage, setBackEndImage,selectedImage, setSelectedImage}=useContext(userDataContext);
    
  return (
    <div className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#030326] border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white ${selectedImage==image?"border-4 border-white shadow-2xl shadow-blue-950":null}`} 
    onClick={()=>{setSelectedImage(image)
      setBackEndImage(undefined)
    setFrontEndImage(null)
    }}>
       <img src={image} alt="Card Image" className='h-full object-cover' /> 
    </div>
  )
}

export default Card