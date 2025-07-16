import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { userDataContext } from '../context/UserContext';
import { TiThMenu } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";

import aiImage from '../assets/AI.gif';
import userImage from '../assets/USer.gif';

const Home = () => {
  const { currentUser, setCurrentUser, serverUrl, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();

  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState('');
  const [aiText, setAiText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ham, setHam] = useState(false);

  const [assistantStarted, setAssistantStarted] = useState(false);
  const [assistantReady, setAssistantReady] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const isSpeakingRef = useRef(false);
  const isRecognizingRef = useRef(false);
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setCurrentUser(null);
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
      setCurrentUser(null);
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    isSpeakingRef.current = true;
    setIsSpeaking(true);

    utterance.lang = 'hi-IN';
    const voices = synth.getVoices();
    const hindiVoice = voices.find(voice => voice.lang === 'hi-IN');
    if (hindiVoice) utterance.voice = hindiVoice;

    utterance.onend = () => {
      setAiText('');
      // console.log('Finished speaking');
      isSpeakingRef.current = false;
      setIsSpeaking(false);

      if (recognitionRef.current && !isRecognizingRef.current && assistantStarted) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          if (error.name !== 'InvalidStateError') {
            console.error('Error restarting recognition:', error);
          }
        }
      }
    };

    synth.cancel();
    synth.speak(utterance);
  };

  const handleCommand = (data) => {
    const { type, userInput } = data;

    switch (type) {
      case "google_search":
        window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, "_blank");
        break;
      case "youtube_search":
      case "youtube_play":
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, "_blank");
        break;
      case "calculator_open":
        window.open("https://www.google.com/search?q=calculator", "_blank");
        break;
      case "instagram_open":
        window.open("https://www.instagram.com", "_blank");
        break;
      case "facebook_open":
        window.open("https://www.facebook.com", "_blank");
        break;
      case "weather-show":
        window.open("https://www.google.com/search?q=weather", "_blank");
        break;
      default:
        break;
    }
  };

  const speakGreeting = () => {
    // console.log('Attempting to speak greeting...');

    window.speechSynthesis.cancel();

    setTimeout(() => {
      const greeting = new SpeechSynthesisUtterance(`Hello ${currentUser.name}, I am your assistant. How can I help you today?`);
      greeting.lang = 'en-US';
      greeting.rate = 0.9;
      greeting.volume = 1;

      greeting.onstart = () => {
        // console.log('Greeting started speaking');
        isSpeakingRef.current = true;
        setIsSpeaking(true);
      };

      greeting.onend = () => {
        // console.log('Greeting finished speaking');
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        setAssistantReady(true);
      };

      greeting.onerror = (error) => {
        console.error('Greeting speech error:', error);
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        setAssistantReady(true); // CHANGE: Still mark as ready even if greeting fails
      };

      // console.log('Speaking greeting now...');
      window.speechSynthesis.speak(greeting);
    }, 100);
  };

  const startAssistant = () => {
    // console.log('Starting voice assistant...');
    setAssistantStarted(true);
    setAssistantReady(false);

    speakGreeting();

    setTimeout(() => {
      if (recognitionRef.current) {
        safeRecognition();
      }
    }, 3000);
  };

  const stopAssistant = () => {
    // console.log('Stopping voice assistant...');
    setAssistantStarted(false);
    setAssistantReady(false);

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    window.speechSynthesis.cancel();
    setListening(false);
    setIsSpeaking(false);
    setUserText('');
    setAiText('');
    isRecognizingRef.current = false;
    isSpeakingRef.current = false;
  };

  const safeRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current && assistantStarted) {
      try {
        recognitionRef.current.start();
        // console.log('Speech recognition started');
      } catch (error) {
        if (error.name !== 'InvalidStateError') {
          console.error('Error starting speech recognition:', error);
        }
      }
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      // console.log('Recognition started');
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      // console.log('Recognition ended');
      isRecognizingRef.current = false;
      setListening(false);
      if (!isSpeakingRef.current && assistantStarted) {
        setTimeout(safeRecognition, 1000);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== 'aborted' && !isSpeakingRef.current && assistantStarted) {
        setTimeout(safeRecognition, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.resultIndex][0].transcript;
      // console.log('Transcript:', transcript);

      if (transcript.toLowerCase().includes(currentUser.assistantName.toLowerCase())) {
        recognition.stop();
        setUserText(transcript);
        setAiText('');

        const data = await getGeminiResponse(transcript);
        // console.log(data);

        speak(data.response);
        handleCommand(data);
        setUserText('');
        setAiText(data.response);
      }
    };

    const handleVoicesLoaded = () => {
      // console.log('Voices loaded');
      setVoicesLoaded(true);
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = handleVoicesLoaded;
    }

    if (speechSynthesis.getVoices().length > 0) {
      setVoicesLoaded(true);
    }

    const fallback = setInterval(() => {
      if (!isSpeakingRef.current && !isRecognizingRef.current && assistantStarted) {
        safeRecognition();
      }
    }, 10000);

    return () => {
      recognition.abort();
      clearInterval(fallback);
      setListening(false);
      isRecognizingRef.current = false;
      window.speechSynthesis.cancel();
    };
  }, [assistantStarted]);

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#020236] flex justify-center items-center flex-col p-[20px] gap-[15px] relative overflow-hidden'>
      <TiThMenu className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => { setHam(true) }} />

      <div className={`absolute top-0 w-full h-full bg-[#00000070] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out lg:hidden`}>
        <RxCross2 className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => { setHam(false) }} />

        <button className='min-w-[120px] h-[50px] text-black font-semibold bg-white rounded-full text-[19px] hover:cursor-pointer hover:bg-blue-500 hover:text-white transition-all duration-300 ease-in-out'
          onClick={handleLogout}>
          Log Out
        </button>

        <button className='min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full text-[19px] px-[20px] py-[10px] hover:cursor-pointer hover:bg-blue-500 hover:text-white transition-all duration-300 ease-in-out'
          onClick={() => navigate('/customize')}>
          Customize your Assistant
        </button>

        <div className='w-full h-[2px] bg-gray-400'></div>

        <h1 className='text-white font-semibold text-[19px]'>History</h1>

        <div className='w-full h-[400px] overflow-y-auto flex flex-col space-y-[10px]'>
          {currentUser.history?.map((his, i) => (
            <span key={i} className='text-gray-200 text-[18px] break-words'>{his}</span>
          ))}
        </div>
      </div>

      <button className='hidden lg:block mt-[30px] min-w-[120px] h-[50px] text-black font-semibold bg-white rounded-full text-[19px] absolute top-[20px] right-[20px] hover:cursor-pointer hover:bg-blue-500 hover:text-white transition-all duration-300 ease-in-out'
        onClick={handleLogout}>
        Log Out
      </button>

      <button className='hidden lg:block mt-[30px] min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full text-[19px] absolute top-[100px] right-[20px] px-[20px] py-[10px] hover:cursor-pointer hover:bg-blue-500 hover:text-white transition-all duration-300 ease-in-out'
        onClick={() => navigate('/customize')}>
        Customize your Assistant
      </button>

      {!assistantStarted && (
        <div className='flex flex-col items-center gap-[50px] mb-[20px]'>
          <button
            onClick={startAssistant}
            disabled={!voicesLoaded}
            className={`min-w-[180px] h-[60px] font-semibold bg-white rounded-full text-[19px] px-[25px] py-[15px] flex items-center justify-center gap-[10px] transition-all duration-300 ease-in-out ${voicesLoaded
                ? 'text-black hover:cursor-pointer hover:bg-blue-500 hover:text-white'
                : 'text-gray-400 bg-gray-300 cursor-not-allowed'
              }`}
          >
            <span className='text-[24px]'>🎤</span>
            {voicesLoaded ? 'Start Assistant' : 'Loading...'}
          </button>
          <p className='text-gray-300 text-[14px] text-center max-w-[300px]'>
            Click to activate your voice assistant. Say "{currentUser.assistantName}" to interact.
          </p>
        </div>
      )}

      {assistantStarted && (
        <div className='flex flex-col items-center gap-[15px] overflow-hidden'>
          {/* CHANGE: Status indicator and stop button */}
          <div className='flex items-center gap-[15px]'>
            <div className='flex items-center gap-[10px] bg-[#ffffff20] backdrop-blur-sm rounded-full px-[20px] py-[10px]'>
              <div className={`w-[12px] h-[12px] rounded-full ${assistantReady ? 'bg-green-400' : 'bg-yellow-400'} ${assistantReady ? 'animate-pulse' : 'animate-bounce'}`}></div>
              <span className='text-white text-[16px] font-medium'>
                {assistantReady ? 'Assistant Ready' : 'Initializing...'}
              </span>
            </div>

            <button
              onClick={stopAssistant}
              className='min-w-[120px] h-[45px] text-black font-semibold bg-white rounded-full text-[16px] px-[20px] py-[10px] hover:cursor-pointer hover:bg-red-500 hover:text-white transition-all duration-300 ease-in-out flex items-center justify-center gap-[8px]'
            >
              <span className='text-[18px]'>🛑</span>
              Stop
            </button>
          </div>

          <div className={`w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg transition-all duration-300 ${assistantReady
              ? 'border-4 border-green-400 shadow-green-400/50'
              : 'border-4 border-yellow-400 shadow-yellow-400/50'
            }`}>
            <img src={currentUser?.assistantImage} alt="Assistant" className='w-full h-full object-cover' />
          </div>

          <h1 className='text-white text-[18px] font-semibold'>I am {currentUser?.assistantName}</h1>

          <div className='flex flex-col items-center gap-[10px]'>
            <div className={`flex items-center gap-[4px] ${listening ? 'animate-pulse' : ''}`}>
              <div className={`w-[4px] h-[20px] bg-blue-400 rounded-full ${listening ? 'animate-bounce' : ''}`} style={{ animationDelay: '0s' }}></div>
              <div className={`w-[4px] h-[25px] bg-blue-400 rounded-full ${listening ? 'animate-bounce' : ''}`} style={{ animationDelay: '0.1s' }}></div>
              <div className={`w-[4px] h-[20px] bg-blue-400 rounded-full ${listening ? 'animate-bounce' : ''}`} style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className='text-gray-300 text-[14px]'>
              {listening ? 'Listening...' : 'Say your wake word to start'}
            </p>
          </div>
        </div>
      )}

      {assistantStarted && (
        <img
          src={isSpeaking ? userImage : aiImage}
          alt={isSpeaking ? "Responding..." : "Listening..."}
          className='w-[200px]'
        />
      )}

      <div className='min-h-[60px] flex items-center justify-center'>
        <h1 className='text-white text-[18px] font-semibold text-wrap text-center max-w-[400px]'>
          {userText ? userText : aiText ? aiText : assistantStarted ? (assistantReady ? `Say "${currentUser.assistantName}" to start` : "Getting ready...") : "Click Start to begin"}
        </h1>
      </div>
    </div>
  );
};

export default Home;