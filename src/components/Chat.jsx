import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Send, Brain, LogOut, AlertTriangle, User, Bot, Loader2, FileText, HelpCircle, BookOpen, Lightbulb } from 'lucide-react';

const Chat = ({ user, setUser }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'bot',
      content: 'Bonjour ! Je suis votre assistant IA EduLLM. Comment puis-je vous aider avec vos études aujourd\'hui ?',
      timestamp: new Date()
    }
  ]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Veuillez entrer un message.');
      return;
    }
    
    if (!user || !user.profile_id || !user.user_id) {
      setError('Utilisateur non authentifié.');
      navigate('/');
      return;
    }
    
    if (!user.filiere_id) {
      setError('Aucune filière associée à cet utilisateur.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Add user message to chat history
    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');

    const payload = {
      message: currentMessage,
      departement_id: user.departement_id || null,
      filiere_id: user.filiere_id || null,
      module_id: user.module_id || null,
      activite_id: user.activite_id || null,
      profile_id: user.profile_id,
      user_id: user.user_id
    };

    try {
      const response = await axios.post('http://localhost:8000/chat', payload);
      
      const botResponse = {
        type: 'bot',
        content: response.data.response,
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error.response?.data?.detail
        ? `Erreur : ${error.response.data.detail}`
        : 'Erreur : Impossible de contacter le serveur.';
      
      setError(errorMessage);
      
      // Add error message to chat as bot response
      const errorResponse = {
        type: 'bot',
        content: errorMessage,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const quickActions = [
    { icon: FileText, text: "Résumer un cours", color: "bg-blue-500" },
    { icon: HelpCircle, text: "Générer un quiz", color: "bg-green-500" },
    { icon: BookOpen, text: "Expliquer un concept", color: "bg-purple-500" },
    { icon: Lightbulb, text: "Recommandations", color: "bg-orange-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">EduLLM Chat</h1>
                  <p className="text-sm text-slate-500">Assistant IA pour {user?.filiere_name || 'vos études'}</p>
                </div>
              </div>
            </div>
           
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                {/* <p className="text-sm font-medium text-slate-700">{user?.username || user?.name || 'Utilisateur'}</p>
                <p className="text-xs text-slate-500">{user?.profile_name || 'Étudiant'} • {user?.filiere_name || 'Formation'}</p> */}
              </div>
              {/* <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors duration-200 border border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button> */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col h-[calc(100vh-88px)]">
        {/* Warning Banner */}
        {!user?.module_id && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-800 font-medium text-sm">Module non spécifique</p>
              <p className="text-amber-700 text-sm">Aucun module associé à votre filière. Les réponses peuvent être moins spécifiques.</p>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'bot' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
               
                <div className={`max-w-2xl ${msg.type === 'user' ? 'order-1' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto'
                      : 'bg-slate-50 text-slate-800'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <p className={`text-xs text-slate-400 mt-1 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>

                {msg.type === 'user' && (
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 order-2">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  <span className="text-slate-500 text-sm">Assistant réfléchit...</span>
                </div>
              </div>
            )}
           
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {chatHistory.length === 1 && (
            <div className="px-6 py-4 border-t border-slate-100">
              <p className="text-sm text-slate-600 mb-3">Actions rapides :</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(action.text)}
                    className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors duration-200 text-left"
                  >
                    <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-slate-700 font-medium">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="px-6 py-2">
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="p-6 border-t border-slate-100">
            <div className="flex gap-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question sur les cours, demandez un résumé, ou générez un quiz..."
                className="flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[48px] max-h-32"
                disabled={isLoading}
                rows={1}
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading || !message.trim()}
                className="px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed flex items-center justify-center min-w-[48px]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Appuyez sur Entrée pour envoyer, Shift+Entrée pour un nouveau ligne
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;