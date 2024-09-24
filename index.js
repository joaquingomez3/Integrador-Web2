const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const traductor = require('node-google-translate-skidz');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

const translator = new traductor({
    key: process.env.GOOGLE_API_KEY,
    sourceLang: 'en',
    targetLang: 'es', 
  });

  async function translateText(text) {
    if (!text || typeof text !== 'string') {
        return 'desconocido'; // o devuelve un valor por defecto
      }
      try {
        const translation = await translator.translate(text);
        return translation.text;
      } catch (error) {
        console.error(`Error translating text: ${error}`);
        return text; // Return original text if translation fails
      }
  }

app.get('/api/artworks', async (req, res) => {
    const { query, departmentId } = req.query;
    let url = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}`;

    if (departmentId) {
        url += `&departmentId=${departmentId}`;
    }

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
            const traduccionTitulo = artworkData.title && typeof artworkData.title === 'string' ? await translateText(artworkData.title) : artworkData.title;
            const traduccionCultura = artworkData.culture && typeof artworkData.culture === 'string' ? await translateText(artworkData.culture) : artworkData.culture;
            const traduccionDinastia = artworkData.dynasty && typeof artworkData.dynasty === 'string' ? await translateText(artworkData.dynasty) : artworkData.dynasty;

            return {
                ...artworkData,
                titulo: traduccionTitulo,
                cultura: traduccionCultura,
                dinastia: traduccionDinastia,
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
app.get('/api/countries', async (req, res) => {
    const url = 'https://restcountries.com/v3.1/all';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const countries = data.map(country => ({
            name: country.name.common,
            code: country.cca2
        }));
        res.json(countries);
    } catch (error) {
        console.error('Error al obtener los países:', error);
        res.status(500).json({ error: 'Error al obtener los países.' });
    }
});
app.listen(port, () => {
    console.log(`Servidor en http://localhost:${port}`);
});

