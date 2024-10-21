import React, { useState, useEffect, useMemo } from "react";
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useExpanded,
  useSortBy,
} from "react-table";
import { getAxiosInstance } from "../../getAxiosInstance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Button,
  Checkbox,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { PictureAsPdf as PdfIcon } from "@mui/icons-material";

const GroupDisplay = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    niveau: "",
    anneeUniversitaire: "",
    sansEncadreur: false,
    sansMembre: false,
    seulementGroupesNormaux: false,
    minEtudiants: "",
    maxEtudiants: "",
  });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await getAxiosInstance().get("display");
        setGroups(response.data);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error(err);
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Fonction pour extraire le numéro du groupe
  const extractGroupNumber = (groupName) => {
    const match = groupName.match(/\d+$/);
    return match ? parseInt(match[0]) : 0;
  };

  // Tri des groupes par niveau, puis par numéro incrémenté
  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => {
      if (a.niveau !== b.niveau) {
        return a.niveau.localeCompare(b.niveau);
      }
      return (
        extractGroupNumber(a.nom_groupe) - extractGroupNumber(b.nom_groupe)
      );
    });
  }, [groups]);

  // Récupérer les valeurs uniques pour les filtres
  const uniqueNiveaux = useMemo(
    () =>
      [...new Set(groups.map((group) => group.id_niveau))]
        .filter(Boolean)
        .sort(),
    [groups]
  );

  const uniqueAnnees = useMemo(
    () =>
      [...new Set(groups.map((group) => group.annee_academique))]
        .filter(Boolean)
        .sort(),
    [groups]
  );

  const columns = useMemo(
    () => [
      {
        Header: "Nom du groupe",
        accessor: "nom_groupe",
      },
      {
        Header: "Année académique",
        accessor: "annee_academique",
      },
      {
        Header: "Niveau",
        accessor: "niveau",
      },
      {
        Header: "Encadreur",
        accessor: (row) =>
          row.enseignant
            ? `${row.enseignant.nom} ${row.enseignant.prenom}`
            : "Aucun",
      },
      {
        Header: "Nombre d'étudiants",
        accessor: (row) => row.etudiants?.length || 0,
      },
      {
        Header: "Membres",
        accessor: "etudiants",
        Cell: ({ value }) => (
          <ul>
            {value?.map((etudiant) => (
              <li key={etudiant.id_etudiant}>
                {etudiant.nom} {etudiant.prenom}
              </li>
            ))}
          </ul>
        ),
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    return sortedGroups.filter((group) => {
      const nbEtudiants = group.etudiants?.length || 0;

      // Vérification des groupes normaux
      if (filters.seulementGroupesNormaux) {
        if (!group.enseignant || !group.etudiants?.length) {
          return false;
        }
      }

      // Appliquer tous les filtres
      return (
        (filters.niveau ? group.niveau === filters.niveau : true) &&
        (filters.anneeUniversitaire
          ? group.annee_academique === filters.anneeUniversitaire
          : true) &&
        (filters.sansEncadreur ? !group.enseignant : true) &&
        (filters.sansMembre ? group.etudiants?.length === 0 : true) &&
        (filters.minEtudiants
          ? nbEtudiants >= parseInt(filters.minEtudiants)
          : true) &&
        (filters.maxEtudiants
          ? nbEtudiants <= parseInt(filters.maxEtudiants)
          : true)
      );
    });
  }, [sortedGroups, filters]);

  // Configuration de la table avec useSortBy
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: {
        pageIndex: 0,
        pageSize: 10,
        sortBy: [{ id: "nom_groupe", desc: false }],
      },
    },
    useGlobalFilter,
    useSortBy,
    useExpanded,
    usePagination
  );

  // Fonction d'export PDF (reste inchangée)...
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text("Groupes et leurs membres", 14, 15);

    // Ajouter les informations sur les filtres appliqués
    doc.setFontSize(10);
    let yPos = 25;
    if (filters.niveau) {
      doc.text(`Niveau: ${filters.niveau}`, 14, yPos);
      yPos += 5;
    }
    if (filters.anneeUniversitaire) {
      doc.text(`Année: ${filters.anneeUniversitaire}`, 14, yPos);
      yPos += 5;
    }
    if (filters.minEtudiants || filters.maxEtudiants) {
      doc.text(
        `Étudiants: ${filters.minEtudiants || "0"} - ${
          filters.maxEtudiants || "∞"
        }`,
        14,
        yPos
      );
      yPos += 5;
    }
    if (filters.seulementGroupesNormaux) {
      doc.text("Groupes normaux uniquement", 14, yPos);
      yPos += 5;
    }

    // Prepare the data for autoTable
    const tableData = filteredData.map((group) => [
      group.nom_groupe,
      group.annee_academique,
      group.niveau,
      group.enseignant
        ? `${group.enseignant.nom} ${group.enseignant.prenom}`
        : "Aucun",
      group.etudiants?.length || 0,
      group.etudiants
        ?.map((etudiant) => `${etudiant.nom} ${etudiant.prenom}`)
        .join("\n"),
    ]);

    // Define table headers
    const headers = [
      [
        "Nom du groupe",
        "Année académique",
        "Niveau",
        "Encadreur",
        "Nombre d'étudiants",
        "Membres",
      ],
    ];

    // Add the table to the PDF
    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: yPos + 5,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        5: { cellWidth: 50 },
      },
      headStyles: {
        fillColor: [66, 139, 202],
      },
      theme: "striped",
      didDrawCell: (data) => {
        if (!filters.seulementGroupesNormaux) {
          // N'appliquer les couleurs que si on ne montre pas uniquement les groupes normaux
          if (data.row.index >= 0 && !filteredData[data.row.index].enseignant) {
            doc.setFillColor(255, 255, 200);
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height,
              "F"
            );
          }
          if (
            data.row.index >= 0 &&
            filteredData[data.row.index].etudiants?.length === 0
          ) {
            doc.setFillColor(255, 200, 200);
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height,
              "F"
            );
          }
        }
      },
    });

    // Save the PDF
    doc.save("groupes-et-membres.pdf");
  };

  if (loading) return <div className="text-center">Chargement...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Groupes et leurs membres</h1>
      <Button variant="outlined" startIcon={<PdfIcon />} onClick={exportToPDF}>
        Exporter PDF
      </Button>

      <div className="my-6 p-4 bg-gray-100 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <InputLabel id="niveau-label">Niveau</InputLabel>
            <Select
              labelId="niveau-label"
              value={filters.niveau}
              onChange={(e) =>
                setFilters({ ...filters, niveau: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="">Tous les niveaux</MenuItem>
              {uniqueNiveaux.map((niveau) => (
                <MenuItem key={niveau} value={niveau}>
                  {niveau}
                </MenuItem>
              ))}
            </Select>
          </div>

          <div>
            <InputLabel id="annee-label">Année Universitaire</InputLabel>
            <Select
              labelId="annee-label"
              value={filters.anneeUniversitaire}
              onChange={(e) =>
                setFilters({ ...filters, anneeUniversitaire: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="">Toutes les années</MenuItem>
              {uniqueAnnees.map((annee) => (
                <MenuItem key={annee} value={annee}>
                  {annee}
                </MenuItem>
              ))}
            </Select>
          </div>

          <FormControlLabel
            control={
              <Checkbox
                checked={filters.sansEncadreur}
                onChange={(e) =>
                  setFilters({ ...filters, sansEncadreur: e.target.checked })
                }
              />
            }
            label="Sans encadreur"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={filters.sansMembre}
                onChange={(e) =>
                  setFilters({ ...filters, sansMembre: e.target.checked })
                }
              />
            }
            label="Sans membre"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={filters.seulementGroupesNormaux}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    seulementGroupesNormaux: e.target.checked,
                  })
                }
              />
            }
            label="Groupes normaux uniquement"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table
              {...getTableProps()}
              className="min-w-full divide-y divide-gray-200"
            >
              <thead className="bg-gray-50">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.render("Header")}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody
                {...getTableBodyProps()}
                className="bg-white divide-y divide-gray-200"
              >
                {page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr
                      {...row.getRowProps()}
                      className={`
                ${!row.original.enseignant ? "bg-yellow-100" : ""}
                ${row.original.etudiants?.length === 0 ? "bg-red-100" : ""}
              `}
                    >
                      {row.cells.map((cell) => {
                        return (
                          <td
                            {...cell.getCellProps()}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {cell.render("Cell")}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            className="px-3 py-1 border rounded"
          >
            {"<<"}
          </button>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="px-3 py-1 border rounded"
          >
            {"<"}
          </button>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="px-3 py-1 border rounded"
          >
            {">"}
          </button>
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
            className="px-3 py-1 border rounded"
          >
            {">>"}
          </button>
        </div>
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
          className="px-3 py-1 border rounded"
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default GroupDisplay;
