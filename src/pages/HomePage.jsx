/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { getAxiosInstance } from "../getAxiosInstance";
import {
  Users,
  UserCheck,
  BookOpen,
  TrendingUp,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444"];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalGroups: 0,
    studentsWithGroup: 0,
    studentsWithoutGroup: 0,
    teachersWithEncadrement: 0,
    teachersWithoutEncadrement: 0,
    groupsWithEncadreur: 0,
    groupsWithoutEncadreur: 0,
  });

  // eslint-disable-next-line no-unused-vars
  const [groupsByLevel, setGroupsByLevel] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardResponse, groupsResponse] = await Promise.all([
          getAxiosInstance().get("/dashboard"),
          getAxiosInstance().get("/groupes"),
        ]);

        setStats(dashboardResponse.data);

        // Process groups by level
        const levelCounts = groupsResponse.data.reduce((acc, group) => {
          acc[group.niveau] = (acc[group.niveau] || 0) + 1;
          return acc;
        }, {});

        setGroupsByLevel(
          Object.entries(levelCounts).map(([level, count]) => ({
            level,
            count,
          }))
        );
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Tableau de Bord
        </h1>
        <p className="text-gray-600">Vue d'ensemble des statistiques</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <StatCard
          title="Total Étudiants"
          value={stats.totalStudents}
          icon={<Users className="w-6 h-6" />}
          change={"+12%"}
          isPositive={true}
          variants={itemVariants}
        />
        <StatCard
          title="Total Enseignants"
          value={stats.totalTeachers}
          icon={<UserCheck className="w-6 h-6" />}
          change={"+5%"}
          isPositive={true}
          variants={itemVariants}
        />
        <StatCard
          title="Total Groupes"
          value={stats.totalGroups}
          icon={<BookOpen className="w-6 h-6" />}
          change={"+8%"}
          isPositive={true}
          variants={itemVariants}
        />
        <StatCard
          title="Taux de Réussite"
          value="85%"
          icon={<TrendingUp className="w-6 h-6" />}
          change={"+3%"}
          isPositive={true}
          variants={itemVariants}
        />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        <PieChartCard
          title="Étudiants avec/sans Groupe"
          data={[
            { name: "Avec Groupe", value: stats.studentsWithGroup },
            { name: "Sans Groupe", value: stats.studentsWithoutGroup },
          ]}
          variants={itemVariants}
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
          variants={itemVariants}
        />
        <PieChartCard
          title="Groupes avec/sans Encadreur"
          data={[
            { name: "Avec Encadreur", value: stats.groupsWithEncadreur },
            { name: "Sans Encadreur", value: stats.groupsWithoutEncadreur },
          ]}
          variants={itemVariants}
        />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6"
      >
        {/* <BarChartCard
          title="Total de Groupes par Niveau"
          data={groupsByLevel}
          variants={itemVariants}
        /> */}
      </motion.div>
    </div>
  );
};
const StatCard = ({ title, value, icon, change, isPositive, variants }) => (
  <motion.div
    variants={variants}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
  >
    <div className="flex items-start justify-between">
      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">{icon}</div>
      <div
        className={`flex items-center ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}
      >
        {change}
        {isPositive ? (
          <ChevronUp className="w-4 h-4 ml-1" />
        ) : (
          <ChevronDown className="w-4 h-4 ml-1" />
        )}
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-4xl font-bold text-gray-800">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {value}
        </motion.span>
      </h3>
      <p className="text-sm text-gray-600 mt-1">{title}</p>
    </div>
  </motion.div>
);

const PieChartCard = ({ title, data, variants }) => (
  <motion.div
    variants={variants}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
  >
    <h2 className="text-xl font-semibold mb-6 text-gray-800">{title}</h2>
    <div className="h-[300px] relative">
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
            dataKey="value"
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "none",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5 }}
      className="absolute bottom-4 right-4 bg-indigo-50 rounded-full p-2"
    >
      <div className="flex gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-gray-600">{item.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

// const BarChartCard = ({ title, data, variants }) => (
//   <motion.div
//     variants={variants}
//     whileHover={{ y: -5, transition: { duration: 0.2 } }}
//     className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
//   >
//     <h2 className="text-xl font-semibold mb-6 text-gray-800">{title}</h2>
//     <div className="h-[300px] relative">
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart data={data}>
//           <XAxis dataKey="level" />
//           <YAxis />
//           <Tooltip />
//           <Bar dataKey="count" fill="#6366F1" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   </motion.div>
// );

export default Dashboard;
