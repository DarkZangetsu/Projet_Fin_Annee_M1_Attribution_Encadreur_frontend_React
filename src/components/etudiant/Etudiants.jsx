import React, { useState, useEffect } from "react";
import {
  Add as PlusIcon,
  Edit as PencilIcon,
  Delete as TrashIcon,
} from "@mui/icons-material";
import {
  Button,
  TextField,
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
  MenuItem,
  InputLabel,
  FormControl,
  Select,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAxiosInstance } from "../../getAxiosInstance";

const getCurrentUserId = () => {
  return localStorage.getItem("userId");
};

const EtudiantForm = ({ etudiant, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    etudiant || {
      matricule: "",
      nom: "",
      prenom: "",
      email: "",
      id_niveau: "",
      annee_academique: "",
    }
  );

  const [niveaux, setNiveaux] = useState([]);

  // Appel API pour récupérer les niveaux
  useEffect(() => {
    const fetchNiveaux = async () => {
      try {
        const response = await getAxiosInstance().get("/niveaux");
        setNiveaux(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des niveaux:", error);
      }
    };

    fetchNiveaux();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id_utilisateur: getCurrentUserId(),
      ...formData,    
    });
  };

  

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        name="matricule"
        label="Matricule"
        value={formData.matricule}
        onChange={handleChange}
        required
        fullWidth
      />
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
      <TextField
        name="email"
        label="Email"
        value={formData.email}
        onChange={handleChange}
        required
        fullWidth
      />

      {/* Menu déroulant pour les niveaux */}
      <FormControl fullWidth required>
        <InputLabel id="niveau-label">Niveau</InputLabel>
        <Select
          labelId="niveau-label"
          name="id_niveau"
          value={formData.id_niveau}
          onChange={handleChange}
        >
          {niveaux.length === 0 ? (
            <MenuItem disabled>Chargement des niveaux...</MenuItem>
          ) : (
            niveaux.map((niveau) => (
              <MenuItem key={niveau.id_niveau} value={niveau.id_niveau}>
                {niveau.code_niveau}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      <TextField
        name="annee_academique"
        label="Année Académique"
        value={formData.annee_academique}
        onChange={handleChange}
        required
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

export default function Etudiants() {
  const [etudiants, setEtudiants] = useState([]);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [niveaux, setNiveaux] = useState([]);

  useEffect(() => {
    fetchEtudiants();
    fetchNiveaux();
  }, []);

  const fetchNiveaux = async () => {
    try {
      const response = await getAxiosInstance().get("/niveaux");
      setNiveaux(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des niveaux:", error);
    }
  };

  const getCodeNiveau = (id_niveau) => {
    const niveau = niveaux.find((niveau) => niveau.id_niveau === id_niveau);
    return niveau ? niveau.code_niveau : "Niveau inconnu";
  };

  const fetchEtudiants = async () => {
    try {
      setIsLoading(true);
      const response = await getAxiosInstance().get("/etudiants");
      if (Array.isArray(response.data)) {
        setEtudiants(response.data);
      } else {
        throw new Error("Les données des étudiants ne sont pas un tableau");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Impossible de charger les étudiants");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (newEtudiant) => {
    console.log('Données envoyées:', newEtudiant);
    try {
      const response = await getAxiosInstance().post("/etudiants", newEtudiant);
      if (response.status === 201) {
        toast.success("Étudiant créé avec succès");
        setTimeout(async () => {
          await fetchEtudiants();
          setIsCreateModalOpen(false);
        }, 2000);
      } else {
        throw new Error("Création échouée");
      }
    } catch (err) {
      toast.error("Impossible de créer l'étudiant");
    }
  };
  
  const handleUpdate = async (updatedEtudiant) => {
    console.log('Etudiant mis à jour:', updatedEtudiant);
    try {
      if (!updatedEtudiant.id_etudiant) {
        toast.error("L'ID de l'étudiant est manquant");
        return;
      }
      const userId = getCurrentUserId();
  
      const updatedData = {
        id_utilisateur: userId,
        matricule: updatedEtudiant.matricule,
        nom: updatedEtudiant.nom,
        prenom: updatedEtudiant.prenom,
        email: updatedEtudiant.email,
        id_niveau: updatedEtudiant.id_niveau,
        annee_academique: updatedEtudiant.annee_academique
      };
  
      await getAxiosInstance().put(
        `/etudiants/${updatedEtudiant.id_etudiant}`,
        updatedData
      );
      
      toast.success("Étudiant mis à jour avec succès");
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      toast.success("Étudiant mis à jour avec succès");
    } finally {
      setTimeout(async () => {
        await fetchEtudiants();
        setIsUpdateModalOpen(false);
      }, 2000);
    }
  };
    
  const handleDelete = async (id_etudiant) => {
    if (!id_etudiant) {
      toast.error("L'ID de l'étudiant est manquant");
      return;
    }
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
      try {
        await getAxiosInstance().delete(`/etudiants/${id_etudiant}`);
        toast.success("Étudiant supprimé avec succès");
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        toast.success("Étudiant supprimé avec succès");
      } finally {
        setTimeout(async () => {
          await fetchEtudiants();
        }, 2000);
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
      <ToastContainer/>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Liste des Étudiants
        </h1>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusIcon className="mr-2" /> Ajouter un étudiant
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Matricule</strong></TableCell>
              <TableCell><strong>Nom</strong></TableCell>
              <TableCell><strong>Prénom</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Niveau</strong></TableCell>
              <TableCell><strong>Année Academique</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {etudiants.map((etudiant) => (
              <TableRow key={etudiant?.id_etudiant}>
                <TableCell>{etudiant.matricule}</TableCell>
                <TableCell>{etudiant.nom}</TableCell>
                <TableCell>{etudiant.prenom}</TableCell>
                <TableCell>{etudiant.email}</TableCell>
                <TableCell>{getCodeNiveau(etudiant.id_niveau)}</TableCell>
                <TableCell>{etudiant.annee_academique}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setSelectedEtudiant(etudiant);
                      setIsUpdateModalOpen(true);
                    }}
                  >
                    <PencilIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleDelete(etudiant?.id_etudiant)}
                  >
                    <TrashIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Ajouter un étudiant</DialogTitle>
        <DialogContent>
          <EtudiantForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Modifier un étudiant</DialogTitle>
        <DialogContent>
          <EtudiantForm
            etudiant={selectedEtudiant}
            onSubmit={handleUpdate}
            onCancel={() => setIsUpdateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
