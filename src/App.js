import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import { Navigate } from "react-router-dom";
import { Home } from "lucide-react";
import Etudiants from "./components/Etudiants";
import Enseignants from "./components/Enseignants";
import Niveaux from "./components/Niveaux";
import MembresGroupes from "./components/MembresGroupes";
import Encadrements from "./components/Encadrements";
import Groupes from "./components/Groupes";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={<DashboardLayout />} />
      </Routes>
    </Router>
  );
}

export default App;

const DashboardLayout = () => {
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <Dashboard>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/groupes" element={<Groupes />} />
        <Route path="/encadrements" element={<Encadrements />} />
        <Route path="/membres-groupes" element={<MembresGroupes />} />
        <Route path="/niveaux" element={<Niveaux />} />
        <Route path="/etudiants" element={<Etudiants />} />
        <Route path="/enseignants" element={<Enseignants />} />
      </Routes>
    </Dashboard>
  );
};
