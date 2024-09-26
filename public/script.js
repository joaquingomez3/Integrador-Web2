window.onload = async function () {
    const departmentSelect = document.getElementById('departmentSelect');
    
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
   
    
};
let inicio = 0;
document.getElementById('searchForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const query = document.getElementById('query').value.trim();
    const departmentId = document.getElementById('departmentSelect').value;
    const countryId = document.getElementById('countrySelect').value;
    const resultsDiv = document.getElementById('results');
    
    let fin = 20;
    resultsDiv.innerHTML = ''; 

    const button = document.querySelector('#searchForm button[type="submit"]');
    button.disabled = true;
    document.getElementById('resultsTitle').textContent = 'Cargando...';

    let url = '/api/artworks';
    if (query) {
        url += `?query=${query}`;
    }
    if (departmentId) {
        if (url.includes('?')) {
            url += `&departmentId=${departmentId}`;
        } else {
            url += `?departmentId=${departmentId}`;
        }
    }
    if(countryId){
        if (url.includes('?')) {
            url += `&geoLocation=${countryId}`;
        } else {
            url += `?geoLocation=${countryId}`;
        }
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
       

        mostrarTarjetas(artworks, inicio, 20);
        let paginasTotales = Math.ceil(artworks.length / 20); 
       mostrarBotones(artworks, inicio, paginasTotales);

    } catch (error) {
        console.error('Error al obtener las obras:', error);
        resultsDiv.innerHTML = '<p>Error, vercel cancela la consulta si demora un cierto tiempo(EL LOCALHOST ANDA PERFECTO) busque con al menos un campo</p>';
    } finally {
        button.disabled = false;
        document.getElementById('resultsTitle').textContent = 'Resultados:';
    }
});
 function mostrarBotones(artworks,inicio, paginasTotales) {
    const botones = document.getElementById('botones');
    botones.innerHTML = '';
    const btnAnterior = document.createElement('button');
    btnAnterior.textContent = 'Anterior';
    const btnSiguiente = document.createElement('button');
    btnSiguiente.textContent = 'Siguiente';

    btnAnterior.disabled = inicio === 0;
    btnSiguiente.disabled = inicio >= (paginasTotales - 1) * 20;

    // Evento para el botón anterior
    btnAnterior.addEventListener('click', () => {
        event.preventDefault();
        if (inicio > 0) {
            inicio -= 20;
            mostrarTarjetas(artworks, inicio, inicio + 20);
            mostrarBotones(artworks, inicio, paginasTotales); // Actualizar los botones
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Desplazamiento suave
            });
        }
    });

    // Evento para el botón siguiente
    btnSiguiente.addEventListener('click', () => {
        event.preventDefault();
        if (inicio < (paginasTotales - 1) * 20) {
            inicio += 20;
            mostrarTarjetas(artworks, inicio, inicio + 20);
            mostrarBotones(artworks, inicio, paginasTotales); // Actualizar los botones
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Desplazamiento suave
            });
        }
    });

    // Añadir los botones al DOM
    botones.appendChild(btnAnterior);
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
              <img src="${artwork.primaryImageSmall ? artwork.primaryImageSmall : 'https://via.placeholder.com/1024x1024?text=No+Image+Available'}" alt="Imagen NO Disponible" title="Fecha de creación: ${artwork.objectDate}">
              <h3>${artwork.titulo || 'Sin título'}</h3>
             <p>Cultura: ${artwork.cultura || 'Desconocido'}</p>
              <p>Dinastia: ${artwork.dinastia || 'Desconocido'}</p>
              ${artwork.additionalImages && artwork.additionalImages.length > 0 ? `<a id="verMas" href="detalle.html?id=${artwork.objectID}">Ver Mas</a>` : ''}
         `;
       
         
          resultsDiv.appendChild(artworkElement);
      });
 }

