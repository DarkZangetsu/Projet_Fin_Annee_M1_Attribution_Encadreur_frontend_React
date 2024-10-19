import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getAxiosInstance } from "../getAxiosInstance";

// Définition de COLORS au niveau du composant
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalGroups: 0,
    studentsPerLevel: [],
    studentsWithGroup: 0,
    studentsWithoutGroup: 0,
    teachersWithEncadrement: 0,
    teachersWithoutEncadrement: 0,
    groupsWithEncadreur: 0,
    groupsWithoutEncadreur: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getAxiosInstance().get("/dashboard");
        setStats(response.data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données du tableau de bord:",
          error
        );
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tableau de Bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Étudiants" value={stats.totalStudents} />
        <StatCard title="Total Enseignants" value={stats.totalTeachers} />
        <StatCard title="Total Groupes" value={stats.totalGroups} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <PieChartCard
          title="Étudiants avec/sans Groupe"
          data={[
            { name: "Avec Groupe", value: stats.studentsWithGroup },
            { name: "Sans Groupe", value: stats.studentsWithoutGroup },
          ]}
        />
        <PieChartCard
          title="Enseignants avec/sans Encadrement"
          data={[
            { name: "Avec Encadrement", value: stats.teachersWithEncadrement },
            {
              name: "Sans Encadrement",
              value: stats.teachersWithoutEncadrement,
            },
          ]}
        />
        <PieChartCard
          title="Groupes avec/sans Encadreur"
          data={[
            { name: "Avec Encadreur", value: stats.groupsWithEncadreur },
            { name: "Sans Encadreur", value: stats.groupsWithoutEncadreur },
          ]}
        />
        <div className="bg-white shadow rounded-lg p-4 w-full h-96">
          <h2 className="text-xl font-semibold mb-4">Étudiants par Niveau</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.studentsPerLevel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Nombre d'étudiants" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white shadow rounded-lg p-4">
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const PieChartCard = ({ title, data }) => (
  <div className="bg-white shadow rounded-lg p-4 w-full h-96">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default Dashboard;
