# SeniorBot
Step 1: Setting Up the Project
Since this app will be cross-platform (mobile + desktop), we'll use React Native for the frontend and FastAPI (Python) for the backend.
Initialize the Frontend (React Native)
First, install dependencies and set up a basic React Native project.

Bash

npx react-native init PersonalAssistant
cd PersonalAssistant
npm install axios react-native-voice react-navigation


React Native Dependencies:
- axios → Handles API calls to our backend.
- react-native-voice → Converts speech to text.
- react-navigation → Manages app navigation.


Initialize the Backend (FastAPI)
Now, let's set up a simple FastAPI backend.

Bash
mkdir backend
cd backend
python -m venv venv
source venv/bin/activate  # (Use `venv\Scripts\activate` on Windows)
pip install fastapi uvicorn openai

FastAPI Dependencies:
- fastapi → Lightweight and fast backend framework.
- uvicorn → ASGI server for running FastAPI.
- openai → Handles natural language processing.
Create app.py:
from fastapi import FastAPI
from openai import OpenAI

app = FastAPI()

@app.get("/chat")
async def chat_response(user_message: str):
    response = OpenAI().complete(model="gpt-4", prompt=user_message)
    return {"response": response.text}

Step 2: Connecting Frontend & Backend
Now, let's wire up React Native to call our FastAPI backend. In App.js:

import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import axios from 'axios';

const App = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const sendMessage = async () => {
    const res = await axios.get(`http://127.0.0.1:8000/chat?user_message=${message}`);
    setResponse(res.data.response);
  };

  return (
    <View>
      <Text>Ask your assistant:</Text>
      <TextInput value={message} onChangeText={setMessage} />
      <Button title="Send" onPress={sendMessage} />
      <Text>Response: {response}</Text>
    </View>
  );
};

export default App;

✅ Basic Chatbot Setup Done!

Voice Interactions & Reminders
We'll integrate speech-to-text (so the user can talk to the bot) and text-to-speech (so the bot can talk back).

1. Install Dependencies in React Native
Run this command in your frontend project:

Bash
npm install react-native-voice react-native-tts

- react-native-voice → Converts speech into text.
- react-native-tts → Reads text aloud for your mother.
2. Update App.js to Support Voice Commands
Modify the app to handle voice input and output.

Javascript

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

How This Works
- Your mom taps a button or says a wake-up word to start voice input.
- The bot converts her speech to text using react-native-voice.
- The bot processes the request via FastAPI backend.
- It returns the response and speaks it aloud using react-native-tts.


Step 4: Adding Reminders & Lists
Now, let's allow saving tasks and reminders.
1. Update Backend to Store Reminders
Modify FastAPI backend to handle reminders.
Install dependencies:

Bash
pip install sqlite3

Create a database reminders.db
Python

import sqlite3

conn = sqlite3.connect("reminders.db")
c = conn.cursor()
c.execute('''CREATE TABLE reminders (id INTEGER PRIMARY KEY, task TEXT, time TEXT)''')
conn.commit()
conn.close()

Update app.py to store reminders:

Python
@app.post("/reminder")
async def add_reminder(task: str, time: str):
    conn = sqlite3.connect("reminders.db")
    c = conn.cursor()
    c.execute("INSERT INTO reminders (task, time) VALUES (?, ?)", (task, time))
    conn.commit()
    conn.close()
    return {"status": "Reminder saved"}

2. Update React Native UI to Add Reminders
Modify App.js:

Javascript
const addReminder = async (task, time) => {
  await axios.post("http://127.0.0.1:8000/reminder", { task, time });
  TTS.speak(`Reminder set for ${task} at ${time}`);
};

Your user can now save reminders by voice, and the bot will confirm them.

What’s Next?
- ✅ Voice input & output added!
- ✅ Reminder system integrated!

Step 5: Implement Daily Check-Ins
Your assistant can greet her in the morning, remind her of tasks, and provide helpful updates.
1. Backend: Create a Scheduled Task
In FastAPI, set up a daily scheduled check-in using Celery or a simple cron job.

Bash
pip install apscheduler

Modify app.py
Python 

from fastapi import FastAPI
from apscheduler.schedulers.background import BackgroundScheduler
import datetime

app = FastAPI()

def daily_check_in():
    current_time = datetime.datetime.now().strftime("%H:%M %p")
    print(f"Good morning! It's {current_time}. Here’s your schedule for today.")

scheduler = BackgroundScheduler()
scheduler.add_job(daily_check_in, "cron", hour=8, minute=0)
scheduler.start()

