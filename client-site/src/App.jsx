import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { client } from './sanityClient';
import { API_URL } from "./config/api"; 

const Navbar = ({ cartCount, onOpenCart, onOpenAuth, currentUser, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 sm:px-8 py-3 bg-neutral-900/85 backdrop-blur-md border-b border-neutral-700/50 shadow-lg text-white">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
        <span className="text-lg sm:text-xl font-black tracking-wider"> COACH AI </span>
      </div>

      <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide">
        <button onClick={() => navigate('/')} className="hover:text-red-500 transition">HOME</button>
        <button onClick={() => navigate('/shop')} className="hover:text-red-500 transition">SHOP</button>
        <button onClick={() => navigate('/book-session')} className="hover:text-red-500 transition">BOOK SESSION</button>
        <button onClick={() => navigate('/room')} className="hover:text-red-500 transition">ROOM & NUTRITION</button>
      </nav>

      <div className="flex items-center space-x-3 sm:space-x-5">
        <div 
          onClick={onOpenCart} 
          className="relative cursor-pointer bg-neutral-800/80 p-2 sm:p-2.5 rounded-lg border border-neutral-600 hover:bg-neutral-700 transition"
        >
          <span className="text-base sm:text-lg">🛒</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {cartCount}
            </span>
          )}
        </div>

        {currentUser ? (
          <div className="flex items-center space-x-3">
            <span className="text-xs text-neutral-300 hidden sm:inline">Hi, <strong className="text-white">{currentUser.email.split('@')[0]}</strong></span>
            <button 
              onClick={onLogout}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-lg text-xs transition border border-neutral-700"
            >
              LOGOUT
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="px-4 sm:px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs sm:text-sm tracking-wider transition shadow-lg"
          >
            SIGN IN
          </button>
        )}
      </div>
    </header>
  );
};

