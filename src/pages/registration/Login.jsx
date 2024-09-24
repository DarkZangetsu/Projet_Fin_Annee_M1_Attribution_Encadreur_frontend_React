import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/users/login`;
      const response = await axios.post(apiUrl, { email, password });

      const { token, userId } = response.data;

      if (token && userId) {
        // Stocker le token et l'ID utilisateur dans localStorage
        localStorage.setItem("authToken", token);
        localStorage.setItem("userId", userId);

        window.location.href = "/";
        alert("Connexion réussie! Vous allez être redirigé.");
      }
    } catch (error) {
      // Gestion des erreurs côté serveur ou requête
      if (error.response && error.response.data) {
        setError(error.response.data.message || "Erreur de connexion");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer plus tard.");
      }
      console.error("Erreur de connexion", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="m-auto bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl flex">
        <div className="w-1/2 p-6 hidden md:block">
          <div className="relative h-64">
            <img
              src="login.jpg"
              alt="Illustration de connexion"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 p-6">
          <h2 className="text-2xl font-bold mb-6 text-blue-600">Connexion</h2>
          {error && <div className="mb-4 text-red-600">{error}</div>}
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
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Se connecter
            </button>
          </form>
          <p className="mt-4 text-center">
            Vous n'avez pas de compte ?
            <a href="/register" className="text-blue-600 ml-1 hover:underline">
              S'inscrire
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
