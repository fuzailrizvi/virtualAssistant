import React, { createContext, useEffect, useState } from 'react'
import axios from 'axios';
export const userDataContext = createContext()
const UserContext = ({ children }) => {
    // console.log("UserContext mounted or re-rendered");
    const serverUrl = "http://localhost:5000"
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [frontEndImage, setFrontEndImage] = useState(null);
        const [backEndImage, setBackEndImage] = useState(null);
        const[selectedImage, setSelectedImage] = useState(null);

    const handleCurrentUser = async () => {
        try {
            let result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true })
            setCurrentUser(result.data);
            // console.log(result.data);
        } catch (error) {
            console.log(error);

        }finally {
      setLoading(false);
    }
    }
    
    const getGeminiResponse=async (command)=>{
        try {
            const result=await axios.post(`${serverUrl}/api/user/asktoassistant`, { command }, { withCredentials: true });
            return result.data;
            
        } catch (error) {
           console.log('Error fetching Gemini response:', error);
            
        }
    }
    useEffect(() => {
        handleCurrentUser();
    }
        , []);

    const value = {
        serverUrl,currentUser, setCurrentUser,loading, setLoading, frontEndImage, setFrontEndImage,backEndImage, setBackEndImage,selectedImage, setSelectedImage,getGeminiResponse
    }
    return (
        
            <userDataContext.Provider value={value}>
                {children}
            </userDataContext.Provider>
        
    )
}

export default UserContext