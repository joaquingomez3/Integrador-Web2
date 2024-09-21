window.onload = async function () {
    const divarte = document.getElementById('resultsId');
    const id=window.location.search.split('=')[1];
    try {
        const response = await fetch(`/api/artworks/${id}`);
         
        if (!response.ok) {
            throw new Error(`Error al obtener los departamentos: ${response.status}`);
        }
        const arte = await response.json();
       arte && arte.additionalImages.map(artwork => {
            const artworkElement = document.createElement('div');
            artworkElement.classList.add('artwork');
            artworkElement.innerHTML = `
                <img src="${artwork}" alt="${artwork.title || 'Sin imagen disponible'}">
            `;
            divarte.appendChild(artworkElement);
        });
        
    } catch (error) {
        console.error('Error al obtener los departamentos:', error);
    }
};