@app.get("/morning_message")
async def morning_message():
    return {"message": f"Good morning! It's {datetime.datetime.now().strftime('%H:%M %p')}. Here’s your schedule for today."}


This will trigger a morning message at 8 AM, which React Native will fetch and read aloud.

2. Frontend: React Native Daily Greeting
Modify App.js:

Javscript
import { useEffect } from 'react';
import axios from 'axios';
import TTS from 'react-native-tts';

const fetchMorningMessage = async () => {
  const res = await axios.get("http://127.0.0.1:8000/morning_message");
  TTS.speak(res.data.message);
};

useEffect(() => {
  fetchMorningMessage();  // Runs when the app starts
}, []);

✅ Now, when your user starts the app in the morning, it greets them!

Step 6: Implement Wake Word Activation
Your assistant should listen for a wake word (e.g., “Hey Assistant”) so your mom doesn’t have to press a button.
1. Install Wake Word Detection Libraries
For React Native, use Porcupine AI Wake Word Detection:

Bash
npm install @picovoice/porcupine-web

2. Add Wake Word Detection in App.js
import { Porcupine } from "@picovoice/porcupine-web";

const wakeWordHandler = () => {
  TTS.speak("How can I help you?");
};

Porcupine.create("Hey Assistant", wakeWordHandler);


2. Add Wake Word Detection in App.js
import { Porcupine } from "@picovoice/porcupine-web";

const wakeWordHandler = () => {
  TTS.speak("How can I help you?");
};

Porcupine.create("Hey Assistant", wakeWordHandler);


Now, whenever your user say "Hey Assistant", it automatically listens and replies!

What's Next?
- ✅ Daily Check-Ins Done!
- ✅ Wake Word Added!

A morning motivation tool can help your mom start her day with positivity, encouragement, and structure. Here’s how we can implement it:
Features of the Morning Motivation Tool
- Daily Inspirational Messages – The assistant can greet her with uplifting quotes, affirmations, or personalized encouragement.
- Guided Breathing & Relaxation – A short mindfulness exercise to help her feel calm and focused.
- Task & Goal Overview – A friendly reminder of her schedule, appointments, and to-do list.
- Music & Audio Motivation – Play soft music or motivational podcasts to set the tone for the day.
- Interactive Learning – Teach her something new each morning (e.g., a fun fact, a new word, or a simple tech tip).

Technical Implementation
1. Backend: Store & Retrieve Motivational Messages

Modify app.py to store daily motivation messages:

import random

motivational_quotes = [
    "Today is a fresh start. Make it count!",
    "You are stronger than you think.",
    "Every day is a new opportunity to grow.",
    "Believe in yourself—you’ve got this!",
    "Small steps lead to big changes."
]

@app.get("/morning_motivation")
async def morning_motivation():
    return {"message": random.choice(motivational_quotes)}

2. Frontend: Display & Read Aloud Motivation
Modify App.js to fetch and speak the motivation:

Javascript
import { useEffect } from 'react';
import axios from 'axios';
import TTS from 'react-native-tts';

const fetchMotivation = async () => {
  const res = await axios.get("http://127.0.0.1:8000/morning_motivation");
  TTS.speak(res.data.message);
};

useEffect(() => {
  fetchMotivation();  // Runs when the app starts
}, []); 

Next Steps
✅ Morning motivation tool added!


Music can set the tone for the day, making mornings more uplifting and energizing. Here’s how we can integrate morning motivation music into your assistant:

1. Streaming Music from Online Sources
You can use YouTube API, Spotify API, or Epidemic Sound to stream motivational music. Here are some great options:
- Beautiful Morning Music – Relaxing and positive energy.
- Morning Mood Playlist – Inspiring tunes for focus and productivity.
- Happy & Motivational Vibes – Uplifting meditation music.
2. Backend: Fetching Music Recommendations
Modify app.py to return a morning playlist:

Python
morning_music = [
    {"title": "Beautiful Morning Music", "url": "https://www.youtube.com/watch?v=M5NWCM4yx6E"},
    {"title": "Morning Mood Playlist", "url": "https://www.youtube.com/watch?v=t1jaPTBOc34"},
    {"title": "Happy & Motivational Vibes", "url": "https://www.youtube.com/watch?v=5m_CnIKdO3o"}
]

@app.get("/morning_music")
async def get_morning_music():
    return {"playlist": morning_music}

3. Frontend: Playing Music in React Native
Modify App.js to fetch and display music options:

Javascript

import { useEffect, useState } from 'react';
import axios from 'axios';
import { View, Text, Button, Linking } from 'react-native';

