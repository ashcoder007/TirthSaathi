// AIGuideChat.js
import React, { useState, useRef } from 'react';
import axios from 'axios';
import './aiguide.css';
import { API_ORIGIN } from '../config';

export default function AIGuideChat() {
  const [input, setInput] = useState('');
  const useHF = false;
  const [messages, setMessages] = useState([
    { id: 'sys-1', who: 'bot', text: 'Hello! Ask me about temples or pilgrimage places in India, and I will help you with useful guidance and summaries.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEnd = useRef(null);

  const scrollToBottom = () => {
    try { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); } catch (e) {}
  };

  const pushMessage = (msg) => {
    setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, ...msg }]);
    setTimeout(scrollToBottom, 50);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q) return;
    setError('');
    pushMessage({ who: 'user', text: q });
    setInput('');
    setLoading(true);

    // placeholder bot reply while waiting
    const waitingId = `wait-${Date.now()}`;
    pushMessage({ id: waitingId, who: 'bot', text: 'Searching for answers...' });

    try {
      const payload = { q, useHF };
      const res = await axios.post(`${API_ORIGIN}/api/ai/query`, payload, { timeout: 60000 });
      const data = res.data || {};

      // remove waiting message
      setMessages(prev => prev.filter(m => m.id !== waitingId));

      if (data.answer) {
        pushMessage({ who: 'bot', text: data.answer });
      } else if (data.hf && data.hf.answer) {
        pushMessage({ who: 'bot', text: data.hf.answer });
      } else if (Array.isArray(data.results) && data.results.length) {
        // older route naming (results)
        data.results.forEach(r => {
          const text = r.extract || '(no summary)';
          pushMessage({ who: 'bot', text, meta: { title: r.title, url: r.url, thumbnail: r.thumbnail } });
        });
      } else if (Array.isArray(data.sources) && data.sources.length) {
        // our HF-enhanced route returns sources
        pushMessage({ who: 'bot', text: 'Here are summaries from sources:' });
        data.sources.forEach(s => {
          pushMessage({ who: 'bot', text: s.extract || '(no summary)', meta: { title: s.title, url: s.url, thumbnail: s.thumbnail } });
        });
        if (data.hf && data.hf.answer) {
          pushMessage({ who: 'bot', text: `AI summary:\n\n${data.hf.answer}` });
        }
      } else {
        // fallback textual response
        const fallback = data.answer || data.message || 'No results found.';
        pushMessage({ who: 'bot', text: fallback });
      }

    } catch (err) {
      console.error('AI query error', err);
      // remove waiting message
      setMessages(prev => prev.filter(m => !m.id.startsWith('wait-')));
      const msg = err.response?.data?.error || err.message || 'Request failed';
      setError(msg);
      pushMessage({ who: 'bot', text: `Error: ${msg}` });
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  return (
    <div className="ai-chat-page">
      <div className="ai-chat-card">
        <div className="ai-chat-header">
          <h3>AI Guide — TirthSaathi</h3>
        </div>

        <div className="ai-chat-body">
          {messages.map(m => (
            <div key={m.id} className={`chat-row ${m.who === 'user' ? 'user' : 'bot'}`}>
              {m.who === 'bot' && m.meta?.thumbnail && (
                <img src={m.meta.thumbnail} alt="thumb" className="msg-thumb" onError={(e)=>{e.target.style.display='none'}}/>
              )}
              <div className="msg-bubble">
                {m.meta?.title && <div className="msg-title">{m.meta.title}</div>}
                {m.text.split('\n').map((ln, i) => <div key={i}>{ln}</div>)}
                {m.meta?.url && (
                  <div className="msg-source"><a href={m.meta.url} target="_blank" rel="noreferrer">Source ↗</a></div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEnd} />
        </div>

        <div className="ai-chat-footer">
          <form onSubmit={handleSubmit} className="chat-form">
            <input
              className="chat-input"
              placeholder="Ask about a temple or place (eg. 'Mahakaleshwar significance')"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="chat-send" disabled={loading || !input.trim()}>
              {loading ? 'Thinking…' : 'Send'}
            </button>
          </form>
          {error && <div className="chat-error">{error}</div>}
          <div className="chat-hint">Tip: try queries like "Ganga Aarti Varanasi history" or "Mahakaleshwar temple significance".</div>
        </div>
      </div>
    </div>
  );
}
