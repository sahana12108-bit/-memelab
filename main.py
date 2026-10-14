
from flask import Flask, render_template, request, jsonify
import random
import os

app = Flask(__name__)

def generate_meme(scenario):
    scenario = scenario.lower()

    memes = {
        "exam": [
            ("Me before the exam", "Me after seeing the question paper 💀"),
            ("I studied everything", "Except what came in the exam 😭"),
            ("Teacher: This is easy", "My brain: Access denied 🤖")
        ],
        "coding": [
            ("Code worked yesterday", "Today: 47 errors 💀"),
            ("Me fixing one bug", "Three new bugs appear 😭"),
            ("It works!", "Never touch that code again 😂")
        ],
        "college": [
            ("Me entering college", "Me counting days until vacation 🏃"),
            ("Attendance is important", "So is my sleep 😴"),
            ("Assignment given today", "Deadline: Yesterday 💀")
        ],
        "sleep": [
            ("Me: Just five more minutes", "Wakes up three hours later 😭"),
            ("Going to sleep early today", "Brain starts a 2019 flashback 💀"),
            ("Alarm: Wake up!", "Me: Let's negotiate 😴")
        ]
    }

    for category, captions in memes.items():
        if category in scenario:
            return random.choice(captions)

    return random.choice([
        ("My expectations", "Reality said NO 💀"),
        ("Me pretending everything is fine", "Everything is NOT fine 😭"),
        ("I have a plan", "I forgot the plan 😂"),
        ("Task looks easy", "Difficulty level: Final boss 💀")
    ])


@app.route("/")
def home():
    return render_template("index.html")
```python
@app.route("/sitemap.xml")
def sitemap():
    return """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://memelab-5uwg.onrender.com/</loc>
    </url>
</urlset>""", 200, {"Content-Type": "application/xml"}
```


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    scenario = data.get("scenario", "").strip()

    if not scenario:
        return jsonify({"error": "Please describe your situation!"}), 400

    top, bottom = generate_meme(scenario)

    return jsonify({"top": top, "bottom": bottom})


if __name__ == "__main__":
    app.run(debug=True)
