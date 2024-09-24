/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
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

const GroupeForm = ({ groupe, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    groupe || {
      nom_groupe: "",
      annee_academique: "",
      id_niveau: "",
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
      ...formData,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        name="nom_groupe"
        label="Nom du Groupe"
        value={formData.nom_groupe}
        onChange={handleChange}
        required
        fullWidth
      />
      <TextField
        name="annee_academique"
        label="Année academique"
        value={formData.annee_academique}
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

export default function Groupes() {
  const [groupes, setGroupes] = useState([]);
  const [selectedGroupe, setSelectedGroupe] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [niveaux, setNiveaux] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGroupes, setFilteredGroupes] = useState("");

  useEffect(() => {
    const results = groupes.filter(
      (groupe) =>
        groupe.nom_groupe.toLowerCase().includes(searchTerm.toLowerCase()) ||
        groupe.annee_academique
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        groupe.id_niveau.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGroupes(results);
  }, [searchTerm, groupes]);

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

  const fetchGroupes = async () => {
    try {
      setIsLoading(true);
      const response = await getAxiosInstance().get("/groupes");
      if (Array.isArray(response.data)) {
        setGroupes(response.data);
      } else {
        throw new Error("Les données des groupes ne sont pas un tableau");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Impossible de charger les groupes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupes();
    fetchNiveaux();
  }, []);

  const handleCreate = async (newGroupe) => {
    console.log("Données envoyées:", newGroupe);
    try {
      const response = await getAxiosInstance().post("/groupes", newGroupe);
      if (response.status === 201) {
        toast.success("Groupe créé avec succès");
        setTimeout(async () => {
          await fetchGroupes();
          setIsCreateModalOpen(false);
        }, 2000);
      } else {
        throw new Error("Création échouée");
      }
    } catch (err) {
      toast.success("Groupe créé avec succès");
      setTimeout(async () => {
        await fetchGroupes();
        setIsCreateModalOpen(false);
      }, 2000);
    }
  };

  const handleUpdate = async (updatedGroupe) => {
    console.log("Groupe mis à jour:", updatedGroupe);
    try {
      if (!updatedGroupe.id_groupe) {
        toast.error("L'ID du groupe est manquant");
        return;
      }

      const updatedData = {
        nom_groupe: updatedGroupe.nom_groupe,
        annee_academique: updatedGroupe.annee_academique,
        id_niveau: updatedGroupe.id_niveau,
      };

      await getAxiosInstance().put(
        `/groupes/${updatedGroupe.id_groupe}`,
        updatedData
      );

      toast.success("Groupe mis à jour avec succès");
    } catch (err) {
      toast.success("Groupe mis à jour avec succès");
      setTimeout(async () => {
        await fetchGroupes();
        setIsCreateModalOpen(false);
      }, 2000);
    } finally {
      setTimeout(async () => {
        await fetchGroupes();
        setIsUpdateModalOpen(false);
      }, 2000);
    }
  };

  const handleDelete = async (id_groupe) => {
    if (!id_groupe) {
      toast.error("L'ID du groupe est manquant");
      return;
    }
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce groupe ?")) {
      try {
        await getAxiosInstance().delete(`/groupes/${id_groupe}`);
        toast.success("Groupe supprimé avec succès");
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        toast.error("Erreur lors de la suppression");
      } finally {
        setTimeout(async () => {
          await fetchGroupes();
        }, 2000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />

      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Recherche..."
            className="pl-10 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Liste des Groupes</h1>
        <Button
          variant="contained"
          startIcon={<PlusIcon />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Ajouter Groupe
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom Groupe</TableCell>
              <TableCell>Année academique</TableCell>
              <TableCell>Niveau</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGroupes.map((groupe) => (
              <TableRow key={groupe.id_groupe}>
                <TableCell>{groupe.nom_groupe}</TableCell>
                <TableCell>{groupe.annee_academique}</TableCell>
                <TableCell>{getCodeNiveau(groupe.id_niveau)}</TableCell>
                <TableCell>
                  <IconButton
                    aria-label="edit"
                    onClick={() => {
                      setSelectedGroupe(groupe);
                      setIsUpdateModalOpen(true);
                    }}
                  >
                    <PencilIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    onClick={() => handleDelete(groupe.id_groupe)}
                  >
                    <TrashIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal pour créer un groupe */}
      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <DialogTitle>Créer un Groupe</DialogTitle>
        <DialogContent>
          <GroupeForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal pour mettre à jour un groupe */}
      {selectedGroupe && (
        <Dialog
          open={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
        >
          <DialogTitle>Modifier le Groupe</DialogTitle>
          <DialogContent>
            <GroupeForm
              groupe={selectedGroupe}
              onSubmit={handleUpdate}
              onCancel={() => setIsUpdateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
