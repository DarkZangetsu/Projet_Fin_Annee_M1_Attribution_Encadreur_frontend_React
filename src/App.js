import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from './pages/dashboard/Dashboard';

import Register from './pages/registration/Register';
import Groupes from "./pages/groupe/Groupes";
import Encadrements from "./pages/encadrement/Encadrements";
import MembresGroupes from "./pages/membregroupe/MembresGroupes";
import Niveaux from "./pages/niveau/Niveaux";
import Etudiants from "./pages/etudiant/Etudiants";
import Enseignants from "./pages/enseignant/Enseignants";
import PrivateRoute from "./PrivateRoute"; 
import Login from "./pages/registration/Login";
import GroupDisplay from "./pages/display/Display";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/*"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

const DashboardLayout = () => {
  return (
    <Dashboard>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/groupes" element={<Groupes />} />
        <Route path="/encadrements" element={<Encadrements />} />
        <Route path="/membres-groupes" element={<MembresGroupes />} />
        <Route path="/niveaux" element={<Niveaux />} />
        <Route path="/etudiants" element={<Etudiants />} />
        <Route path="/enseignants" element={<Enseignants />} />
        <Route path="/display" element={<GroupDisplay />} />
      </Routes>
    </Dashboard>
  );
};
