import React, { useState } from 'react';
import axios from 'axios';
import {useNavigate } from 'react-router-dom';
const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('etudiant');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      alert("Veuillez accepter les conditions d'utilisation");
      return;
    }

    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/users/register`;
      const response = await axios.post(apiUrl, { email, password, role });
      console.log(response.data);
      localStorage.setItem('token', response.data.token);

      navigate('/');
      
      alert('Inscription réussie ! Vous allez être redirigé.');
    } catch (error) {
      console.error("Erreur d'inscription", error.response?.data || error.message);
      if (error.response && error.response.status === 400) {
        alert("L'inscription a échoué : " + error.response.data.message);
      } else {
        alert("Une erreur est survenue. Veuillez réessayer plus tard.");
      }
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="m-auto bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl flex">
        <div className="w-1/2 p-6 hidden md:block">
          <div className="relative h-64">
            <img
              src="register.jpg"
              alt="Illustration d'inscription"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 p-6">
        <h2 className="text-2xl font-bold mb-6 text-blue-600">Créer un compte</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Adresse e-mail"
              className="w-full p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full p-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="etudiant">Étudiant</option>
              <option value="enseignant">Enseignant</option>
              <option value="admin">Administrateur</option>
            </select>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="terms" className="text-sm">
                J'accepte les conditions d'utilisation et la politique de confidentialité.
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              S'inscrire
            </button>
          </form>
          <p className="mt-4 text-center">
            Vous avez déjà un compte ?
            <a href="/login" className="text-blue-600 ml-1 hover:underline">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
