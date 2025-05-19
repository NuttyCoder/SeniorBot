import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import Voice from 'react-native-voice';
import TTS from 'react-native-tts';
import axios from 'axios';

const App = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const startListening = () => {
    Voice.start('en-US');
    Voice.onSpeechResults = (event) => {
      setMessage(event.value[0]); // Capture the spoken words
      fetchResponse(event.value[0]); // Send to backend
    };
  };

  const fetchResponse = async (text) => {
    const res = await axios.get(`http://127.0.0.1:8000/chat?user_message=${text}`);
    setResponse(res.data.response);
    TTS.speak(res.data.response); // Bot speaks the answer
  };

  return (
    <View>
      <Text>Say something to your assistant:</Text>
      <Button title="Start Talking" onPress={startListening} />
      <Text>You said: {message}</Text>
      <Text>Bot says: {response}</Text>
    </View>
  );
};

export default App;