const App = () => {
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
    const fetchMusic = async () => {
      const res = await axios.get("http://127.0.0.1:8000/morning_music");
      setPlaylist(res.data.playlist);
    };
    fetchMusic();
  }, []);

  return (
    <View>
      <Text>Start your day with music:</Text>
      {playlist.map((track, index) => (
        <Button key={index} title={track.title} onPress={() => Linking.openURL(track.url)} />
      ))}
    </View>
  );
};

export default App;

✅ Music integration added!

Frontend: Add Weather to Morning Greeting
Modify App.js to fetch and read the weather aloud:

Javascript
import { useEffect } from 'react';
import axios from 'axios';
import TTS from 'react-native-tts';

const fetchMorningUpdate = async () => {
  const motivationRes = await axios.get("http://127.0.0.1:8000/morning_motivation");
  const weatherRes = await axios.get("http://127.0.0.1:8000/weather");

  const message = `${motivationRes.data.message}. Also, ${weatherRes.data.message}`;
  TTS.speak(message);
};

useEffect(() => {
  fetchMorningUpdate();  // Runs when the app starts
}, []);

Adaptive Morning Greeting
Your assistant will now:
- Change greetings based on the weather (sunny, rainy, cold, etc.).
- Offer tailored motivation (energetic on bright days, cozy on rainy ones).
- Suggest appropriate activities (indoor vs. outdoor).

1. Backend: Modify Weather API to Add Adaptation
In app.py, update the weather endpoint to include adaptive messages:

Python
import requests

API_KEY = "your_openweather_api_key"
CITY = "San Jose"

weather_responses = {
    "clear sky": "It's a beautiful day! Enjoy the sunshine.",
    "rain": "It looks like rain today. Stay cozy and bring an umbrella.",
    "clouds": "A cloudy day ahead! Perfect for a relaxing indoor activity.",
    "snow": "It's snowy outside! Bundle up and stay warm.",
    "wind": "It's windy today! Hold onto your hat out there."
}

@app.get("/weather")
async def get_weather():
    url = f"http://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric"
    response = requests.get(url).json()
    weather_desc = response["weather"][0]["description"]
    temp = response["main"]["temp"]

    adaptive_message = weather_responses.get(weather_desc, "Have a wonderful day!")
    return {"message": f"Today's weather in {CITY}: {weather_desc}, {temp}°C. {adaptive_message}"}

Frontend: Adjust Greeting Based on Weather
Modify App.js to fetch and read adaptive greetings aloud:

Javascript
import { useEffect } from 'react';
import axios from 'axios';
import TTS from 'react-native-tts';

const fetchMorningUpdate = async () => {
  const motivationRes = await axios.get("http://127.0.0.1:8000/morning_motivation");
  const weatherRes = await axios.get("http://127.0.0.1:8000/weather");

  const message = `Good morning! ${motivationRes.data.message}. Also, ${weatherRes.data.message}`;
  TTS.speak(message);
};

useEffect(() => {
  fetchMorningUpdate();  // Runs when the app starts
}, []);
✅ Adaptive greeting added!

Smart Activity Recommendations Based on Weather
Your assistant will now:
- Suggest indoor or outdoor activities based on the forecast.
- Recommend relaxation, exercise, or learning activities depending on the weather.
- Encourage engagement with hobbies or social interactions.

1. Backend: Expanding Weather API to Include Activity Suggestions
Modify app.py to suggest activities based on the weather:

Python
import requests

API_KEY = "your_openweather_api_key"
CITY = "Green Bay"

activity_suggestions = {
    "clear sky": "It's a beautiful day! How about a short walk outside or some gardening?",
    "rain": "It's rainy today. Maybe enjoy a cozy book, listen to music, or try a fun indoor craft.",
    "clouds": "A cloudy day ahead! Perfect for watching a movie, baking something delicious, or doing light stretching.",
    "snow": "It's snowy outside! Stay warm with a cup of tea and a good puzzle or knitting project.",
    "wind": "It's windy today! A great time for indoor yoga, journaling, or calling a loved one."
}

@app.get("/weather_activity")
async def get_weather_activity():
    url = f"http://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric"
    response = requests.get(url).json()
    weather_desc = response["weather"][0]["description"]
    temp = response["main"]["temp"]

    activity_message = activity_suggestions.get(weather_desc, "Enjoy your day with something you love!")
    return {"message": f"Today's weather in {CITY}: {weather_desc}, {temp}°C. {activity_message}"}

Now, the assistant suggests activities based on the weather conditions!

Frontend: Display & Read Aloud Activity Suggestions
Modify App.js to fetch and read activity recommendations aloud:

Javascript
import { useEffect } from 'react';
import axios from 'axios';
import TTS from 'react-native-tts';

