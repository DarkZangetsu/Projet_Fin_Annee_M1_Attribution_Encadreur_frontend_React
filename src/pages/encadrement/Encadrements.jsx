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

const EncadrementForm = ({ encadrement, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    encadrement || {
      id_enseignant: "",
      id_groupe: "",
      annee_academique: "",
    }
  );

  const [enseignants, setEnseignants] = useState([]);
  const [groupes, setGroupes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enseignantsResponse, groupesResponse] = await Promise.all([
          getAxiosInstance().get("/enseignants"),
          getAxiosInstance().get("/groupes"),
        ]);
        setEnseignants(enseignantsResponse.data);
        setGroupes(groupesResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        toast.error("Erreur lors du chargement des données");
      }
    };

    fetchData();
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
      <FormControl fullWidth required>
        <InputLabel id="enseignant-label">Enseignant</InputLabel>
        <Select
          labelId="enseignant-label"
          name="id_enseignant"
          value={formData.id_enseignant}
          onChange={handleChange}
        >
          {enseignants.map((enseignant) => (
            <MenuItem
              key={enseignant.id_enseignant}
              value={enseignant.id_enseignant}
            >
              {`${enseignant.nom} ${enseignant.prenom}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required>
        <InputLabel id="groupe-label">Groupe</InputLabel>
        <Select
          labelId="groupe-label"
          name="id_groupe"
          value={formData.id_groupe}
          onChange={handleChange}
        >
          {groupes.map((groupe) => (
            <MenuItem key={groupe.id_groupe} value={groupe.id_groupe}>
              {groupe.nom_groupe}
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

export default function Encadrements() {
  const [encadrements, setEncadrements] = useState([]);
  const [selectedEncadrement, setSelectedEncadrement] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEncadrements, setFilteredEncadrements] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [selectedNiveau, setSelectedNiveau] = useState("");
  const [selectedEnseignant, setSelectedEnseignant] = useState("");

  const fetchNiveaux = async () => {
    try {
      const response = await getAxiosInstance().get("/niveaux");
      if (Array.isArray(response.data)) {
        setNiveaux(response.data);
      } else {
        console.error(
          "Les données des niveaux ne sont pas un tableau:",
          response.data
        );
        setNiveaux([]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des niveaux:", err);
      toast.error("Impossible de charger les niveaux");
      setNiveaux([]);
    }
  };

  const fetchEnseignants = async () => {
    try {
      const response = await getAxiosInstance().get("/enseignants");
      setEnseignants(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des enseignants:", err);
    }
  };

  const fetchEncadrements = async () => {
    try {
      setIsLoading(true);
      const response = await getAxiosInstance().get("/encadrements");
      if (Array.isArray(response.data)) {
        const encadrementsWithDetails = await Promise.all(
          response.data.map(async (encadrement) => {
            const [enseignantResponse, groupeResponse] = await Promise.all([
              getAxiosInstance().get(
                `/enseignants/${encadrement.id_enseignant}`
              ),
              getAxiosInstance().get(`/groupes/${encadrement.id_groupe}`),
            ]);
            return {
              ...encadrement,
              enseignant: enseignantResponse.data,
              groupe: groupeResponse.data,
            };
          })
        );
        setEncadrements(encadrementsWithDetails);
      } else {
        throw new Error("Les données des encadrements ne sont pas un tableau");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Impossible de charger les encadrements");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchEncadrements(),
        fetchNiveaux(),
        fetchEnseignants(),
      ]);
      setIsLoading(false);
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const results = encadrements.filter(
      (encadrement) =>
        (searchTerm === "" ||
          encadrement.enseignant.nom
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          encadrement.enseignant.prenom
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          encadrement.groupe.nom_groupe
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          encadrement.annee_academique
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) &&
        (selectedNiveau === "" ||
          encadrement.groupe.niveau.id_niveau === selectedNiveau) &&
        (selectedEnseignant === "" ||
          encadrement.enseignant.id_enseignant === selectedEnseignant)
    );
    setFilteredEncadrements(results);
  }, [searchTerm, encadrements, selectedNiveau, selectedEnseignant]);

  const handleCreate = async (newEncadrement) => {
    try {
      const response = await getAxiosInstance().post(
        "/encadrements",
        newEncadrement
      );
      if (response.status === 201) {
        toast.success("Encadrement créé avec succès");
        setTimeout(async () => {
          await fetchEncadrements();
          setIsCreateModalOpen(false);
        }, 2000);
      } else {
        throw new Error("Création échouée");
      }
    } catch (err) {
      toast.error("Impossible de créer l'encadrement");
    }
  };

  const handleUpdate = async (updatedEncadrement) => {
    try {
      if (!updatedEncadrement.id_encadrement) {
        toast.error("L'ID de l'encadrement est manquant");
        return;
      }
      const userId = getCurrentUserId();

      const updatedData = {
        id_utilisateur: userId,
        id_enseignant: updatedEncadrement.id_enseignant,
        id_groupe: updatedEncadrement.id_groupe,
        annee_academique: updatedEncadrement.annee_academique,
      };

      await getAxiosInstance().put(
        `/encadrements/${updatedEncadrement.id_encadrement}`,
        updatedData
      );
      toast.success("Encadrement mis à jour");
      fetchEncadrements();
      setIsUpdateModalOpen(false);
    } catch (err) {
      toast.success("Encadrement mis à jour");
      setTimeout(async () => {
        await fetchEncadrements();
        setIsCreateModalOpen(false);
      }, 2000);
    }
  };

  const handleDelete = async (id_encadrement) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet encadrement ?")
    ) {
      try {
        await getAxiosInstance().delete(`/encadrements/${id_encadrement}`);
        toast.success("Encadrement supprimé");
        setTimeout(async () => {
          await fetchEncadrements();
        }, 2000);
      } catch (err) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl">Liste des encadrements</h2>
        <Button
          variant="contained"
          startIcon={<PlusIcon />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Ajouter un encadrement
        </Button>
      </div>

      <div className="mb-3 flex flex-row items-center space-x-4">
        <div className="w-1/3">
          <TextField
            label="Recherche"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </div>

        <div className="w-1/3">
          <FormControl fullWidth>
            <InputLabel>Niveau</InputLabel>
            <Select
              value={selectedNiveau}
              onChange={(e) => setSelectedNiveau(e.target.value)}
            >
              <MenuItem value="">Tous les niveaux</MenuItem>
              {niveaux.map((niveau) => (
                <MenuItem key={niveau.id_niveau} value={niveau.id_niveau}>
                  {niveau.code_niveau}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="w-1/3">
          <FormControl fullWidth>
            <InputLabel>Enseignant</InputLabel>
            <Select
              value={selectedEnseignant}
              onChange={(e) => setSelectedEnseignant(e.target.value)}
            >
              <MenuItem value="">Tous les enseignants</MenuItem>
              {enseignants.map((enseignant) => (
                <MenuItem
                  key={enseignant.id_enseignant}
                  value={enseignant.id_enseignant}
                >
                  {enseignant.nom + " " + enseignant.prenom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <CircularProgress />
        </div>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : filteredEncadrements.length === 0 ? (
        <p>Aucun encadrement trouvé</p>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Enseignant</TableCell>
                <TableCell>Groupe</TableCell>
                <TableCell>Année Académique</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEncadrements.map((encadrement) => (
                <TableRow key={encadrement.id_encadrement}>
                  <TableCell>
                    {encadrement.enseignant
                      ? `${encadrement.enseignant.nom} ${encadrement.enseignant.prenom}`
                      : "Enseignant non défini"}
                  </TableCell>
                  <TableCell>
                    {encadrement.groupe
                      ? encadrement.groupe.nom_groupe
                      : "Groupe non défini"}
                  </TableCell>
                  <TableCell>{encadrement.annee_academique}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setSelectedEncadrement(encadrement);
                        setIsUpdateModalOpen(true);
                      }}
                    >
                      <PencilIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(encadrement.id_encadrement)}
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

      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <DialogTitle>Ajouter un encadrement</DialogTitle>
        <DialogContent>
          <EncadrementForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      >
        <DialogTitle>Modifier l'encadrement</DialogTitle>
        <DialogContent>
          {selectedEncadrement && (
            <EncadrementForm
              encadrement={selectedEncadrement}
              onSubmit={handleUpdate}
              onCancel={() => setIsUpdateModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
