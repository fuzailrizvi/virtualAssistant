import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../model/user.model.js";
import geminiResponse from "../gemini.js";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user =await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const updateAssistant=async (req,res)=>{
    try {
        const {assistantName, imageURL} = req.body;
        let assistantImage;        
        if(req.file){
            assistantImage=await uploadOnCloudinary(req.file.path);
        }else{
            assistantImage=imageURL;
        }
        const user=await User.findByIdAndUpdate(
            req.userId,
            { assistantName, assistantImage },
            { new: true, runValidators: true }
        ).select('-password');
        return res.status(200).json(user);

    } catch (error) {
      console.error('Error updating assistant:', error);
        res.status(500).json({ message: 'Server error' });   
    }
}

export const askToAssistant = async (req, res) => {
    try {
        const{command}=req.body;
        const user=await User.findById(req.userId)
        user.history.push(command);
        await user.save();
        const userName = user.name;
        const assistantName = user.assistantName;
        const result= await geminiResponse(command, assistantName, userName);
        const jsonMatch = result.match(/{[\s\S]*}/);
        if(!jsonMatch){
            return res.status(400).json({ message: 'Invalid response format from assistant' });
        }
        const gemResult=JSON.parse(jsonMatch[0]);
        const type=gemResult.type;
        switch(type){
            case 'get_date':
                return res.json({
                    type,
                    userInput:gemResult.userInput,
                    response: `Today's date is ${moment().format('YYYY-MM-DD')}`

                });
            case 'get_time':
                return res.json({
                    type,
                    userInput:gemResult.userInput,
                    response: `Current time is ${moment().format('hh:mm A')}`
                });
                case 'get_day':
                return res.json({
                    type,
                    userInput:gemResult.userInput,
                    response: `Today is ${moment().format('dddd')}`
                });
                case 'get_month':
                return res.json({
                    type,
                    userInput:gemResult.userInput,
                    response: `Current month is ${moment().format('MMMM')}`
                });
                case 'google_search':
                    case 'general':
                    case 'youtube_search':
                        case 'youtube_play':
                            case 'calculator_open':
                                case 'instagram_open':
                                    case 'facebook_open':
                                        case 'weather-show':
                                            return res.json({
                                                type,
                                                userInput: gemResult.userInput,
                                                response: gemResult.response
                                            });
            default:
                return res.status(400).json({ message: 'Unknown type from assistant' });
            
        }


    } catch (error) {
        console.error('Error in askToAssistant:', error);
    res.status(500).json({ message: 'Server error' });
    }
};