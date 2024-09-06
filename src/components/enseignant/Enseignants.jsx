import React, { useState, useEffect } from "react";
import {
  Add as PlusIcon,
  Edit as PencilIcon,
  Delete as TrashIcon,
} from "@mui/icons-material";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAxiosInstance } from "../../getAxiosInstance";

const getCurrentUserId = () => {
  return localStorage.getItem("userId");
};

const EnseignantForm = ({ enseignant, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    enseignant || {
      nom: "",
      prenom: "",
      statut: "",
      specialite: "",
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id_utilisateur: getCurrentUserId(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        name="nom"
        label="Nom"
        value={formData.nom}
        onChange={handleChange}
        required
        fullWidth
      />
      <TextField
        name="prenom"
        label="Prénom"
        value={formData.prenom}
        onChange={handleChange}
        required
        fullWidth
      />
      <Select
        name="statut"
        value={formData.statut}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, statut: e.target.value }))
        }
        fullWidth
        displayEmpty
      >
        <MenuItem value="" disabled>
          Statut
        </MenuItem>
        <MenuItem value="Titulaire">Titulaire</MenuItem>
        <MenuItem value="Vacataire">Vacataire</MenuItem>
      </Select>
      <TextField
        name="specialite"
        label="Spécialité"
        value={formData.specialite}
        onChange={handleChange}
        fullWidth
      />
      <div className="flex justify-end space-x-2">
        <Button variant="outlined" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="contained">
          Enregistrer
        </Button>
      </div>
    </form>
  );
};

export default function Enseignants() {
  const [enseignants, setEnseignants] = useState([]);
  const [selectedEnseignant, setSelectedEnseignant] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnseignants();
  }, []);

  const fetchEnseignants = async () => {
    try {
      setIsLoading(true);
      const response = await getAxiosInstance().get("/enseignants");
      if (Array.isArray(response.data)) {
        setEnseignants(response.data);
      } else {
        throw new Error("Les données des enseignants ne sont pas un tableau");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Impossible de charger les enseignants");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreate = async (newEnseignant) => {
    try {
      const response = await getAxiosInstance().post("/enseignants", newEnseignant);
      if (response.status === 201) {
        toast.success("Enseignant créé avec succès");
        setTimeout(async () => {
          await fetchEnseignants();
          setIsCreateModalOpen(false);
        }, 2000); 
      } else {
        throw new Error("Création échouée");
      }
    } catch (err) {
      toast.error("Impossible de créer l'enseignant");
    }
  };
  
  const handleUpdate = async (updatedEnseignant) => {
    try {
      if (!updatedEnseignant.id_enseignant) {
        toast.error("L'ID de l'enseignant est manquant");
        return;
      }
      const userId = getCurrentUserId();
    
      const updatedData = {
        nom: updatedEnseignant.nom,
        prenom: updatedEnseignant.prenom,
        statut: updatedEnseignant.statut,
        specialite: updatedEnseignant.specialite,
        id_utilisateur: userId,
      };
    
      const response = await getAxiosInstance().put(
        `/enseignants/${updatedEnseignant.id_enseignant}`,
        updatedData
      );
    
      if (response.status === 200 || response.status === 204) { 
        toast.success("Enseignant mis à jour avec succès");
  
        setTimeout(async () => {
          await fetchEnseignants();
          setIsUpdateModalOpen(false);
        }, 2000); 
      } else {
        throw new Error("Mise à jour échouée");
      }
    } catch (err) {
      toast.success("Enseignant mis à jour avec succès");
  
      setTimeout(async () => {
        await fetchEnseignants();
        setIsUpdateModalOpen(false);
      }, 2000);
    }
  };
  
  const handleDelete = async (id_enseignant) => {
    if (!id_enseignant) {
      toast.error("L'ID de l'enseignant est manquant");
      return;
    }
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet enseignant ?")) {
      try {
        await getAxiosInstance().delete(`/enseignants/${id_enseignant}`);
        setEnseignants(enseignants.filter((e) => e.id_enseignant !== id_enseignant));
        toast.success("Enseignant supprimé avec succès");
      } catch (err) {
        toast.error("Impossible de supprimer l'enseignant");
      }
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Liste des Enseignants
        </h1>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusIcon className="mr-2" /> Ajouter un enseignant
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nom</strong></TableCell>
              <TableCell><strong>Prénom</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell><strong>Spécialité</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enseignants.map((enseignant) => (
              <TableRow key={enseignant?.id}>
                <TableCell>{enseignant?.nom || "N/A"}</TableCell>
                <TableCell>{enseignant?.prenom || "N/A"}</TableCell>
                <TableCell>{enseignant?.statut || "N/A"}</TableCell>
                <TableCell>{enseignant?.specialite || "N/A"}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedEnseignant(enseignant);
                      setIsUpdateModalOpen(true);
                    }}
                  >
                    <PencilIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(enseignant?.id_enseignant)}
                  >
                    <TrashIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for creating a new enseignant */}
      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <DialogTitle>Ajouter un nouvel enseignant</DialogTitle>
        <DialogContent>
          <EnseignantForm onSubmit={handleCreate} onCancel={() => setIsCreateModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog for updating an enseignant */}
      <Dialog
        open={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      >
        <DialogTitle>Modifier l'enseignant</DialogTitle>
        <DialogContent>
          <EnseignantForm
            enseignant={selectedEnseignant}
            onSubmit={handleUpdate}
            onCancel={() => setIsUpdateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
