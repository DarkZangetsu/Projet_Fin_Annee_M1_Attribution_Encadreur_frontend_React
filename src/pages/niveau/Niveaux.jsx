import React, { useEffect, useState } from 'react'
import { getAxiosInstance } from '../../getAxiosInstance';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'


export default function Niveaux() {
  const [niveaux, setNiveaux] = useState([]);

  useEffect (() => {
      fetchNiveaux();
  }, []);

  const fetchNiveaux = async () => {
    try {
      const response = await getAxiosInstance().get("/niveaux");
      setNiveaux(response.data);
    }catch(error){
      console.error("Erreur lors de la récupération des niveaux dans la base de données");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black-300">
          Liste des Niveaux
        </h1>
        </div>

        <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Code Niveau</strong></TableCell>
                  <TableCell><strong>Libelle</strong></TableCell>
                  <TableCell><strong>Taille Groupe</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {niveaux.map((niveau) => (
                  <TableRow key={niveau?.id_niveau}>
                      <TableCell>{niveau.code_niveau}</TableCell>
                      <TableCell>{niveau.libelle}</TableCell>
                      <TableCell>{niveau.taille_groupe}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </TableContainer>
    </div>
  )
}
