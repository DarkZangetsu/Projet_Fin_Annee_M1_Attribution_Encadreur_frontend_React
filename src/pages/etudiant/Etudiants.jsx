import React, { useState, useEffect } from "react";
import { Add as PlusIcon, PictureAsPdf as PdfIcon } from "@mui/icons-material";
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
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  IconButton,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAxiosInstance } from "../../getAxiosInstance";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { PencilIcon, TrashIcon } from "lucide-react";

// Helper function to get the current user ID
const getCurrentUserId = () => {
  return localStorage.getItem("userId");
};

// Form component for adding/updating students
const EtudiantForm = ({ etudiant, onSubmit, onCancel, niveaux }) => {
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
      <FormControl fullWidth required>
        <InputLabel id="niveau-label">Niveau</InputLabel>
        <Select
          labelId="niveau-label"
          name="id_niveau"
          value={formData.id_niveau}
          onChange={handleChange}
        >
          {niveaux.map((niveau) => (
            <MenuItem key={niveau.id_niveau} value={niveau.id_niveau}>
              {niveau.code_niveau}
            </MenuItem>
          ))}
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

// Main component to display student list and handle CRUD operations
export default function Etudiants() {
  const [etudiants, setEtudiants] = useState([]);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [niveaux, setNiveaux] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEtudiants, setFilteredEtudiants] = useState([]);
  const [filterNiveau, setFilterNiveau] = useState("");
  const [filterAnnee, setFilterAnnee] = useState("");

  useEffect(() => {
    fetchEtudiants();
    fetchNiveaux();
  }, []);

  useEffect(() => {
    const results = etudiants.filter(
      (etudiant) =>
        (etudiant.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
          etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          etudiant.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterNiveau === "" || etudiant.id_niveau === filterNiveau) &&
        (filterAnnee === "" || etudiant.annee_academique === filterAnnee)
    );
    setFilteredEtudiants(results);
  }, [searchTerm, etudiants, filterNiveau, filterAnnee]);

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
        annee_academique: updatedEtudiant.annee_academique,
      };

      await getAxiosInstance().put(
        `/etudiants/${updatedEtudiant.id_etudiant}`,
        updatedData
      );

      toast.success("Étudiant mis à jour avec succès");
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      toast.error("Impossible de mettre à jour l'étudiant");
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
        toast.error("Impossible de supprimer l'étudiant");
      } finally {
        setTimeout(async () => {
          await fetchEtudiants();
        }, 2000);
      }
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Matricule",
      "Nom",
      "Prénom",
      "Email",
      "Niveau",
      "Année Académique",
    ];
    const tableRows = [];

    filteredEtudiants.forEach((etudiant) => {
      const etudiantData = [
        etudiant.matricule,
        etudiant.nom,
        etudiant.prenom,
        etudiant.email,
        getCodeNiveau(etudiant.id_niveau),
        etudiant.annee_academique,
      ];
      tableRows.push(etudiantData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("Liste des étudiants", 14, 15);
    doc.save("liste_etudiants.pdf");
  };

  return (
    <div>
      <div className="flex justify-between">
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlusIcon />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Ajouter un étudiant
        </Button>
        <Button
          variant="outlined"
          startIcon={<PdfIcon />}
          onClick={exportToPDF}
        >
          Exporter PDF
        </Button>
      </div>

      <div className="my-4">
        <input
          type="text"
          placeholder="Recherche..."
          className="pl-10 pr-4 py-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex gap-4 my-4">
        <FormControl fullWidth>
          <InputLabel>Niveau</InputLabel>
          <Select
            value={filterNiveau}
            onChange={(e) => setFilterNiveau(e.target.value)}
          >
            <MenuItem value="">Tous les niveaux</MenuItem>
            {niveaux.map((niveau) => (
              <MenuItem key={niveau.id_niveau} value={niveau.id_niveau}>
                {niveau.code_niveau}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Année Académique"
          value={filterAnnee}
          onChange={(e) => setFilterAnnee(e.target.value)}
          fullWidth
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <CircularProgress />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Matricule</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Niveau</TableCell>
                <TableCell>Année Académique</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEtudiants.map((etudiant) => (
                <TableRow key={etudiant.id_etudiant}>
                  <TableCell>{etudiant.matricule}</TableCell>
                  <TableCell>{etudiant.nom}</TableCell>
                  <TableCell>{etudiant.prenom}</TableCell>
                  <TableCell>{etudiant.email}</TableCell>
                  <TableCell>{getCodeNiveau(etudiant.id_niveau)}</TableCell>
                  <TableCell>{etudiant.annee_academique}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setSelectedEtudiant(etudiant);
                        setIsUpdateModalOpen(true);
                      }}
                    >
                      <PencilIcon />
                    </IconButton>
                    <IconButton
                      color="error"
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
      )}

      {/* Create Modal */}
      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <DialogTitle>Ajouter un étudiant</DialogTitle>
        <DialogContent>
          <EtudiantForm
            niveaux={niveaux}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Update Modal */}
      <Dialog
        open={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      >
        <DialogTitle>Modifier un étudiant</DialogTitle>
        <DialogContent>
          <EtudiantForm
            etudiant={selectedEtudiant}
            niveaux={niveaux}
            onSubmit={handleUpdate}
            onCancel={() => setIsUpdateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </div>
  );
}
