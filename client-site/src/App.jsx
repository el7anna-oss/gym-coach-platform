import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { client } from './sanityClient';
import { API_URL } from "../config/api"; // Make sure relative path is correct for your file location

// Fixed, light, and sleek Header/Navbar Component across all pages with Cart Toggle
const Navbar = ({ cartCount, onOpenCart, onOpenAuth, currentUser, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 sm:px-8 py-3 bg-neutral-900/85 backdrop-blur-md border-b border-neutral-700/50 shadow-lg text-white">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
        <span className="text-lg sm:text-xl font-black tracking-wider"> COACH </span>
      </div>

      <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide">
        <button onClick={() => navigate('/')} className="hover:text-red-500 transition">HOME</button>
        <button onClick={() => navigate('/shop')} className="hover:text-red-500 transition">SHOP</button>
        <button onClick={() => navigate('/book-session')} className="hover:text-red-500 transition">BOOK SESSION</button>
        <button onClick={() => navigate('/room')} className="px-4 py-1.5 border-2 border-red-600 rounded text-red-500 hover:bg-red-600 hover:text-white transition">ROOM</button>
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

// Slide-Over Cart Drawer Component with Success Notification and Error Styling
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
              <div className={`mt-4 p-3 rounded-xl border text-xs font-semibold text-center transition-all animate-fade-in ${
                orderStatus.success 
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                  : 'bg-red-600/20 border-red-500 text-red-400'
              }`}>
                {orderStatus.message}
              </div>
            )}

            <div className="mt-6 space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-sm">Your cart is currently empty.</div>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between bg-neutral-800/60 p-3 rounded-xl border border-neutral-700/60">
                    <div className="flex items-center space-x-3">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-14 h-14 object-cover rounded-lg border border-neutral-700" />
                      ) : (
                        <div className="w-14 h-14 bg-neutral-700 rounded-lg flex items-center justify-center text-[10px] text-neutral-400">No Img</div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-white line-clamp-1">{item.title}</h4>
                        <span className="text-xs text-red-500 font-bold">${item.price}</span>
                        <span className="block text-[10px] text-neutral-400 capitalize">Type: {item.itemType || 'Product'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => onUpdateQuantity(item._id, -1)}
                        className="w-7 h-7 bg-neutral-700 hover:bg-neutral-600 rounded flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item._id, 1)}
                        className="w-7 h-7 bg-neutral-700 hover:bg-neutral-600 rounded flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-neutral-400">Total Amount:</span>
              <span className="text-xl font-black text-red-500">${totalAmount.toFixed(2)}</span>
            </div>
            <button 
              onClick={onProceedToCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold rounded-xl text-sm transition shadow-lg tracking-wider"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Auth Modal connected to backend API
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
    const payload = isRegistering 
      ? { email, password, phone, address } 
      : { email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

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

      if (tokenValue) {
        localStorage.setItem('gym_auth_token', tokenValue);
      }
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
        
        <h3 className="text-xl font-black mb-1 text-center">
          {isRegistering ? 'CREATE AN ACCOUNT' : 'WELCOME BACK'}
        </h3>
        <p className="text-xs text-neutral-400 text-center mb-6">
          {isRegistering ? 'Register to save your session bookings & orders in Postgres.' : 'Log in to your account to continue.'}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded-lg text-xs text-red-400 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
              placeholder="name@example.com"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
              placeholder="••••••••"
              required 
            />
          </div>

          {isRegistering && (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                  placeholder="+961 XX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Delivery Address</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                  placeholder="City, Street, Building"
                />
              </div>
            </>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 text-white font-bold rounded-lg text-sm transition shadow-lg tracking-wider"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Register & Continue' : 'Log In')}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-neutral-400">
          {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-red-500 font-bold hover:underline"
          >
            {isRegistering ? 'Log In' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Book Session / Training Bundles Component
const BookSession = ({ onOpenAuth, onAddToCart, cartCount, onOpenCart, currentUser, onLogout }) => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = `*[_type == "bundle"] {
      _id,
      title,
      daysPerWeek,
      price,
      description,
      "imageUrl": image.asset->url
    }`;

    client.fetch(query)
      .then((data) => {
        const formattedBundles = data.map(item => ({ ...item, itemType: 'bundle' }));
        setBundles(formattedBundles);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching bundles from Sanity:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden pt-16">
      <div 
        className="fixed inset-0 w-full h-full z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop")` }}
      ></div>
      <div className="fixed inset-0 bg-black/75 z-0 pointer-events-none"></div>

      <Navbar cartCount={cartCount} onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} currentUser={currentUser} onLogout={onLogout} />

      <main className="relative z-10 grow px-4 sm:px-8 py-10 max-w-7xl mx-auto w-full flex flex-col items-center">
        <div className="text-center mb-10 w-full">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">TRAINING <span className="text-red-600">BUNDLES</span></h2>
          <p className="text-neutral-300 text-sm">Choose and book expert training session packages.</p>
        </div>

        <div className="w-full">
          {loading ? (
            <div className="text-center text-white py-12">Loading training bundles from Sanity Studio...</div>
          ) : bundles.length === 0 ? (
            <div className="text-center text-neutral-400 py-16 px-4 bg-neutral-900/90 backdrop-blur-md rounded-xl border border-neutral-800 max-w-xl mx-auto shadow-xl">
              <p className="text-base font-semibold text-white mb-2">No Training Bundles Found</p>
              <p className="text-xs text-neutral-400">Please add bundle items to your 'bundle' schema in Sanity Studio and publish them.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
              {bundles.map((bundle) => (
                <div key={bundle._id} className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl p-5 flex flex-col justify-between shadow-xl overflow-hidden">
                  <div className="w-full">
                    {bundle.imageUrl ? (
                      <img src={bundle.imageUrl} alt={bundle.title} className="w-full h-48 object-cover rounded-lg mb-4 border border-neutral-700" />
                    ) : (
                      <div className="w-full h-48 bg-neutral-800 rounded-lg mb-4 flex items-center justify-center text-neutral-500 text-xs">
                        No Image Available
                      </div>
                    )}
                    {bundle.daysPerWeek && (
                      <span className="text-xs font-bold text-red-500 uppercase tracking-widest block mb-1">{bundle.daysPerWeek} Days Per Week</span>
                    )}
                    <h3 className="text-white font-bold text-xl mb-2 leading-snug break-words">{bundle.title}</h3>
                    <div className="text-neutral-400 text-xs mb-6 leading-relaxed break-words overflow-hidden">
                      <p className="whitespace-normal">{bundle.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-800 mt-auto">
                    <span className="text-red-500 font-black text-lg">${bundle.price}</span>
                    <button 
                      onClick={() => onAddToCart(bundle)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition shadow-lg shrink-0"
                    >
                      Book Bundle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 text-center p-6 text-neutral-400 text-xs w-full bg-black/40">
        &copy; {new Date().getFullYear()} My Coach Gym. All Rights Reserved.
      </footer>
    </div>
  );
};

// Room Component
const Room = ({ onOpenAuth, cartCount, onOpenCart, currentUser, onLogout }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden pt-16">
      <div 
        className="fixed inset-0 w-full h-full z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop")` }}
      ></div>
      <div className="fixed inset-0 bg-black/75 z-0 pointer-events-none"></div>

      <Navbar cartCount={cartCount} onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} currentUser={currentUser} onLogout={onLogout} />

      <main className="relative z-10 grow px-4 sm:px-8 py-10 max-w-7xl mx-auto w-full flex flex-col items-center">
        <div className="text-center mb-10 w-full">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">VIRTUAL <span className="text-red-600">ROOM</span></h2>
          <p className="text-neutral-300 text-sm">Select an active training room or live stream below.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {[
            { id: 1, title: 'Main Stream & Q&A Room', status: 'Live Now', host: 'Coach Elite', imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1000&auto=format&fit=crop' },
            { id: 2, title: 'Technique Breakdown Room', status: 'Starting Soon', host: 'Coach Sarah', imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop' },
            { id: 3, title: 'Nutrition & Diet Strategy Room', status: 'Scheduled', host: 'Coach Mark', imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop' }
          ].map((room) => (
            <div key={room.id} className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-xl">
              <div>
                <img src={room.imageUrl} alt={room.title} className="w-full h-48 object-cover rounded-lg mb-4 border border-neutral-700" />
                <span className="inline-block px-2 py-1 bg-red-600/20 text-red-500 text-[10px] font-bold rounded mb-2">{room.status}</span>
                <h3 className="text-white font-bold text-xl mb-1">{room.title}</h3>
                <p className="text-neutral-400 text-xs mb-6">Host: {room.host}</p>
              </div>
              <button 
                onClick={() => {}}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition shadow-lg"
              >
                Join Room
              </button>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 text-center p-6 text-neutral-400 text-xs w-full bg-black/40">
        &copy; {new Date().getFullYear()} My Coach Gym. All Rights Reserved.
      </footer>
    </div>
  );
};

// Shop Component
const Shop = ({ onOpenAuth, onAddToCart, cartCount, onOpenCart, currentUser, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = `*[_type == "product"] {
      _id,
      "title": name,
      price,
      "imageUrl": image.asset->url,
      description
    }`;

    client.fetch(query)
      .then((data) => {
        const formattedProducts = data.map(item => ({ ...item, itemType: 'product' }));
        setProducts(formattedProducts);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products from Sanity:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden pt-16">
      <div 
        className="fixed inset-0 w-full h-full z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop")` }}
      ></div>
      <div className="fixed inset-0 bg-black/75 z-0 pointer-events-none"></div>

      <Navbar cartCount={cartCount} onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} currentUser={currentUser} onLogout={onLogout} />

      <main className="relative z-10 grow px-4 sm:px-8 py-10 max-w-7xl mx-auto w-full flex flex-col items-center">
        <div className="text-center mb-10 w-full">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">SHOP <span className="text-red-600">CATALOG</span></h1>
          <p className="text-neutral-300 text-sm">Explore premium fitness gear and merchandise.</p>
        </div>

        <div className="w-full">
          {loading ? (
            <div className="text-center text-white py-12">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center text-neutral-400 py-16 px-4 bg-neutral-900/90 backdrop-blur-md rounded-xl border border-neutral-800 max-w-xl mx-auto shadow-xl">
              <p className="text-base font-semibold text-white mb-2">Catalog is currently empty</p>
              <p className="text-xs text-neutral-400">No products found. Please add items to your 'product' schema.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-xl">
                  <div>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} className="w-full h-48 object-cover rounded-lg mb-4 border border-neutral-700" />
                    ) : (
                      <div className="w-full h-48 bg-neutral-800 rounded-lg mb-4 flex items-center justify-center text-neutral-500 text-xs">
                        No Image Available
                      </div>
                    )}
                    <h3 className="text-white font-bold text-lg mb-1">{product.title}</h3>
                    <p className="text-neutral-400 text-xs mb-4 line-clamp-2">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-800">
                    <span className="text-red-500 font-black text-lg">${product.price}</span>
                    <button 
                      onClick={() => onAddToCart(product)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 text-center p-6 text-neutral-400 text-xs w-full bg-black/40">
        <p>&copy; {new Date().getFullYear()} My Coach Gym. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

// Home Dashboard Component
const DashboardNavigation = ({ onOpenAuth, cartCount, onOpenCart, currentUser, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden pt-16">
      <div 
        className="fixed inset-0 w-full h-full z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop")` }}
      ></div>
      <div className="fixed inset-0 bg-black/60 z-0 pointer-events-none"></div>

      <Navbar cartCount={cartCount} onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} currentUser={currentUser} onLogout={onLogout} />

      <main className="relative z-10 flex flex-col items-center justify-center my-auto px-4 text-center w-full max-w-4xl mx-auto py-20">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-3">
          UNLEASH YOUR <span className="text-red-600">POTENTIAL</span>
        </h1>
        <p className="text-neutral-300 text-xs sm:text-sm md:text-base font-medium tracking-wide mb-8 max-w-xl">
          Expert coaching, training bundles, and a community that pushes you further.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button 
            onClick={() => navigate('/book-session')}
            className="w-full sm:w-auto py-3 px-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg tracking-wider transition shadow-lg"
          >
            START TRAINING
          </button>

          <button 
            onClick={() => navigate('/shop')}
            className="w-full sm:w-auto py-3 px-8 bg-neutral-900/80 hover:bg-neutral-800 text-white font-bold rounded-lg border border-neutral-700 tracking-wider transition shadow-lg"
          >
            View Shop
          </button>
        </div>

        {!currentUser && (
          <div className="mt-6 text-xs text-neutral-400">
            Already a member?{' '}
            <span 
              onClick={onOpenAuth} 
              className="text-red-500 font-semibold cursor-pointer hover:underline"
            >
              Log In or Create Account
            </span>
          </div>
        )}
      </main>

      <footer className="relative z-10 text-center p-6 text-neutral-500 text-xs w-full">
        <p>&copy; {new Date().getFullYear()} My Coach Gym. All Rights Reserved.</p>
      </footer>
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
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('gym_current_user');
      }
    }
  }, []);

  const handleAddToCart = (item) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(cartItem => cartItem._id === item._id);
      if (existingIndex > -1) {
        return prevCart.map((cartItem, index) => 
          index === existingIndex 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item._id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('gym_auth_token');
    localStorage.removeItem('gym_current_user');
    setCurrentUser(null);
  };

  const handleProceedToCheckout = async () => {
    setOrderStatus(null);

    if (!currentUser) {
      setOrderStatus({ success: false, message: 'Please create an account or log in first to proceed to checkout.' });
      setIsAuthOpen(true);
      return;
    }

    const token = localStorage.getItem('gym_auth_token');
    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          totalPrice
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      setOrderStatus({ success: true, message: '✓ Order was created successfully' });
      setCart([]);
      
      setTimeout(() => {
        setOrderStatus(null);
        setIsCartOpen(false);
      }, 3000);
    } catch (err) {
      setOrderStatus({ success: false, message: `Checkout Error: ${err.message}` });
    }
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardNavigation onOpenAuth={() => setIsAuthOpen(true)} cartCount={totalCartCount} onOpenCart={() => setIsCartOpen(true)} currentUser={currentUser} onLogout={handleLogout} />} />
        <Route path="/shop" element={<Shop onOpenAuth={() => setIsAuthOpen(true)} onAddToCart={handleAddToCart} cartCount={totalCartCount} onOpenCart={() => setIsCartOpen(true)} currentUser={currentUser} onLogout={handleLogout} />} />
        <Route path="/book-session" element={<BookSession onOpenAuth={() => setIsAuthOpen(true)} onAddToCart={handleAddToCart} cartCount={totalCartCount} onOpenCart={() => setIsCartOpen(true)} currentUser={currentUser} onLogout={handleLogout} />} />
        <Route path="/room" element={<Room onOpenAuth={() => setIsAuthOpen(true)} cartCount={totalCartCount} onOpenCart={() => setIsCartOpen(true)} currentUser={currentUser} onLogout={handleLogout} />} />
      </Routes>
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={(user) => { 
          setCurrentUser(user); 
        }} 
      />
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        onUpdateQuantity={handleUpdateQuantity}
        onProceedToCheckout={handleProceedToCheckout}
        orderStatus={orderStatus}
      />
    </Router>
  );
}