const CartDrawer = ({ isOpen, onClose, cart, onUpdateQuantity, onProceedToCheckout, orderStatus }) => {
  if (!isOpen) return null;
  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 text-white p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h2 className="text-xl font-black tracking-wide">YOUR <span className="text-red-600">CART</span></h2>
              <button onClick={onClose} className="text-neutral-400 hover:text-white text-lg font-bold">✕</button>
            </div>
            {orderStatus && (
              <div className={`mt-4 p-3 rounded-xl border text-xs font-semibold text-center ${orderStatus.success ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-red-600/20 border-red-500 text-red-400'}`}>
                {orderStatus.message}
              </div>
            )}
            <div className="mt-6 space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-sm">Your cart is empty.</div>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between bg-neutral-800/60 p-3 rounded-xl border border-neutral-700/60">
                    <div className="flex items-center space-x-3">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-14 h-14 object-cover rounded-lg border border-neutral-700" /> : <div className="w-14 h-14 bg-neutral-700 rounded-lg flex items-center justify-center text-[10px]">No Img</div>}
                      <div>
                        <h4 className="font-bold text-sm text-white line-clamp-1">{item.title}</h4>
                        <span className="text-xs text-red-500 font-bold">${item.price || 0}</span>
                        <span className="block text-[10px] text-neutral-400 capitalize">Type: {item.itemType || 'Item'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => onUpdateQuantity(item._id, -1)} className="w-7 h-7 bg-neutral-700 hover:bg-neutral-600 rounded font-bold text-xs">-</button>
                      <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item._id, 1)} className="w-7 h-7 bg-neutral-700 hover:bg-neutral-600 rounded font-bold text-xs">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-neutral-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-neutral-400">Total:</span>
              <span className="text-xl font-black text-red-500">${totalAmount.toFixed(2)}</span>
            </div>
            <button onClick={onProceedToCheckout} disabled={cart.length === 0} className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 text-white font-bold rounded-xl text-sm transition shadow-lg">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegistering ? { email, password, phone, address } : { email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Authentication failed');

      let userData = data.user;
      let tokenValue = data.token;

      if (isRegistering) {
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        if (loginData.success && loginData.token) {
          tokenValue = loginData.token;
          userData = loginData.user;
        }
      }

      if (tokenValue) localStorage.setItem('gym_auth_token', tokenValue);
      localStorage.setItem('gym_current_user', JSON.stringify(userData));
      onAuthSuccess(userData);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white font-bold">✕</button>
        <h3 className="text-xl font-black mb-1 text-center">{isRegistering ? 'CREATE AN ACCOUNT' : 'WELCOME BACK'}</h3>
        {errorMsg && <div className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded-lg text-xs text-red-400 text-center">{errorMsg}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white" required />
          </div>
          {isRegistering && (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
            </>
          )}
          <button type="submit" disabled={loading} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm transition">
            {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Log In')}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- UNIFIED VOICE CONCIERGE COMPONENT ---
const VoiceConciergeSection = ({ onAddToCart }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiMatch, setAiMatch] = useState(null);
  const [loading, setLoading] = useState(false);

  const speakResponse = (textToSpeak) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true; // Enabled interim results so it captures as you speak
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setAiMatch(null);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentText = finalTranscript || interimTranscript;
      setTranscript(currentText);

      if (finalTranscript) {
        processVoiceCommand(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const processVoiceCommand = async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/voice-concierge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      const data = await response.json();
      if (data.success && data.matchedItem) {
        setAiMatch(data.matchedItem);

        let categoryName = "Shop Gear";
        if (data.matchedItem.itemType === 'bundle') {
          categoryName = "Training Bundle";
        } else if (text.toLowerCase().includes('nutrition') || text.toLowerCase().includes('room')) {
          categoryName = "Nutrition Room";
        }

        const spokenMessage = `I found a matching result in ${categoryName}: ${data.matchedItem.title}.`;
        speakResponse(spokenMessage);
      }
    } catch (err) {
      console.error("Voice concierge error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-6 bg-neutral-900/90 backdrop-blur-md border border-red-600/40 rounded-2xl shadow-2xl text-center relative">
      <h3 className="text-xl font-black text-white mb-2">🎙️ AI VOICE <span className="text-red-600">CONCIERGE</span></h3>
      <p className="text-neutral-300 text-xs mb-4">
        Tell the coach what you need (e.g., <i>"I need a fat-burning supplement from the shop"</i>, <i>"Give me a boxing training bundle"</i>, or <i>"Open the nutrition room"</i>).
      </p>
      
      <button 
        onClick={startListening}
        disabled={isListening}
        className={`px-8 py-3.5 rounded-full font-bold text-white transition shadow-lg transform active:scale-95 ${
          isListening ? 'bg-amber-600 animate-pulse' : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {isListening ? '🎙️ Listening... (Speak now)' : '🎤 Speak to Coach'}
      </button>

      {transcript && (
        <div className="mt-4 inline-block px-4 py-2 bg-neutral-800/80 border border-neutral-700 rounded-xl">
          <p className="text-xs text-neutral-300 italic">"{transcript}"</p>
        </div>
      )}

      {loading && (
        <p className="mt-4 text-xs text-red-500 animate-pulse">
          🤖 AI Coach is matching your request across Shop, Bundles, and Nutrition Rooms...
        </p>
      )}

      {aiMatch && (
        <div className="mt-6 p-4 bg-neutral-950 border border-red-600/60 rounded-xl text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-fadeIn">
          <div className="flex items-center space-x-3">
            {aiMatch.imageUrl ? (
              <img src={aiMatch.imageUrl} alt={aiMatch.title} className="w-16 h-16 object-cover rounded-lg border border-neutral-700" />
            ) : (
              <div className="w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center text-[10px] text-neutral-400">AI Match</div>
            )}
            <div>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded text-white ${
                aiMatch.itemType === 'bundle' ? 'bg-amber-600' : 'bg-red-600'
              }`}>
                Matched: {aiMatch.itemType === 'bundle' ? 'Training Bundle' : 'Shop Gear'}
              </span>
              <h4 className="font-bold text-white text-sm mt-1">{aiMatch.title}</h4>
              <p className="text-xs text-neutral-400 line-clamp-1">{aiMatch.description}</p>
            </div>
          </div>

          {aiMatch.price ? (
            <button 
              onClick={() => onAddToCart(aiMatch)} 
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shrink-0 transition shadow-md"
            >
              Add (${aiMatch.price})
            </button>
          ) : (
            <a 
              href="/room" 
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg shrink-0 transition border border-neutral-600"
            >
              Open Room
            </a>
          )}
        </div>
      )}
    </div>
  );
};

const DashboardNavigation = ({ onOpenAuth, cartCount, onOpenCart, currentUser, onLogout, onAddToCart }) => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden pt-16">
      <div className="fixed inset-0 w-full h-full z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop")` }}></div>
      <div className="fixed inset-0 bg-black/60 z-0 pointer-events-none"></div>

      <Navbar cartCount={cartCount} onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} currentUser={currentUser} onLogout={onLogout} />

      <main className="relative z-10 flex flex-col items-center justify-center my-auto px-4 text-center w-full max-w-4xl mx-auto py-10">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2">
          UNLEASH YOUR <span className="text-red-600">POTENTIAL</span>
        </h1>
        <p className="text-neutral-300 text-xs sm:text-sm font-medium mb-4 max-w-xl">
          Unified coaching ecosystem for gear, bundles, and nutrition rooms.
        </p>

        <VoiceConciergeSection onAddToCart={onAddToCart} />

        <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-md mt-4">
          <button onClick={() => navigate('/shop')} className="py-2.5 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs tracking-wider transition">Shop Gear</button>
          <button onClick={() => navigate('/book-session')} className="py-2.5 px-6 bg-neutral-900/80 hover:bg-neutral-800 text-white font-bold rounded-lg border border-neutral-700 text-xs tracking-wider transition">Training Bundles</button>
          <button onClick={() => navigate('/room')} className="py-2.5 px-6 bg-neutral-900/80 hover:bg-neutral-800 text-white font-bold rounded-lg border border-neutral-700 text-xs tracking-wider transition">Nutrition Room</button>
        </div>
      </main>

      <footer className="relative z-10 text-center p-6 text-neutral-500 text-xs w-full">
        <p>&copy; {new Date().getFullYear()} My Coach Gym. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

const Shop = ({ onOpenAuth, onAddToCart, cartCount, onOpenCart, currentUser, onLogout }) => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    client.fetch(`*[_type == "product"] { _id, "title": name, price, "imageUrl": image.asset->url, description }`)
      .then(data => setProducts(data.map(i => ({ ...i, itemType: 'product' }))));
  }, []);
  
  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 px-6 pb-12">
      <Navbar cartCount={cartCount} onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} currentUser={currentUser} onLogout={onLogout} />
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-black mb-6">SHOP <span className="text-red-600">CATALOG</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map(p => (
            <div key={p._id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.title} className="w-full h-44 object-cover rounded-lg mb-3 border border-neutral-800" />
                ) : (
                  <div className="w-full h-44 bg-neutral-800 rounded-lg flex items-center justify-center text-xs text-neutral-500 mb-3">No Image</div>
                )}
                <h3 className="font-bold text-base text-white mb-1">{p.title}</h3>
                <p className="text-xs text-neutral-400 mb-4 line-clamp-2">{p.description}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-neutral-800 mt-auto">
                <span className="text-red-500 font-black text-lg">${p.price}</span>
                <button onClick={() => onAddToCart(p)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition shadow-md">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BookSession = ({ onOpenAuth, onAddToCart, cartCount, onOpenCart, currentUser, onLogout }) => {
  const [bundles, setBundles] = useState([]);
  useEffect(() => {
    client.fetch(`*[_type == "bundle"] { _id, title, daysPerWeek, price, description, "imageUrl": image.asset->url }`)
      .then(data => setBundles(data.map(i => ({ ...i, itemType: 'bundle' }))));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 px-6 pb-12">
      <Navbar cartCount={cartCount} onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} currentUser={currentUser} onLogout={onLogout} />
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-black mb-6">TRAINING <span className="text-red-600">BUNDLES</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {bundles.map(b => (
            <div key={b._id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.title} className="w-full h-44 object-cover rounded-lg mb-3 border border-neutral-800" />
                ) : (
                  <div className="w-full h-44 bg-neutral-800 rounded-lg flex items-center justify-center text-xs text-neutral-500 mb-3">No Image</div>
                )}
                <h3 className="font-bold text-base text-white mb-1">{b.title}</h3>
                <p className="text-xs text-neutral-400 mb-4 line-clamp-2">{b.description}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-neutral-800 mt-auto">
                <span className="text-red-500 font-black text-lg">${b.price}</span>
                <button onClick={() => onAddToCart(b)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition shadow-md">
                  Book Bundle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Room = ({ onOpenAuth, cartCount, onOpenCart, currentUser, onLogout }) => {
  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 px-6 pb-12">
      <Navbar cartCount={cartCount} onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} currentUser={currentUser} onLogout={onLogout} />
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-black mb-6">NUTRITION & VIRTUAL <span className="text-red-600">ROOMS</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="font-bold text-lg mb-2 text-white">Nutrition Strategy Room</h3>
              <p className="text-xs text-neutral-400 mb-4">Live Q&A and diet macros roadmap for fighters and lifters.</p>
            </div>
            <button className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition">Enter Room</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('gym_current_user');
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); } catch (e) { localStorage.removeItem('gym_current_user'); }
    }
  }, []);

  const handleAddToCart = (item) => {
    setCart(prev => {
      const existing = prev.findIndex(i => i._id === item._id);
      if (existing > -1) {
        return prev.map((i, idx) => idx === existing ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, delta) => {
    setCart(prev => prev.map(i => i._id === id ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
  };

  const handleLogout = () => {
    localStorage.removeItem('gym_auth_token');
    localStorage.removeItem('gym_current_user');
    setCurrentUser(null);
  };

  const handleProceedToCheckout = async () => {
    setOrderStatus(null);
    if (!currentUser) {
      setOrderStatus({ success: false, message: 'Please log in first.' });
      setIsAuthOpen(true);
      return;
    }
    const token = localStorage.getItem('gym_auth_token');
    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ items: cart, totalPrice })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setOrderStatus({ success: true, message: '✓ Order placed successfully!' });
      setCart([]);
      setTimeout(() => { setOrderStatus(null); setIsCartOpen(false); }, 3000);
    } catch (err) {
      setOrderStatus({ success: false, message: err.message });
    }
  };

  const totalCartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardNavigation onOpenAuth={() => setIsAuthOpen(true)} cartCount={totalCartCount} onOpenCart={() => setIsCartOpen(true)} currentUser={currentUser} onLogout={handleLogout} onAddToCart={handleAddToCart} />} />
        <Route path="/shop" element={<Shop onOpenAuth={() => setIsAuthOpen(true)} onAddToCart={handleAddToCart} cartCount={totalCartCount} onOpenCart={() => setIsCartOpen(true)} currentUser={currentUser} onLogout={handleLogout} />} />
        <Route path="/book-session" element={<BookSession onOpenAuth={() => setIsAuthOpen(true)} onAddToCart={handleAddToCart} cartCount={totalCartCount} onOpenCart={() => setIsCartOpen(true)} currentUser={currentUser} onLogout={handleLogout} />} />
        <Route path="/room" element={<Room onOpenAuth={() => setIsAuthOpen(true)} cartCount={totalCartCount} onOpenCart={() => setIsCartOpen(true)} currentUser={currentUser} onLogout={handleLogout} />} />
      </Routes>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthSuccess={(user) => setCurrentUser(user)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} onUpdateQuantity={handleUpdateQuantity} onProceedToCheckout={handleProceedToCheckout} orderStatus={orderStatus} />
    </Router>
  );
}