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
  Alert,
  Typography,
  Checkbox,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAxiosInstance } from "../../getAxiosInstance";

const GroupeForm = ({
  groupe,
  onSubmit,
  onCancel,
  existingGroupes,
  niveaux,
  isEditing,
}) => {
  const [formData, setFormData] = useState({
    prefixe_groupe: "",
    numero_debut: 1,
    nombre_groupes: 1,
    annee_academique: "",
    id_niveau: "",
  });

  const [previewGroupes, setPreviewGroupes] = useState([]);
  const [existingNumbers, setExistingNumbers] = useState(new Set());

  useEffect(() => {
    if (isEditing && groupe) {
      const [codeNiveau, nomGroupe, numero] = groupe.nom_groupe.split("-");
      setFormData({
        prefixe_groupe: nomGroupe,
        numero_debut: parseInt(numero),
        nombre_groupes: 1,
        annee_academique: groupe.annee_academique,
        id_niveau: groupe.id_niveau,
      });
    }
  }, [isEditing, groupe]);

  useEffect(() => {
    if (existingGroupes && formData.id_niveau && formData.prefixe_groupe) {
      const selectedNiveau = niveaux.find(
        (n) => n.id_niveau === formData.id_niveau
      );
      const codeNiveau = selectedNiveau ? selectedNiveau.code_niveau : "";
      const regex = new RegExp(
        `^${codeNiveau}-${formData.prefixe_groupe}-(\\d+)$`
      );
      const numbers = new Set();
      existingGroupes.forEach((g) => {
        const match = g.nom_groupe.match(regex);
        if (match) {
          numbers.add(parseInt(match[1]));
        }
      });
      setExistingNumbers(numbers);
    }
  }, [formData.id_niveau, formData.prefixe_groupe, existingGroupes, niveaux]);

  useEffect(() => {
    const selectedNiveau = niveaux.find(
      (n) => n.id_niveau === formData.id_niveau
    );
    const codeNiveau = selectedNiveau ? selectedNiveau.code_niveau : "";
    const preview = [];
    let count = 0;
    let currentNumber = parseInt(formData.numero_debut);

    while (count < formData.nombre_groupes) {
      while (existingNumbers.has(currentNumber)) {
        currentNumber++;
      }
      preview.push(`${codeNiveau}-${formData.prefixe_groupe}-${currentNumber}`);
      currentNumber++;
      count++;
    }
    setPreviewGroupes(preview);
  }, [
    formData.id_niveau,
    formData.prefixe_groupe,
    formData.numero_debut,
    formData.nombre_groupes,
    existingNumbers,
    niveaux,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["nombre_groupes", "numero_debut"].includes(name)
        ? Math.max(1, parseInt(value) || 1)
        : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedNiveau = niveaux.find(
      (n) => n.id_niveau === formData.id_niveau
    );
    const codeNiveau = selectedNiveau ? selectedNiveau.code_niveau : "";

    if (isEditing) {
      const updatedGroupe = {
        ...groupe,
        nom_groupe: `${codeNiveau}-${formData.prefixe_groupe}-${formData.numero_debut}`,
        annee_academique: formData.annee_academique,
        id_niveau: formData.id_niveau,
      };
      onSubmit(updatedGroupe);
    } else {
      const groupes = [];
      let count = 0;
      let currentNumber = parseInt(formData.numero_debut);

      while (count < formData.nombre_groupes) {
        while (existingNumbers.has(currentNumber)) {
          currentNumber++;
        }
        groupes.push({
          nom_groupe: `${codeNiveau}-${formData.prefixe_groupe}-${currentNumber}`,
          annee_academique: formData.annee_academique,
          id_niveau: formData.id_niveau,
        });
        currentNumber++;
        count++;
      }

      onSubmit(groupes);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        name="prefixe_groupe"
        label="Nom du groupe"
        value={formData.prefixe_groupe}
        onChange={handleChange}
        required
        fullWidth
        helperText="Ex: INFO pour générer NIV-INFO-1, NIV-INFO-2, etc."
      />

      {!isEditing && (
        <div className="grid grid-cols-2 gap-4">
          <TextField
            name="numero_debut"
            label="Numéro de début"
            type="number"
            value={formData.numero_debut}
            onChange={handleChange}
            required
            fullWidth
            inputProps={{ min: 1 }}
          />

          <TextField
            name="nombre_groupes"
            label="Nombre de groupes à créer"
            type="number"
            value={formData.nombre_groupes}
            onChange={handleChange}
            required
            fullWidth
            inputProps={{ min: 1 }}
          />
        </div>
      )}

      <TextField
        name="annee_academique"
        label="Année académique"
        value={formData.annee_academique}
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

      {existingNumbers.size > 0 && (
        <Alert severity="info">
          <Typography variant="subtitle2">
            Groupes existants avec ce préfixe :{" "}
            {Array.from(existingNumbers)
              .sort((a, b) => a - b)
              .join(", ")}
          </Typography>
        </Alert>
      )}

      {previewGroupes.length > 0 && (
        <Alert severity="info" className="mt-4">
          <div>
            {isEditing
              ? "Aperçu du groupe modifié :"
              : "Aperçu des nouveaux groupes qui seront créés :"}
          </div>
          <div className="max-h-32 overflow-y-auto mt-2">
            {previewGroupes.map((nom, index) => (
              <div key={index}>{nom}</div>
            ))}
          </div>
        </Alert>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outlined" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="contained">
          {isEditing ? "Modifier le groupe" : "Créer les groupes"}
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
  const [selectedNiveau, setSelectedNiveau] = useState(""); // Nouveau state pour le filtre de niveau
  const [filteredGroupes, setFilteredGroupes] = useState([]);
  const [selectedGroupes, setSelectedGroupes] = useState([]);

  // Modification de la logique de filtrage pour inclure le niveau
  useEffect(() => {
    const results = groupes.filter((groupe) => {
      const matchesSearch =
        groupe.nom_groupe.toLowerCase().includes(searchTerm.toLowerCase()) ||
        groupe.annee_academique
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesNiveau =
        selectedNiveau === "" || groupe.id_niveau === selectedNiveau;

      return matchesSearch && matchesNiveau;
    });
    setFilteredGroupes(results);
  }, [searchTerm, selectedNiveau, groupes]);

  // Ajoutez cette fonction de tri
  const sortGroupes = (groupes) => {
    return [...groupes].sort((a, b) => {
      const [prefixA, numA] = a.nom_groupe.split("-").slice(-2);
      const [prefixB, numB] = b.nom_groupe.split("-").slice(-2);

      // D'abord, trier par préfixe (niveau et nom du groupe)
      if (prefixA !== prefixB) {
        return prefixA.localeCompare(prefixB);
      }

      // Ensuite, trier par numéro
      return parseInt(numA) - parseInt(numB);
    });
  };

  useEffect(() => {
    const results = groupes.filter((groupe) => {
      const matchesSearch =
        groupe.nom_groupe.toLowerCase().includes(searchTerm.toLowerCase()) ||
        groupe.annee_academique
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesNiveau =
        selectedNiveau === "" || groupe.id_niveau === selectedNiveau;

      return matchesSearch && matchesNiveau;
    });

    // Trier les résultats
    const sortedResults = sortGroupes(results);
    setFilteredGroupes(sortedResults);
  }, [searchTerm, selectedNiveau, groupes]);

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
        const sortedGroupes = sortGroupes(response.data);
        setGroupes(sortedGroupes);
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

  const handleCreate = async (groupes) => {
    try {
      const promises = groupes.map((groupe) =>
        getAxiosInstance().post("/groupes", groupe)
      );

      await Promise.all(promises);
      toast.success(`${groupes.length} groupes créés avec succès`);

      setTimeout(async () => {
        await fetchGroupes();
        setIsCreateModalOpen(false);
      }, 2000);
    } catch (err) {
      toast.success(`${groupes.length} groupes créés avec succès`);

      setTimeout(async () => {
        await fetchGroupes();
        setIsCreateModalOpen(false);
      }, 2000);
    }
  };

  const handleUpdate = async (updatedGroupe) => {
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
      setTimeout(async () => {
        await fetchGroupes();
        setIsUpdateModalOpen(false);
      }, 2000);
    } catch (err) {
      toast.success("Groupe mis à jour avec succès");
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

  const handleSelectGroupe = (id_groupe) => {
    setSelectedGroupes((prev) => {
      if (prev.includes(id_groupe)) {
        return prev.filter((id) => id !== id_groupe);
      } else {
        return [...prev, id_groupe];
      }
    });
  };

  const handleSelectAllGroupes = (event) => {
    if (event.target.checked) {
      setSelectedGroupes(filteredGroupes.map((groupe) => groupe.id_groupe));
    } else {
      setSelectedGroupes([]);
    }
  };

  const handleDeleteMultiple = async () => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer ${selectedGroupes.length} groupes ?`
      )
    ) {
      try {
        await Promise.all(
          selectedGroupes.map((id_groupe) =>
            getAxiosInstance().delete(`/groupes/${id_groupe}`)
          )
        );
        toast.success(
          `${selectedGroupes.length} groupes supprimés avec succès`
        );
        setSelectedGroupes([]);
      } catch (err) {
        console.error("Erreur lors de la suppression multiple:", err);
        toast.error("Erreur lors de la suppression multiple");
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
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Recherche..."
              className="pl-10 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filtrer par niveau</InputLabel>
            <Select
              value={selectedNiveau}
              onChange={(e) => setSelectedNiveau(e.target.value)}
              label="Filtrer par niveau"
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
        <h1 className="text-3xl font-bold text-gray-800">Liste des Groupes</h1>
        <div>
          <Button
            variant="contained"
            startIcon={<PlusIcon />}
            onClick={() => setIsCreateModalOpen(true)}
            className="mr-2"
          >
            Ajouter Groupe
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<TrashIcon />}
            onClick={handleDeleteMultiple}
            disabled={selectedGroupes.length === 0}
            className=" pl-10  mr-2"
          >
            Supprimer ({selectedGroupes.length})
          </Button>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedGroupes.length > 0 &&
                    selectedGroupes.length < filteredGroupes.length
                  }
                  checked={selectedGroupes.length === filteredGroupes.length}
                  onChange={handleSelectAllGroupes}
                />
              </TableCell>
              <TableCell>Nom Groupe</TableCell>
              <TableCell>Année academique</TableCell>
              <TableCell>Niveau</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGroupes.map((groupe) => (
              <TableRow key={groupe.id_groupe}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedGroupes.includes(groupe.id_groupe)}
                    onChange={() => handleSelectGroupe(groupe.id_groupe)}
                  />
                </TableCell>
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

      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <DialogTitle>Créer un Groupe</DialogTitle>
        <DialogContent>
          <GroupeForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            existingGroupes={groupes}
            niveaux={niveaux}
            isEditing={false}
          />
        </DialogContent>
      </Dialog>

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
              existingGroupes={groupes}
              niveaux={niveaux}
              isEditing={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
