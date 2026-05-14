import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Icons = {
  dashboard:   <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  clientes:    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  proveedores: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h13v10H3zM16 9h4l1 2v6h-5M7 17a2 2 0 104 0M17 17a2 2 0 104 0" /></svg>,
  marcas:     <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10l4 5-4 5H7l-4-5 4-5z" /></svg>,
  cotizacion:  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  orden:       <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  factura:     <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  actividad:   <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  pipeline:    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  recordatorio:<svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  reporte:     <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  ejecutivos:  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  config:      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  chevronDown: <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  search:      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  logout:      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

const MENU = [
  { key: 'dashboard',     label: 'Dashboard',     icon: Icons.dashboard,    to: '/' },
  { key: 'clientes',      label: 'Clientes',       icon: Icons.clientes,     to: '/clientes' },
  { key: 'proveedores',   label: 'Proveedores',    icon: Icons.proveedores,  to: '/proveedores' },
  { key: 'marcas',        label: 'Marcas',         icon: Icons.marcas,       to: '/marcas' },
  { key: 'cotizaciones',  label: 'Cotizaciones',   icon: Icons.cotizacion,   to: '/cotizaciones' },
  { key: 'ordenes',       label: 'Órdenes',        icon: Icons.orden,        to: '/ordenes' },
  { key: 'facturas',      label: 'Facturas',       icon: Icons.factura,      to: '/facturas' },
  { key: 'reportes',      label: 'Reportes',       icon: Icons.reporte,      to: '/reportes' },
];

const ADMIN_MENU = [
  { key: 'ejecutivos',    label: 'Ejecutivos',    icon: Icons.ejecutivos, to: '/ejecutivos' },
  { key: 'configuracion', label: 'Configuración',  icon: Icons.config,     to: '/configuracion' },
];

const PAGE_TITLES = {
  '/':               'Dashboard',
  '/clientes':       'Clientes',
  '/proveedores':    'Proveedores',
  '/marcas':         'Marcas',
  '/cotizaciones':   'Cotizaciones',
  '/ordenes':        'Órdenes',
  '/facturas':       'Facturas',
  '/actividades':    'Actividades',
  '/pipeline':       'Pipeline',
  '/recordatorios':  'Recordatorios',
  '/reportes':       'Reportes',
  '/ejecutivos':     'Ejecutivos',
  '/configuracion':  'Configuración',
};

const getPageTitle = (pathname) => {
  const exact = PAGE_TITLES[pathname];
  if (exact) return exact;
  const match = Object.keys(PAGE_TITLES).find(
    (k) => k !== '/' && pathname.startsWith(k)
  );
  return match ? PAGE_TITLES[match] : null;
};

const SITE_NAME = 'CRM - WOW Technologies';

const getActiveKeys = (pathname, items) =>
  items
    .filter((item) => item.children?.some((c) => pathname.startsWith(c.to)))
    .map((item) => item.key);

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const allMenuItems = [...MENU, ...ADMIN_MENU];
  const [openKeys, setOpenKeys] = useState(() =>
    new Set(getActiveKeys(location.pathname, allMenuItems))
  );

  useEffect(() => {
    const page = getPageTitle(location.pathname);
    document.title = page ? `${page} | ${SITE_NAME}` : SITE_NAME;
  }, [location.pathname]);

  useEffect(() => {
    const active = getActiveKeys(location.pathname, allMenuItems);
    if (active.length > 0) {
      setOpenKeys((prev) => {
        const next = new Set(prev);
        active.forEach((k) => next.add(k));
        return next;
      });
    }
  }, [location.pathname]);

  const toggleKey = (key) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user
    ? `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`.toUpperCase()
    : 'U';

  const renderItem = (item) => {
    if (item.to) {
      const active = location.pathname === item.to;
      return (
        <Link
          key={item.key}
          to={item.to}
          className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-sm transition-all duration-150
            ${active
              ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
              : 'text-blue-100 hover:bg-white/10'}`}
        >
          {item.icon}
          <span className="truncate">{item.label}</span>
        </Link>
      );
    }

    const isOpen = openKeys.has(item.key);
    const hasActiveChild = item.children.some((c) => location.pathname.startsWith(c.to));

    return (
      <div key={item.key}>
        <button
          onClick={() => toggleKey(item.key)}
          className={`w-[calc(100%-16px)] mx-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150
            ${hasActiveChild
              ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
              : 'text-blue-100 hover:bg-white/10'}`}
        >
          {item.icon}
          <span className="flex-1 text-left truncate">{item.label}</span>
          <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            {Icons.chevronDown}
          </span>
        </button>

        {/* ── Submenu panel flotante ── */}
        {isOpen && (
          <div
            className="mx-2 mt-1 mb-2 rounded-xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {item.children.map((child) => {
              const childActive = location.pathname === child.to;
              return (
                <Link
                  key={child.to}
                  to={child.to}
                  className={`flex items-center gap-2.5 py-2 px-3 text-xs transition-all duration-150
                    ${childActive
                      ? 'text-white font-semibold bg-white/10'
                      : 'text-blue-200 hover:text-white hover:bg-white/5'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors
                    ${childActive ? 'bg-white' : 'bg-blue-500'}`}
                  />
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#1e3a5f' }}>

      {/* ── Sidebar curvo ── */}
      <aside
        className="text-white flex flex-col shrink-0 relative z-20"
        style={{ width: '215px', background: '#1e3a5f' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center px-3 py-5">
          <img
            src="/logo.png"
            alt="WOW Technologies"
            className="object-contain w-full"
            style={{ filter: 'brightness(0) invert(1)', maxHeight: '52px' }}
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
          {MENU.map(renderItem)}
          {user?.rol === 'admin' && (
            <>
              <div className="px-5 pt-4 pb-1 text-xs text-blue-400 uppercase tracking-widest font-medium">
                Administración
              </div>
              {ADMIN_MENU.map(renderItem)}
            </>
          )}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-5 py-4 text-sm text-blue-300 hover:text-white hover:bg-white/10 transition-colors border-t border-white/10"
        >
          {Icons.logout}
          Cerrar sesión
        </button>
      </aside>

      {/* ── Panel derecho — borde orgánico SaaS ── */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          background: '#f4f6fb',
          borderRadius: '32px 0 0 32px',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.18)',
        }}
      >
        {/* Navbar */}
        <header
          className="flex items-center shrink-0 bg-white px-8 gap-4"
          style={{
            height: '64px',
            borderRadius: '32px 0 0 0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {/* Buscador pill */}
          <div className="relative" style={{ width: '340px' }}>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {Icons.search}
            </span>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-gray-700 placeholder-gray-400 text-sm pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 border border-gray-200"
              style={{
                height: '42px',
                borderRadius: '25px',
                fontSize: '14px',
              }}
            />
          </div>

          <div className="flex-1" />

          {/* Usuario */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-gray-800 text-sm font-semibold leading-none">
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-gray-400 text-xs capitalize mt-0.5">{user?.rol}</p>
            </div>
            <div
              className="flex items-center justify-center font-bold text-sm text-blue-900 shadow-md"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#f5b731',
              }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto" style={{ padding: '32px 36px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
