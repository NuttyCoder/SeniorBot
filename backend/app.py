from fastapi import FastAPI
from openai import OpenAI

app = FastAPI()

@app.get("/chat")
async def chat_response(user_message: str):
    response = OpenAI().complete(model="gpt-4", prompt=user_message)
    return {"response": response.text}
    
@app.post("/reminder")
async def add_reminder(task: str, time: str):
    conn = sqlite3.connect("reminders.db")
    c = conn.cursor()
    c.execute("INSERT INTO reminders (task, time) VALUES (?, ?)", (task, time))
    conn.commit()
    conn.close()
    return {"status": "Reminder saved"}
