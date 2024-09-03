import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/registration/Login';
import Register from './components/registration/Register';
import { Navigate } from "react-router-dom";
import { Home } from "lucide-react";
import Groupes from "./components/groupe/Groupes";
import Encadrements from "./components/encadrement/Encadrements";
import MembresGroupes from "./components/membregroupe/MembresGroupes";
import Niveaux from "./components/niveau/Niveaux";
import Etudiants from "./components/etudiant/Etudiants";
import Enseignants from "./components/enseignant/Enseignants";


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
