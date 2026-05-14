import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-blue-900">
      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 px-16 text-white">
        <img
          src="/logo.png"
          alt="WOW Technologies"
          className="w-72 object-contain mb-8"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
        <p className="text-blue-200 text-center text-lg leading-relaxed">
          Sistema de gestión comercial para WOW Technologies S.A.C.
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-l-3xl">
        <div className="w-full max-w-sm px-8">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <img src="/logo.png" alt="WOW Technologies" className="h-14 mx-auto object-contain" />
          </div>

          <h2 className="text-2xl font-bold text-blue-900 mb-1">Bienvenido</h2>
          <p className="text-gray-500 text-sm mb-8">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="usuario@empresa.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 shadow-md shadow-blue-800/30 mt-2"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
