@app.post("/reminder")
async def add_reminder(task: str, time: str):
    conn = sqlite3.connect("reminders.db")
    c = conn.cursor()
    c.execute("INSERT INTO reminders (task, time) VALUES (?, ?)", (task, time))
    conn.commit()
    conn.close()
    return {"status": "Reminder saved"}
