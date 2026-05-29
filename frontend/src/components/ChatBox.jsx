import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const { userData } = useContext(AuthContext);
  const msgEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const quickReplies = [
    { text: " Health Symptoms", value: "I have health symptoms. Please advise." },
    { text: "Diet & Nutrition", value: "Give me diet and nutrition tips." },
    { text: "Exercise Guidance", value: "Provide exercise recommendations." },
    { text: " Mental Wellness", value: "Share mental health tips." },
    { text: " General Health", value: "Give me general health advice." },
    { text: "Share Image", value: "image_upload", isImage: true }
  ];

  const getUserId = () => {
    if (userData?.id) return userData.id;
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userObj = JSON.parse(user);
        if (userObj.id) return userObj.id;
      } catch(e) {}
    }
    return null;
  };

  useEffect(() => {
    if (isOpen && !sessionId) {
      createSession();
    }
  }, [isOpen]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createSession = async () => {
    try {
      const userId = getUserId();
      const res = await fetch('http://localhost:5000/api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId ? Number(userId) : null })
      });
      const data = await res.json();
      if (data.success) {
        setSessionId(data.session.id);
        loadHistory(data.session.id);
      }
    } catch (err) {
      console.error('Session error:', err);
    }
  };

  const loadHistory = async (sid) => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/history/${sid}`);
      const data = await res.json();
      if (data.success && data.messages.length > 0) {
        setMessages(data.messages);
        setShowQuickReplies(false);
      } else {
        setMessages([{
          role: 'assistant',
          content: '🙏 Namaste! Welcome to Swastha Sangai! 👋\n\nI\'m your AI health assistant. How can I help you today?'
        }]);
        setShowQuickReplies(true);
      }
    } catch (err) {
      console.error('History error:', err);
    }
  };

  const sendMessage = async (messageText) => {
    const userMsg = messageText || input.trim();
    if (!userMsg || !sessionId) return;

    setMessages(prev => [...prev, { role: 'user', content: userMsg, createdAt: new Date() }]);
    setInput('');
    setShowQuickReplies(false);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          sessionId,
          userId: getUserId() ? Number(getUserId()) : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply, createdAt: new Date() }]);
      }
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    setUploading(true);
    setShowQuickReplies(false);
    
    try {
      const uploadRes = await fetch('http://localhost:5000/api/chat/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (uploadData.success) {
        setMessages(prev => [...prev, { 
          role: 'user', 
          content: '📷 Shared an image',
          imageUrl: uploadData.imageUrl,
          imageName: uploadData.imageName,
          createdAt: new Date()
        }]);
        
        const aiRes = await fetch('http://localhost:5000/api/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `I shared a health-related image. Please provide health advice.`,
            sessionId,
            userId: getUserId() ? Number(getUserId()) : null
          })
        });
        const aiData = await aiRes.json();
        if (aiData.success) {
          setMessages(prev => [...prev, { role: 'assistant', content: aiData.reply, createdAt: new Date() }]);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleQuickReply = (reply) => {
    if (reply.isImage) {
      fileInputRef.current.click();
    } else {
      sendMessage(reply.value);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      uploadImage(file);
    }
    fileInputRef.current.value = '';
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#2ECC71',
          border: 'none',
          color: 'white',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          zIndex: 9999,
          transition: 'all 0.3s'
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '420px',
          height: '650px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 9998,
        }}>
          {/* Header */}
          <div style={{
            background: '#2ECC71',
            color: 'white',
            padding: '18px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '30px' }}></span>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Swastha Sangai AI</h3>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#2ecc71', borderRadius: '50%', marginRight: '5px' }}></span>
                  Online • Ready to help
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => fileInputRef.current.click()}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '15px',
            background: '#f8f9fa',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  background: msg.role === 'user' ? '#2ECC71' : 'white',
                  color: msg.role === 'user' ? 'white' : '#333',
                  fontSize: '15px',
                  fontWeight: msg.role === 'user' ? '500' : '400',
                  lineHeight: '1.5',
                  borderBottomRightRadius: msg.role === 'user' ? '5px' : '18px',
                  borderBottomLeftRadius: msg.role === 'user' ? '18px' : '5px',
                  boxShadow: msg.role === 'user' ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  {msg.imageUrl && (
                    <img 
                      src={`http://localhost:5000${msg.imageUrl}`}
                      alt="Health"
                      style={{ maxWidth: '100%', borderRadius: '10px', marginBottom: '8px', cursor: 'pointer' }}
                    />
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Quick Replies - More Visible */}
            {showQuickReplies && messages.length <= 1 && !loading && (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '18px',
                marginTop: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e8e8e8'
              }}>
                <p style={{ 
                  margin: '0 0 14px 0', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#555',
                  letterSpacing: '0.3px'
                }}>
                  Select an option:
                </p>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickReply(reply)}
                      style={{
                        background: '#f0f2f5',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '25px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        color: '#2ECC71',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#2ECC71';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#f0f2f5';
                        e.target.style.color = '#2ECC71';
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{reply.text.split(' ')[0]}</span>
                      <span>{reply.text.substring(reply.text.indexOf(' ') + 1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(loading || uploading) && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: 'white',
                  padding: '12px 18px',
                  borderRadius: '20px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#999', borderRadius: '50%', animation: 'bounce 1s infinite' }}></span>
                    <span style={{ width: '8px', height: '8px', background: '#999', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }}></span>
                    <span style={{ width: '8px', height: '8px', background: '#999', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={msgEndRef} />
          </div>

          {/* Input Area - More Visible */}
          <div style={{
            padding: '16px',
            background: 'white',
            borderTop: '1px solid #e8e8e8'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <button
                onClick={() => fileInputRef.current.click()}
                style={{
                  background: '#f0f2f5',
                  border: 'none',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                 ⬆️
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKey}
                placeholder="Type your health question..."
                rows="1"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '25px',
                  fontSize: '14px',
                  fontWeight: '400',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  background: '#f8f9fa'
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                style={{
                  padding: '12px 24px',
                  background: '#2ECC71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  opacity: !input.trim() ? 0.5 : 1
                }}
              >
                Send
              </button>
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: '#aaa', 
              textAlign: 'center', 
              marginTop: '12px',
              letterSpacing: '0.3px'
            }}>
              📷 Click camera icon to share health images
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
};

export default ChatBox;