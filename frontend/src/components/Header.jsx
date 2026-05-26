import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API from "../services/api";
import Logo from "./Logo";

function Header() {
  const [isAuth, setIsAuth] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/auth/me")
      .then(() => setIsAuth(true))
      .catch(() => setIsAuth(false));

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  const navLinkClass = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;

  return (
    <header className={`saas-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container" style={{ width: "100%", display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
          <NavLink to="/" className="header-logo" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Logo size={28} />
            <span style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.03em" }}>PrepTracker</span>
          </NavLink>
        </div>

        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop Navigation */}
        {isAuth && (
          <nav className="header-nav desktop-only" style={{ flex: 4, display: "flex", justifyContent: "space-evenly", alignItems: "center", padding: "0 20px" }}>
            <NavLink to="/" className={navLinkClass}>Dashboard</NavLink>
            <NavLink to="/add" className={navLinkClass}>Add Problem</NavLink>
            <NavLink to="/skills" className={navLinkClass}>Skills</NavLink>
            <NavLink to="/company-sheet" className={navLinkClass}>Company Sheet</NavLink>
            <NavLink to="/jd-analyzer" className={navLinkClass}>JD Analyzer</NavLink>
            <NavLink to="/mock-interview" className={navLinkClass}>Mock Interview</NavLink>
            <NavLink to="/resume-improver" className={navLinkClass}>Resume Improver</NavLink>
          </nav>
        )}

        {/* Desktop Auth */}
        <div className="desktop-only" style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          {isAuth ? (
            <button onClick={handleLogout} className="btn-nav-login" style={{ color: "#ef4444" }}>
              Logout
            </button>
          ) : (
            <div className="auth-group">
              <NavLink to="/login" className="btn-nav-login">Log in</NavLink>
              <NavLink to="/signup" className="btn-nav-signup">Sign Up</NavLink>
            </div>
          )}
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`mobile-dropdown ${mobileMenuOpen ? 'open' : ''}`}>
          {isAuth && (
            <nav className="mobile-nav-links">
              <NavLink to="/" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>Dashboard</NavLink>
              <NavLink to="/add" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>Add Problem</NavLink>
              <NavLink to="/skills" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>Skills</NavLink>
              <NavLink to="/company-sheet" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>Company Sheet</NavLink>
              <NavLink to="/jd-analyzer" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>JD Analyzer</NavLink>
              <NavLink to="/mock-interview" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>Mock Interview</NavLink>
              <NavLink to="/resume-improver" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>Resume Improver</NavLink>
            </nav>
          )}
          
          <div className="mobile-auth-section">
            {isAuth ? (
              <button onClick={handleLogout} className="btn-nav-login w-full text-center" style={{ color: "#ef4444" }}>
                Logout
              </button>
            ) : (
              <div className="flex flex-col gap-3 w-full">
                <NavLink to="/login" className="btn-nav-login w-full text-center" onClick={() => setMobileMenuOpen(false)}>
                  Log in
                </NavLink>
                <NavLink to="/signup" className="btn-nav-signup w-full text-center" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </NavLink>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}

export default Header;
