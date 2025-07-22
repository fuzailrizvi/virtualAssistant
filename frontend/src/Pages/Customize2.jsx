import React, { useContext, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import axios from 'axios';
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

const Customize2 = () => {
   
    
    const { currentUser, backEndImage, selectedImage, serverUrl, setCurrentUser } = useContext(userDataContext);
    const [assistantName, setAssistantName] = useState(currentUser?.assistantName || "");
    const [loading, setLoading] = useState(false);
    const navigate=useNavigate();
    const handleUpdateAssistant = async () => {
        setLoading(true);
        try {
            let formData = new FormData();
            formData.append("assistantName", assistantName);
            if (backEndImage) {
                formData.append("assistantImage", backEndImage);
            } else {
                formData.append("imageURL", selectedImage);
            }
            const result = await axios.post(`${serverUrl}/api/user/update`, formData, { withCredentials: true });
            console.log(result.data);
            setCurrentUser(result.data);
            navigate('/');

        } catch (error) {
            console.log(error);


        } finally {
            setLoading(false);
        }
    }
    return (
        <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#020236] flex justify-center items-center flex-col p-[20px] relative'>
        <IoMdArrowRoundBack className='absolute top-[30px] left-[30px] text-white w-[25px] h-[25px] cursor-pointer'
        onClick={()=>{navigate('/customize')}}
        />
            <h1 className='text-white text-[30px] text-center mb-[30px]'>Enter Your <span className='text-blue-200'>Assistant Name</span></h1>
            <input type="text" placeholder='Example: John' className='w-full max-w-[600px] h-[60px] bg-transparent border-b-2 border-blue-400 outline-none text-white placeholder:text-white px-[20px] py-[10px] rounded-b' value={assistantName} onChange={(e) => { setAssistantName(e.target.value) }} />
            {assistantName && <button className='mt-[30px] min-w-[300px] h-[60px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer'
                disabled={loading}
                onClick={() => {
                    handleUpdateAssistant();


                }}>{!loading ? "Finally!! Create Your Assistant" : "Loading...."}</button>}

        </div>
    )
}

export default Customize2
