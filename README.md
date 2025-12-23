THE COUNCIL v1.0
Sovereign AI Consensus Interface
The Council is a local-first, multi-agent artificial intelligence interface. Instead of a single chatbot, five distinct personalities debate your queries to provide a democratically selected, high-quality response.
Moved away from cloud dependencies, this system runs entirely on your local hardware using Ollama, ensuring privacy, zero latency, and no API rate limits.
⚡ Features
Sovereign Architecture: Runs 100% locally using the llama3.2 model. No data leaves your machine.
The Council: 5 unique AI Agents with distinct worldviews:
Axiom: The Objective Mathematician.
Reason: The Stoic Pragmatist.
Entropy: The Creative Wildcard.
Nova: The Optimistic Visionary.
Paradox: The emo (Deep Truths).
Consensus Engine: Agents debate internally. If a clear winner emerges, you see the best answer. If there is a stalemate, YOU cast the deciding vote via UI buttons.
Sci-Fi Terminal UI: CRT scanlines, typing effects, and a retro-futurist aesthetic.
Control Panel:
[ALL]: Toggle to see the debate from all agents or just the winner.
[THINK]: Toggle to reveal the AI's internal thought process before they speak.
🛠️ Prerequisites
Before running the application, you must set up the "Brain":
Download Ollama: Get it from ollama.com.
Pull the Model: Open your terminal/command prompt and run:
Bash
ollama run llama3.2


Enable Browser Access (CORS):
Windows: Settings -> Edit environment variables for your account.
Add Variable Name: OLLAMA_ORIGINS
Add Variable Value: *
Restart Ollama (Quit from taskbar and open again) for this to take effect.
🚀 Installation
Clone the repository:
Bash
git clone https://github.com/yourusername/the-council.git
cd the-council


Install dependencies:
Bash
npm install


Run the application:
Bash
npm run dev


Access the Terminal:
Open your browser (usually http://localhost:5173) to enter the Council Chamber.
🧠 The Personalities
Unlike standard AI, these agents are programmed to be "Regular People" first, with specific trait multipliers:
Agent
Archetype
Philosophy
< Axiom >
The Scientist
Precision over emotion. If 1+1=2, they don't care how you feel about it.
< Reason >
The Stoic
Practicality above all. Dislikes tangents. Answers simply and effectively.
< Entropy >
The Artist
High energy, chaotic good. Finds the solution no one else is looking for.
< Nova >
The Idealist
Focuses on potential and growth. Always sees the glass half full.
< Paradox >
The Sage
A "Controlled Monster." Aggressive but virtuous. Faces the dragon to get the gold.

🎮 How to Use
Input: Type your question in the bottom terminal line.
Processing: The system allows the agents to deliberate (you will see a processing indicator).
The Result:
Clear Winner: The best answer is displayed automatically.
Stalemate: The terminal will lock and present Voting Buttons. Click the agent you agree with to unlock their full answer.
Command Toggles:
Click [ALL] to watch the debate unfold in real-time.
Click [THINK] to see how the agents arrived at their answers.
🔧 Troubleshooting
"System Error: Local Network Unreachable": This means Ollama is not running. Open Ollama on your computer.
"Network Error" / CORS Issues: You likely skipped Prerequisite #3. You must set OLLAMA_ORIGINS to * in your environment variables.
Credits
Lead Developer: Obiazikwor Favour
Architecture: React, Vite, TailwindCSS
Intelligence: Meta Llama 3.2 via Ollama
