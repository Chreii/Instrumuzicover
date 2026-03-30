import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login = ({ setIsLoggedIn }: { setIsLoggedIn: (val: boolean) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful login
    setIsLoggedIn(true);
    navigate('/gallery');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <form onSubmit={handleLogin} className="p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded dark:bg-zinc-800 dark:text-white"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded dark:bg-zinc-800 dark:text-white"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
      </form>
    </div>
  );
};
