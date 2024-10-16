import React, { useState, useEffect } from "react";
import {
  Add as PlusIcon,
  Edit as PencilIcon,
  Delete as TrashIcon,
  MoreVert as MoreVertIcon,
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
  Menu,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAxiosInstance } from "../../getAxiosInstance";

const getCurrentUserId = () => {
  return localStorage.getItem("userId");
};

const MembreGroupeForm = ({
  membreGroupe,
  onSubmit,
  onCancel,
  groupes,
  etudiants,
}) => {
  const [formData, setFormData] = useState(
    membreGroupe || {
      id_groupe: "",
      id_etudiant: "",
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
      <FormControl fullWidth>
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

      <FormControl fullWidth>
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
  // eslint-disable-next-line no-unused-vars
  const [selectedMembreGroupe, setSelectedMembreGroupe] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMembresGroupe, setFilteredMembresGroupe] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [selectedGroupe, setSelectedGroupe] = useState("");
  const [etudiants, setEtudiants] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [
        membresResponse,
        groupesResponse,
        etudiantsResponse,
        niveauxResponse,
      ] = await Promise.all([
        getAxiosInstance().get("/membres-groupe"),
        getAxiosInstance().get("/groupes"),
        getAxiosInstance().get("/etudiants"),
        getAxiosInstance().get("/niveaux"),
      ]);

      const membresGroupeWithDetails = await Promise.all(
        membresResponse.data.map(async (membreGroupe) => {
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
      setGroupes(groupesResponse.data);
      setEtudiants(etudiantsResponse.data);
      setNiveaux(niveauxResponse.data);
    } catch (err) {
      setError(err.message);
      toast.error("Impossible de charger les données");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMenuOpen = (event, groupId) => {
    setAnchorEl(event.currentTarget);
    setSelectedGroupId(groupId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGroupId(null);
  };

  const handleDeleteMember = (id_membre_groupe) => {
    handleDelete(id_membre_groupe);
    handleMenuClose();
  };

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
      const groupe = groupes.find(
        (g) => g.id_groupe === newMembreGroupe.id_groupe
      );
      const niveau = niveaux.find((n) => n.id_niveau === groupe.id_niveau);
      const membresActuels = membresGroupe.filter(
        (m) => m.id_groupe === newMembreGroupe.id_groupe
      );

      if (membresActuels.length >= niveau.taille_groupe) {
        toast.error(
          `Le groupe est déjà complet. Taille maximale : ${niveau.taille_groupe}`
        );
        return;
      }

      const response = await getAxiosInstance().post(
        "/membres-groupe",
        newMembreGroupe
      );
      if (response.status === 201) {
        toast.success("Membre de groupe ajouté avec succès");
        fetchData();
        setIsCreateModalOpen(false);
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
      fetchData();
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
        fetchData();
      } catch (err) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const groupedMembres = filteredMembresGroupe.reduce((acc, membre) => {
    if (!acc[membre.id_groupe]) {
      acc[membre.id_groupe] = [];
    }
    acc[membre.id_groupe].push(membre);
    return acc;
  }, {});

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
        <TextField
          label="Recherche"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />

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

      {isLoading ? (
        <div className="flex justify-center">
          <CircularProgress />
        </div>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : Object.keys(groupedMembres).length === 0 ? (
        <p>Aucun membre de groupe trouvé</p>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Groupe</TableCell>
                <TableCell>Étudiants</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedMembres).map(([groupeId, membres]) => (
                <TableRow key={groupeId}>
                  <TableCell>{membres[0].groupe.nom_groupe}</TableCell>
                  <TableCell>
                    {membres.map((membre) => (
                      <div key={membre.id_membre_groupe}>
                        {`${membre.etudiant.nom} ${membre.etudiant.prenom}`}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(event) => handleMenuOpen(event, groupeId)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedGroupId &&
          groupedMembres[selectedGroupId].map((membre) => (
            <div key={membre.id_membre_groupe}>
              <MenuItem
                onClick={() => handleDeleteMember(membre.id_membre_groupe)}
              >
                <TrashIcon fontSize="small" style={{ marginRight: "8px" }} />
                Supprimer {membre.etudiant.nom} {membre.etudiant.prenom}
              </MenuItem>
            </div>
          ))}
      </Menu>

      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <DialogTitle>Ajouter un membre de groupe</DialogTitle>
        <DialogContent>
          <MembreGroupeForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            groupes={groupes}
            etudiants={etudiants}
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
              groupes={groupes}
              etudiants={etudiants}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
