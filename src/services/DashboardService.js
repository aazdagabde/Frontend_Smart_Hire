import axios from "axios";
import AuthService from "./AuthService"; 

// Adaptation automatique de l'URL (Prod vs Dev)
const isProduction = process.env.NODE_ENV === 'production';
const API_URL = isProduction
  ? "https://backend-smart-hire.onrender.com/api/dashboard"
  : "http://localhost:8080/api/dashboard";

const getDashboardStats = async () => {
  // On utilise AuthService pour récupérer le user proprement
  const user = AuthService.getCurrentUser();

  if (!user || !user.jwt) {
     throw new Error("Utilisateur non authentifié");
  }

  const response = await axios.get(API_URL + "/stats", {
    headers: {
      Authorization: `Bearer ${user.jwt}`, // Correction ici : 'jwt' au lieu de 'token'
    },
  });

  return response.data;
};

const DashboardService = {
  getDashboardStats,
};

export default DashboardService;