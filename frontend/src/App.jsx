import React from "react";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Produtos from "./pages/Produtos";
import Funcionarios from "./pages/Funcionarios";
import Dashboard from "./pages/Dashboard";

function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <Link
        to="/"
        className="text-xl font-bold text-gray-800 hover:text-purple-600"
      >
        Fabrismart
      </Link>

      <div className="flex gap-6">
        <Link
          to="/dashboard"
          className={`font-medium hover:text-cyan-600 ${
            location.pathname === "/dashboard"
              ? "text-cyan-600"
              : "text-gray-600"
          }`}
        >
          Dashboard
        </Link>

        <Link
          to="/produtos"
          className={`font-medium hover:text-emerald-600 ${
            location.pathname === "/produtos"
              ? "text-emerald-600"
              : "text-gray-600"
          }`}
        >
          Produtos
        </Link>

        <Link
          to="/funcionarios"
          className={`font-medium hover:text-pink-600 ${
            location.pathname === "/funcionarios"
              ? "text-pink-600"
              : "text-gray-600"
          }`}
        >
          Funcionários
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
