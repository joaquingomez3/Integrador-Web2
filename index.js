const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const traductor = require('node-google-translate-skidz');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

  async function traductorTexto(texto, sourceLang, targetLang) {
    const mensaje = "Desconocido";
    if (!texto || texto.trim() === '') {
        return mensaje; // Si el texto es nulo, indefinido o vacío, devuelve el texto tal cual.
    }

     return new Promise((resolve, reject) => {
         traductor({
             text: texto,
             source: sourceLang,
             target: targetLang
         }, function(result) {
             if (result && result.translation) {
                 resolve(result.translation);
             } else {
                 reject('Error al traducir el texto');
            }
         });
     });
 }

 

app.get('/api/artworks', async (req, res) => {
    const { query, departmentId, geoLocation } = req.query;
    let traduccionQuery = await traductorTexto(query, 'es', 'en');
    let url = 'https://collectionapi.metmuseum.org/public/collection/v1/search';

    const params = [];

    // Si hay palabra clave, la añadimos
    if (query) {
        params.push(`q=${query}`);
    } else {
        params.push('q=*'); // Si no hay palabra clave, devolvemos todo
    }

    // Si hay departamento, lo añadimos
    if (departmentId) {
        params.push(`departmentId=${departmentId}`);
    }

    // Si hay geoLocation, lo añadimos
    if (geoLocation) {
        params.push(`geoLocation=${geoLocation}`);
    }

    // Concatenamos los parámetros en la URL
    url += `?${params.join('&')}`; 
    console.log(url);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error al obtener los datos del museo: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.total === 0) {
            return res.json([]);
        }

        // Obtener  80 obras
       
        const objectIDs = data.objectIDs.slice(0, 80);  
        const artworks = await Promise.all(objectIDs.map(async (id) => {
            const artworkResponse = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
            const artworkData = await artworkResponse.json();
             const traduccionTitulo = await traductorTexto(artworkData.title, 'en', 'es');
             const traduccionCultura = await traductorTexto(artworkData.culture, 'en', 'es'); ;
             const traduccionDinastia = await traductorTexto(artworkData.dynasty, 'en', 'es'); ;

            return {
                ...artworkData,
                 titulo: traduccionTitulo || artworkData.title,
                 cultura: traduccionCultura || artworkData.culture,
                 dinastia: traduccionDinastia   || artworkData.dynasty,
            };
            
        }));
        
        
        res.json(artworks);
    } catch (error) {
        console.error('Error al buscar obras:', error);
        res.status(500).json({ error: 'Error al buscar obras.' });
    }
});
app.get('/api/departments', async (req, res) => {
    const url = 'https://collectionapi.metmuseum.org/public/collection/v1/departments';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        res.json(data.departments);
    } catch (error) {
        console.error('Error al obtener los departamentos:', error);
        res.status(500).json({ error: 'Error al obtener los departamentos.' });
    }
});
app.get('/api/artworks/:id', async (req, res) => {
    const  id  = req.params.id;
   
    const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('Error al obtener la obra:', error);
        res.status(500).json({ error: 'Error al obtener los departamentos.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor en http://localhost:${port}`);
});

