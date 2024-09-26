import React, { useState, useEffect } from "react";
import {
  Add as PlusIcon,
  Edit as PencilIcon,
  Delete as TrashIcon,
} from "@mui/icons-material";
import {
  Button,
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
  TextField,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAxiosInstance } from "../../getAxiosInstance";

const getCurrentUserId = () => {
  return localStorage.getItem("userId");
};

const MembreGroupeForm = ({ membreGroupe, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    membreGroupe || {
      id_groupe: "",
      id_etudiant: "",
    }
  );

  const [groupes, setGroupes] = useState([]);
  const [etudiants, setEtudiants] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupesResponse, etudiantsResponse] = await Promise.all([
          getAxiosInstance().get("/groupes"),
          getAxiosInstance().get("/etudiants"),
        ]);
        setGroupes(groupesResponse.data);
        setEtudiants(etudiantsResponse.data);
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

      <FormControl fullWidth required>
        <InputLabel id="etudiant-label">Étudiant</InputLabel>
        <Select
          labelId="etudiant-label"
          name="id_etudiant"
          value={formData.id_etudiant}
          onChange={handleChange}
        >
          {etudiants.map((etudiant) => (
            <MenuItem key={etudiant.id_etudiant} value={etudiant.id_etudiant}>
              {`${etudiant.nom} ${etudiant.prenom}`}
            </MenuItem>
          ))}
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

export default function MembresGroupes() {
  const [membresGroupe, setMembresGroupe] = useState([]);
  const [selectedMembreGroupe, setSelectedMembreGroupe] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMembresGroupe, setFilteredMembresGroupe] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [selectedGroupe, setSelectedGroupe] = useState("");

  const fetchGroupes = async () => {
    try {
      const response = await getAxiosInstance().get("/groupes");
      setGroupes(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des groupes:", err);
    }
  };

  const fetchMembresGroupe = async () => {
    try {
      setIsLoading(true);
      const response = await getAxiosInstance().get("/membres-groupe");
      if (Array.isArray(response.data)) {
        const membresGroupeWithDetails = await Promise.all(
          response.data.map(async (membreGroupe) => {
            const [groupeResponse, etudiantResponse] = await Promise.all([
              getAxiosInstance().get(`/groupes/${membreGroupe.id_groupe}`),
              getAxiosInstance().get(`/etudiants/${membreGroupe.id_etudiant}`),
            ]);
            return {
              ...membreGroupe,
              groupe: groupeResponse.data,
              etudiant: etudiantResponse.data,
            };
          })
        );
        setMembresGroupe(membresGroupeWithDetails);
      } else {
        throw new Error(
          "Les données des membres de groupe ne sont pas un tableau"
        );
      }
    } catch (err) {
      setError(err.message);
      toast.error("Impossible de charger les membres de groupe");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembresGroupe();
    fetchGroupes();
  }, []);

  useEffect(() => {
    const results = membresGroupe.filter(
      (membreGroupe) =>
        (searchTerm === "" ||
          membreGroupe.etudiant.nom
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          membreGroupe.etudiant.prenom
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          membreGroupe.groupe.nom_groupe
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) &&
        (selectedGroupe === "" ||
          membreGroupe.groupe.id_groupe === selectedGroupe)
    );
    setFilteredMembresGroupe(results);
  }, [searchTerm, membresGroupe, selectedGroupe]);

  const handleCreate = async (newMembreGroupe) => {
    try {
      const response = await getAxiosInstance().post(
        "/membres-groupe",
        newMembreGroupe
      );
      if (response.status === 201) {
        toast.success("Membre de groupe ajouté avec succès");
        setTimeout(async () => {
          await fetchMembresGroupe();
          setIsCreateModalOpen(false);
        }, 2000);
      } else {
        throw new Error("Création échouée");
      }
    } catch (err) {
      toast.error("Impossible d'ajouter le membre de groupe");
    }
  };

  const handleUpdate = async (updatedMembreGroupe) => {
    try {
      if (!updatedMembreGroupe.id_membre_groupe) {
        toast.error("L'ID du membre de groupe est manquant");
        return;
      }
      const userId = getCurrentUserId();

      const updatedData = {
        id_utilisateur: userId,
        id_groupe: updatedMembreGroupe.id_groupe,
        id_etudiant: updatedMembreGroupe.id_etudiant,
      };

      await getAxiosInstance().put(
        `/membres-groupe/${updatedMembreGroupe.id_membre_groupe}`,
        updatedData
      );
      toast.success("Membre de groupe mis à jour");
      fetchMembresGroupe();
      setIsUpdateModalOpen(false);
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id_membre_groupe) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer ce membre du groupe ?")
    ) {
      try {
        await getAxiosInstance().delete(`/membres-groupe/${id_membre_groupe}`);
        toast.success("Membre de groupe supprimé");
        setTimeout(async () => {
          await fetchMembresGroupe();
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
        <h2 className="text-2xl">Liste des membres de groupe</h2>
        <Button
          variant="contained"
          startIcon={<PlusIcon />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Ajouter un membre
        </Button>
      </div>

      <div className="mb-3 flex flex-row items-center space-x-4">
        <div className="w-1/2">
          <TextField
            label="Recherche"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </div>

        <div className="w-1/2">
          <FormControl fullWidth>
            <InputLabel>Groupe</InputLabel>
            <Select
              value={selectedGroupe}
              onChange={(e) => setSelectedGroupe(e.target.value)}
            >
              <MenuItem value="">Tous les groupes</MenuItem>
              {groupes.map((groupe) => (
                <MenuItem key={groupe.id_groupe} value={groupe.id_groupe}>
                  {groupe.nom_groupe}
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
      ) : filteredMembresGroupe.length === 0 ? (
        <p>Aucun membre de groupe trouvé</p>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Étudiant</TableCell>
                <TableCell>Groupe</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembresGroupe.map((membreGroupe) => (
                <TableRow key={membreGroupe.id_membre_groupe}>
                  <TableCell>
                    {membreGroupe.etudiant
                      ? `${membreGroupe.etudiant.nom} ${membreGroupe.etudiant.prenom}`
                      : "Étudiant non défini"}
                  </TableCell>
                  <TableCell>
                    {membreGroupe.groupe
                      ? membreGroupe.groupe.nom_groupe
                      : "Groupe non défini"}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setSelectedMembreGroupe(membreGroupe);
                        setIsUpdateModalOpen(true);
                      }}
                    >
                      <PencilIcon />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        handleDelete(membreGroupe.id_membre_groupe)
                      }
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
        <DialogTitle>Ajouter un membre de groupe</DialogTitle>
        <DialogContent>
          <MembreGroupeForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      >
        <DialogTitle>Modifier le membre de groupe</DialogTitle>
        <DialogContent>
          {selectedMembreGroupe && (
            <MembreGroupeForm
              membreGroupe={selectedMembreGroupe}
              onSubmit={handleUpdate}
              onCancel={() => setIsUpdateModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
