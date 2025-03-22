// frontend/src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <h1>PredictBattle</h1>
          </Link>
        </div>
        <nav className="nav">
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <FaUser className="user-icon" />
                <span>{user?.username}</span>
              </div>
              <ul className="nav-links">
                <li>
                  <Link to="/dashboard">الرئيسية</Link>
                </li>
                <li>
                  <Link to="/sessions">جلساتي</Link>
                </li>
                <li>
                  <button className="btn-logout" onClick={handleLogout}>
                    <FaSignOutAlt />
                    <span>تسجيل الخروج</span>
                  </button>
                </li>
              </ul>
            </>
          ) : (
            <ul className="nav-links">
              <li>
                <Link to="/login">تسجيل الدخول</Link>
              </li>
              <li>
                <Link to="/register">التسجيل</Link>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;