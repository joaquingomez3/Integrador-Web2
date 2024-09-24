window.onload = async function () {
    const departmentSelect = document.getElementById('departmentSelect');
    const countrySelect = document.getElementById('countrySelect');
    try {
        const response = await fetch('/api/departments');
         
        if (!response.ok) {
            throw new Error(`Error al obtener los departamentos: ${response.status}`);
        }
        const departments = await response.json();

        departments.forEach(department => {
            const option = document.createElement('option');
            option.value = department.departmentId;
            option.textContent = department.displayName;
            departmentSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al obtener los departamentos:', error);
    }
    try {
        const response = await fetch('/api/countries');
        if (!response.ok) {
            throw new Error(`Error al obtener los países: ${response.status}`);
        }

        const countries = await response.json();
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.code;
            option.textContent = country.name;
            countrySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al obtener los países:', error);
    }
    
};

document.getElementById('searchForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const query = document.getElementById('query').value;
    const departmentId = document.getElementById('departmentSelect').value;
    const countryId = document.getElementById('countrySelect').value;
    const resultsDiv = document.getElementById('results');
    let inicio = 0;
    let fin = 20;
    resultsDiv.innerHTML = ''; 

    let url = `/api/artworks?query=${query}`;
    if (departmentId) {
        url += `&departmentId=${departmentId}`;
    }
    if(countryId){
        url += `&geoLocation=${countryId}`;
    }

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error al obtener las obras: ${response.status}`);
        }

        const artworks = await response.json(); //me trae un maximo de 80 objetos
        

        if (!artworks || artworks.length === 0) {
            resultsDiv.innerHTML = '<p>No se encontraron resultados.</p>';
            return;
        }
       

        mostrarTarjetas(artworks, inicio, fin);
        let paginasTotales = Math.ceil(artworks.length / 20); 
       mostrarBotones(artworks, inicio, paginasTotales);

    } catch (error) {
        console.error('Error al obtener las obras:', error);
        resultsDiv.innerHTML = '<p>Error al obtener los datos.</p>';
    }
});
 function mostrarBotones(artworks,inicio, paginasTotales) {
    const botones = document.getElementById('botones');
    botones.innerHTML = '';
    const btnAnterior = document.createElement('button');
    btnAnterior.textContent = 'Anterior';
    const btnSiguiente = document.createElement('button');
    btnSiguiente.textContent = 'Siguiente';

    btnAnterior.addEventListener('click', () => {
        if (inicio > 0) {
            
            mostrarTarjetas(artworks, inicio, inicio + 20);
            inicio--;
        }

    });
    botones.appendChild(btnAnterior);

    btnSiguiente.addEventListener('click', () => {
        if (inicio <= paginasTotales ) {
            
            mostrarTarjetas(artworks, inicio*20, (inicio*20) + 20);
            inicio++;
        }

    });
    botones.appendChild(btnSiguiente);
 }
 function mostrarTarjetas(artworks, inicio, fin) {
    console.log(inicio, fin);
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    console.log(artworks);
    const ids = artworks.slice(inicio, fin);
    console.log(ids);
    //funcion de mostrar tarjetas
      ids.forEach(artwork => {
        
          const artworkElement = document.createElement('div');
          artworkElement.classList.add('artwork');
          artworkElement.innerHTML = `
              <img src="${artwork.primaryImageSmall ? artwork.primaryImageSmall : 'https://via.placeholder.com/1024x1024?text=No+Image+Available'}" alt="Imagen NO Disponible" title="${artwork.objectDate}">
              <h3>${artwork.title || 'Sin título'}</h3>
             <p>Cultura: ${artwork.culture || 'Desconocido'}</p>
              <p>Dinastia: ${artwork.dynasty || 'Desconocido'}</p>
              ${artwork.additionalImages && artwork.additionalImages.length > 0 ? `<a id="verMas" href="detalle.html?id=${artwork.objectID}">Ver Mas</a>` : ''}
         `;
       
         
          resultsDiv.appendChild(artworkElement);
      });
 }


//  async function traductorTexto(texto, sourceLang, targetLang) {
//     return new Promise((resolve, reject) => {
//         translate({
//             text: texto,
//             source: sourceLang,
//             target: targetLang
//         }, function(result) {
//             if (result && result.translation) {
//                 resolve(result.translation);
//             } else {
//                 reject('Error al traducir el texto');
//            }
//         });
//     });
// }