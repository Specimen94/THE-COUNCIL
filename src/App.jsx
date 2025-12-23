import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// ==========================================
// 1. API CONFIGURATION
// ==========================================
const KEYS = {
  GEMINI: "PASTE_KEY_HERE",
  GROQ: "PASTE_KEY_HERE",      
  HF: "PASTE_KEY_HERE" 
};

// --- PROVIDER LOGIC ---
const callGemini = async (prompt) => {
  if (!KEYS.GEMINI || KEYS.GEMINI.includes("PASTE")) return "[System: Gemini Key Missing]";
  const genAI = new GoogleGenerativeAI(KEYS.GEMINI);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ]
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const callGroq = async (prompt, modelName) => {
  if (!KEYS.GROQ || KEYS.GROQ.includes("PASTE")) return "[System: Groq Key Missing]";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${KEYS.GROQ}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: prompt }], model: modelName })
  });
  if (!response.ok) return `[Groq Error: ${response.status}]`;
  const data = await response.json();
  return data.choices[0].message.content;
};

const callHuggingFace = async (prompt) => {
  if (!KEYS.HF || KEYS.HF.includes("PASTE")) return "[System: HF Key Missing]";
  const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
    method: "POST",
    headers: { "Authorization": `Bearer ${KEYS.HF}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: prompt })
  });
  if (!response.ok) return `[HF Error: ${response.status}]`;
  const data = await response.json();
  const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
  return text ? text.replace(prompt, "").trim() : "[HF Empty Response]";
};

const AGENTS = [
  { name: "Axiom", provider: "GROQ", model: "llama3-70b-8192", prompt: "You are Axiom. Objective, Mathematical, Precise. Answer directly with logic." },
  { name: "Reason", provider: "GROQ", model: "mixtral-8x7b-32768", prompt: "You are Reason. Stoic, Logical, Ordered. Provide a structured solution." },
  { name: "Entropy", provider: "HF", prompt: "You are Entropy. Chaotic, Wild, Unpredictable. Answer with high energy." },
  { name: "Nova", provider: "GEMINI", prompt: "You are Nova. Optimistic, Visionary, Future-focused. Focus on potential." },
  { name: "Paradox", provider: "GEMINI", prompt: "You are Paradox. Cryptic, Questioning, Mysterious. Answer with a riddle." }
];

// ==========================================
// 2. UI COMPONENTS
// ==========================================
const Typewriter = ({ text = "", speed = 20, delay = 0, onComplete, className = "" }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setHasStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;
    if (!text) return; 
    let index = 0;
    const timer = setInterval(() => {
      index++; 
      setDisplayedText(text.slice(0, index)); 
      if (index >= text.length) {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, hasStarted, onComplete]);

  return <span className={className}>{displayedText}</span>;
};

// ==========================================
// 3. MAIN APP
// ==========================================
export default function App() {
  const [input, setInput] = useState('');
  const [time, setTime] = useState(new Date());
  
  const [messages, setMessages] = useState([
    { time: "22:28:20", user: "lack", text: "Growing every day", delay: 1500 },
    { time: "22:28:24", user: "phasmid", text: "like today recently", delay: 1700 },
    { time: "23:36:02", user: "zero", text: "you'll be providing the development team important data", delay: 1900 },
    { time: "23:37:32", user: "System", text: "User 'guest_99' has joined the council.", isSystem: true, delay: 2500 }
  ]);
  
  const [isVoting, setIsVoting] = useState(false);
  const [tieOptions, setTieOptions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isProcessing]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pushMessage = (user, text, isSystem = false) => {
    setMessages(prev => [...prev, {
      time: new Date().toLocaleTimeString([], { hour12: false }),
      user, text: String(text), isSystem, delay: 0
    }]);
  };

  const askTheCouncil = async (userInput) => {
    setIsProcessing(true);
    const showAll = userInput.toLowerCase().includes("/all");
    const cleanInput = userInput.replace("/all", "").trim();

    try {
      const agentPromises = AGENTS.map(async (agent) => {
        const fullPrompt = `${agent.prompt} User Input: "${cleanInput}"`;
        try {
          let text = "";
          if (agent.provider === "GEMINI") text = await callGemini(fullPrompt);
          else if (agent.provider === "GROQ") text = await callGroq(fullPrompt, agent.model);
          else if (agent.provider === "HF") text = await callHuggingFace(fullPrompt);
          
          if (showAll) pushMessage(agent.name, text);
          return { name: agent.name, text };
        } catch (e) {
          console.warn(e);
          return { name: agent.name, text: "[Connection Failed]" };
        }
      });

      const results = await Promise.all(agentPromises);

      if (!showAll) {
        const validResults = results.filter(r => !r.text.includes("Failed") && !r.text.includes("Missing"));
        
        if (validResults.length === 0) {
          pushMessage("SYSTEM", "CRITICAL: All networks unreachable. Check API Keys.", true);
        } else {
          const votes = {};
          validResults.forEach(r => votes[r.name] = 0);
          validResults.forEach(v => {
            const others = validResults.filter(r => r.name !== v.name);
            if (others.length > 0) votes[others[Math.floor(Math.random() * others.length)].name]++;
          });

          const max = Math.max(...Object.values(votes));
          const winners = Object.keys(votes).filter(n => votes[n] === max);

          if (winners.length === 1) {
            const winnerData = results.find(r => r.name === winners[0]);
            pushMessage(winnerData.name, winnerData.text);
          } else {
            setTieOptions(winners);
            setIsVoting(true);
            pushMessage("SYSTEM", `STALEMATE: ${winners.join(" vs ")}. CAST YOUR VOTE.`, true);
          }
        }
      }
    } catch (error) {
      pushMessage("SYSTEM", `ERROR: ${error.message}`, true);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- FIXED HANDLER NAME TO PREVENT CRASH ---
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim() !== '' && !isProcessing) {
      if (isVoting) {
        const choice = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
        const winner = tieOptions.find(opt => opt === choice);
        if (winner) {
          setIsVoting(false);
          pushMessage(winner, "Authority acknowledged. Consensus aligned.");
        } else {
          setIsVoting(false);
          pushMessage("SYSTEM", `Indecision noted. Randomizing selection...`, true);
        }
        setInput('');
        return;
      }
      pushMessage("USER", input);
      askTheCouncil(input);
      setInput('');
    }
  };

  return (
    <div className="relative h-screen w-screen flex flex-col md:flex-row leading-[1.1] tracking-wide bg-terminal-bg text-terminal-main selection:bg-terminal-main selection:text-black font-mono overflow-hidden">
      <div className="absolute inset-0 scanline z-50 pointer-events-none opacity-30 mix-blend-overlay"></div>
      
      {/* SIDEBAR */}
      <div className="w-full md:w-20 border-b md:border-b-0 md:border-r border-terminal-dim flex flex-row md:flex-col items-center justify-between md:justify-start py-2 md:py-6 gap-8 bg-black/80 z-40 backdrop-blur-sm">
        <div className="w-8 h-8 cursor-pointer hover:brightness-150 transition-all"><svg viewBox="0 0 64 64" fill="currentColor"><path d="M61 39h-2v-2a6 6 0 0 0-12 0v2h-2a3.003 3.003 0 0 0-3 3v14a3.003 3.003 0 0 0 3 3h16a3.003 3.003 0 0 0 3-3V42a3.003 3.003 0 0 0-3-3zm-12-2a4 4 0 0 1 8 0v2h-8zm13 19a1.001 1.001 0 0 1-1 1H45a1.001 1.001 0 0 1-1-1V42a1.001 1.001 0 0 1 1-1h16a1.001 1.001 0 0 1 1 1z" /><path d="M53 44a2.993 2.993 0 0 0-1 5.816V53a1 1 0 0 0 2 0v-3.184A2.993 2.993 0 0 0 53 44zm0 4a1 1 0 1 1 1-1 1.001 1.001 0 0 1-1 1zM39 47H5a3.003 3.003 0 0 1-3-3V16h47a3.003 3.003 0 0 1 3 3v9a1 1 0 0 0 2 0v-9a5.006 5.006 0 0 0-5-5H25.72l-1.86-5.582A4.994 4.994 0 0 0 19.117 5H5a5.006 5.006 0 0 0-5 5v34a5.006 5.006 0 0 0 5 5h34a1 1 0 0 0 0-2zM2 10a3.003 3.003 0 0 1 3-3h14.117a2.996 2.996 0 0 1 2.846 2.051L23.613 14H2z" /></svg></div>
        <div className="w-8 h-8 cursor-pointer hover:brightness-150 transition-all"><svg viewBox="0 0 64 64" fill="currentColor"><path d="M57 5H7a1 1 0 0 0-1 1v28a1 1 0 0 0 1 1h50a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zm-1 28H8V7h48z" /><path d="M57 1H7a5.006 5.006 0 0 0-5 5v36a5.006 5.006 0 0 0 5 5h17v4H14a1 1 0 0 0-.894.553l-5 10A1 1 0 0 0 9 63h46a1 1 0 0 0 .894-1.447l-5-10A1 1 0 0 0 50 51H40v-4h17a5.006 5.006 0 0 0 5-5V6a5.006 5.006 0 0 0-5-5zM4 6a3.003 3.003 0 0 1 3-3h50a3.003 3.003 0 0 1 3 3v31H4zm34 46a6.007 6.007 0 0 0 6 6 1 1 0 0 0 0-2 3.996 3.996 0 0 1-3.858-3h9.24l4 8H10.618l4-8h9.24A3.996 3.996 0 0 1 20 56a1 1 0 0 0 0 2 6.007 6.007 0 0 0 6-6v-5h12zm22-10a3.003 3.003 0 0 1-3 3H7a3.003 3.003 0 0 1-3-3v-3h56z" /><path d="M7 43h6a1 1 0 0 0 0-2H7a1 1 0 0 0 0 2zM16 43h2a1 1 0 0 0 0-2h-2a1 1 0 0 0 0 2z" /></svg></div>
        <div className="w-8 h-8 cursor-pointer hover:brightness-150 transition-all"><svg viewBox="0 0 128 128" fill="currentColor"><path d="M13 28.792h28.5a1.75 1.75 0 0 0 0-3.5H13a1.75 1.75 0 0 0 0 3.5zM13 40.292h57a1.75 1.75 0 0 0 0-3.5H13a1.75 1.75 0 0 0 0 3.5zM13 51.792h57a1.75 1.75 0 0 0 0-3.5H13a1.75 1.75 0 0 0 0 3.5zM71.75 61.542a1.75 1.75 0 0 0-1.75-1.75H13a1.75 1.75 0 0 0 0 3.5h57a1.75 1.75 0 0 0 1.75-1.75zM112.514 78.917H73.139a1.75 1.75 0 0 0 0 3.5h39.375a1.75 1.75 0 0 0 0-3.5z" /><path d="M122.887 48.292H83V21.417a5.757 5.757 0 0 0-5.75-5.75H5.75A5.757 5.757 0 0 0 0 21.417v45.75a5.757 5.757 0 0 0 5.75 5.75h5.833v16.5a1.75 1.75 0 0 0 2.7 1.469l27.735-17.969h15.634v18.957a5.119 5.119 0 0 0 5.113 5.114h29.544l23.25 15.064a1.748 1.748 0 0 0 .952.281 1.771 1.771 0 0 0 1.75-1.75v-13.6h4.626A5.119 5.119 0 0 0 128 91.874V53.405a5.119 5.119 0 0 0-5.113-5.113zM41.5 69.417a1.751 1.751 0 0 0-.952.281L15.083 86.2V71.167a1.75 1.75 0 0 0-1.75-1.75H5.75a2.252 2.252 0 0 1-2.25-2.25v-45.75a2.252 2.252 0 0 1 2.25-2.25h71.5a2.252 2.252 0 0 1 2.25 2.25v45.75a2.252 2.252 0 0 1-2.25 2.25zm83 22.458a1.615 1.615 0 0 1-1.613 1.614h-6.377a1.75 1.75 0 0 0-1.75 1.75v12.126l-20.982-13.6a1.751 1.751 0 0 0-.952-.281H62.765a1.615 1.615 0 0 1-1.613-1.614V72.917h51.362a1.75 1.75 0 0 0 0-3.5H82.541a5.717 5.717 0 0 0 .459-2.25v-3.875h29.514a1.75 1.75 0 0 0 0-3.5H83v-8h39.887a1.615 1.615 0 0 1 1.613 1.614z" /></svg></div>
        <div className="mt-auto w-8 h-8 cursor-pointer opacity-50 hover:opacity-100 transition-all"><svg viewBox="0 0 32 32" fill="currentColor"><path d="M16 19a1 1 0 0 1-1-1V4a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1zM16 29a1 1 0 0 1-1-1v-7.072a1 1 0 1 1 2 0V28a1 1 0 0 1-1 1zM6 13a1 1 0 0 1-1-1V4a1 1 0 1 1 2 0v8a1 1 0 0 1-1 1zM6 29a1 1 0 0 1-1-1V14.898a1 1 0 1 1 2 0V28a1 1 0 0 1-1 1zM26 10a1 1 0 0 1-1-1V4a1 1 0 1 1 2 0v5a1 1 0 0 1-1 1zM26 29a1 1 0 0 1-1-1V12a1 1 0 1 1 2 0v16a1 1 0 0 1-1 1z" /><path d="M29 10h-6a1 1 0 1 1 0-2h6a1 1 0 1 1 0 2zM19 19h-6a1 1 0 1 1 0-2h6a1 1 0 1 1 0 2zM9 13H3a1 1 0 1 1 0-2h6a1 1 0 1 1 0 2z" /></svg></div>
      </div>

      {/* CENTER AREA */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-black/40">
        <div className="border-b border-terminal-dim p-2 flex justify-between items-center bg-black/60 text-lg">
          <h1 className="font-bold"><Typewriter text="THE PINNACAL OF AI v0.5" speed={30} /></h1>
          <div className="opacity-70">{time.toLocaleTimeString()} | {time.toLocaleDateString()}</div>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 text-xl md:text-2xl scrollbar-hide">
          <div className="mb-6 opacity-80 space-y-1">
            <div><Typewriter text="CONNECTING TO CYBERSPACE NETWORK..." speed={10} delay={0} /></div>
            <div><Typewriter text="ESTABLISHING SECURE LINK..." speed={10} delay={800} /></div>
            <div className="text-white drop-shadow-[0_0_5px_rgba(198,165,64,0.5)]"><Typewriter text="ACCESS GRANTED" speed={20} delay={1500} /></div>
            <div className="mt-2 font-bold text-terminal-main"><Typewriter text="Welcome to THE COUNCIL" speed={40} delay={2000} /></div>
          </div>
          {messages.map((msg, idx) => (<Message key={idx} {...msg} />))}
          {isProcessing && (
            <div className="flex gap-3 text-white animate-pulse italic">
              <span>*</span><span>Council agents are deliberating across networks...</span>
            </div>
          )}
          <div className="h-4"></div>
        </div>
        <div className="p-3 border-t border-terminal-dim bg-black">
          <div className="flex items-center gap-3">
            <span className="animate-pulse font-bold text-xl">{'>'}</span>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              className={`flex-1 bg-transparent border-none outline-none text-terminal-main text-xl md:text-2xl font-mono placeholder-terminal-dim/50 uppercase ${isVoting ? 'placeholder-white/50 font-bold underline' : ''}`}
              placeholder={isProcessing ? "PROCESSING..." : isVoting ? `DECISION REQ: VOTE FOR ${tieOptions.join(" / ")}` : "ENTER COMMAND..."}
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="hidden md:flex w-72 border-l border-terminal-dim flex-col bg-black/80 backdrop-blur-sm">
        <div className="p-2 border-b border-terminal-dim text-center font-bold"><Typewriter text="MESSAGE FROM DEV" delay={1000} speed={30} /></div>
        <div className="p-4 space-y-6 text-lg opacity-90 overflow-y-auto flex-1 font-mono">
          <div><span className="opacity-50 block text-sm mb-1"><Typewriter text="// STATUS" delay={1500} speed={20} /></span><p><Typewriter text="I can't wait for people to use this. Enjoy." delay={1800} speed={20} /></p></div>
          <div className="border-t border-terminal-dim/30 pt-4"><span className="opacity-50 block text-sm mb-1"><Typewriter text="// ACKNOWLEDGEMENTS" delay={3000} speed={10} /></span><p><Typewriter text="A huge thank you to my family. This project exists because you granted me the resources and support to create it." delay={3500} speed={15} /></p></div>
          <div className="mt-auto pt-8 opacity-50 text-center text-sm"><Typewriter text="--- END OF MESSAGE ---" delay={6000} /></div>
        </div>
      </div>
    </div>
  );
}

function Message({ time, user, text, isSystem, delay }) {
  const [show, setShow] = useState(delay === 0);
  useEffect(() => { if (delay > 0) { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); } }, [delay]);
  if (!show) return null;
  const isAgent = ["Axiom", "Paradox", "Entropy", "Reason", "Nova"].includes(user);
  return (
    <div className="flex gap-3 hover:bg-terminal-main/10 transition-colors cursor-default">
      <span className="text-terminal-dim shrink-0">{time}</span>
      <span className={`font-bold shrink-0 opacity-90 ${isSystem ? 'text-white italic' : ''} ${isAgent ? 'text-[#C6A540] brightness-125' : ''} ${user === 'USER' ? 'text-terminal-main opacity-50' : ''}`}>
        &lt;{user}&gt;
      </span>
      <span className={`break-words ${isSystem ? 'text-white' : 'opacity-80'}`}><Typewriter text={text} speed={15} /></span>
    </div>
  );
}