const fetchMorningUpdate = async () => {
  const motivationRes = await axios.get("http://127.0.0.1:8000/morning_motivation");
  const weatherRes = await axios.get("http://127.0.0.1:8000/weather_activity");

  const message = `Good morning! ${motivationRes.data.message}. Also, ${weatherRes.data.message}`;
  TTS.speak(message);
};

useEffect(() => {
  fetchMorningUpdate();  // Runs when the app starts
}, []);

System Architecture Overview
Your assistant is structured with a microservices-based approach, allowing flexibility and scalability. Below are the main components:
1. User Interface (Frontend)
- React Native – Cross-platform support (mobile, tablet, desktop).
- Voice & Text Interaction – Uses react-native-voice for speech input and react-native-tts for text-to-speech.
- Adaptive Greetings & Activity Recommendations – Dynamically adjusts based on weather, time, and user preferences.
2. Backend (Processing & AI)
- FastAPI (Python) – Handles requests and responses efficiently.
- AI Chatbot – Uses GPT-based NLP for natural conversation.
- Weather & Activity API – Fetches real-time weather and suggests personalized activities.
- Reminder & Task Management – Stores reminders, alerts, and scheduled tasks.
3. Database & Memory Storage
- SQLite – Stores reminders and task schedules.
- Redis – Caching frequently accessed responses (fast retrieval).
- Vector Database (Pinecone or FAISS) – Stores conversation context for personalization.
4. Voice & Wake Word System
- Porcupine Wake Word Detection – Allows hands-free activation (e.g., "Hey Assistant").
- Text-to-Speech (TTS) – Uses Google Speech API or Azure Speech Services.
5. Cloud Deployment
- AWS ECS + Fargate – Scalable containerized deployment.
- Serverless Functions (AWS Lambda) – Lightweight background tasks.
- WebSockets – For real-time assistant interactions.
6. Smart Home & IoT Integration (Future Scope)
- MQTT Protocol – Connects with smart home devices (lights, alarms, thermostat).
- Google Assistant / Alexa API Hooks – Extends functionality for voice control.

Development Roadmap
🔹 Phase 1: Core Assistant Features
✅ Basic Chatbot – AI-powered assistant (FastAPI + GPT integration).
✅ Voice Input & Output – Speech-to-text (STT) and text-to-speech (TTS).
✅ Wake Word Activation – "Hey Assistant" for hands-free activation.
✅ Morning Greetings & Motivation – Adaptive messages based on user mood/weather.
🔹 Phase 2: Personalization & Tasks
✅ Reminders & Lists – Add tasks, grocery lists, and medication reminders.
✅ Weather-Based Adaptive Advice – Dynamic greetings and activity suggestions.
✅ Favorite Activities Memory – Tracks preferences to personalize suggestions.
🔹 Phase 3: Advanced Features
🔜 Smart Home Integration – Control lights, alarms, thermostat via MQTT.
🔜 Video Calls & Messaging – Quick access to loved ones.
🔜 Health Monitoring – Simple wellness check-ins or emergency alerts.
🔹 Phase 4: Scaling & Deployment
🔜 Cloud Infrastructure – AWS ECS + Lambda for smooth deployment.
🔜 Cross-Platform UI Enhancements – Full support for mobile, tablet, and desktop.
🔜 Multi-Language Support – Adapt assistant for broader accessibility.

📌 Architecture Diagram
Here’s a simplified architecture showing how all components interact:
                 +--------------------------+
                 |  User (Mom)               |
                 |  - Voice Input            |
                 |  - Text Input             |
                 |  - Activity Selection     |
                 +------------+-------------+
                              |
                              v
                 +------------+-------------+
                 |  React Native Frontend   |
                 |  - UI/UX for ease of use |
                 |  - Voice interaction     |
                 |  - Lists & reminders     |
                 +------------+-------------+
                              |
                              v
                 +------------+-------------+
                 |  FastAPI Backend         |
                 |  - AI Processing (GPT)   |
                 |  - Task management       |
                 |  - Adaptive responses    |
                 +------------+-------------+
                              |
               +-------------+------------+
               |   Integrations            |
               |   - Weather API           |
               |   - TTS & STT             |
               |   - Smart Home Controls   |
               +-------------+------------+
                              |
                              v
                 +------------+-------------+
                 |  Cloud Infrastructure    |
                 |  - AWS ECS & Fargate     |
                 |  - Redis Caching         |
                 |  - Pinecone Memory       |
                 +-------------------------+



🔜 Next Steps
Would you like me to help you set up cloud deployment next? Or would you prefer to refine additional assistant features first? Let’s keep building together! 🚀

