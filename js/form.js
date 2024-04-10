document.addEventListener("DOMContentLoaded", function() {

    // Écoute à la validation (bouton rechercher) du formulaire
    document.getElementById('searchForm').addEventListener('submit', function(event) {

        event.preventDefault(); // empêche la soumission du formulaire

        var searchTerm = document.getElementById('searchInput').value;

        // Si le champs est vide ou contient seulement un espace, afficher une alerte
        if (!searchTerm || searchTerm.trim().length === 0) {
            alert("Veuillez saisir une valeur.");
            return;
        }         

        addToSearchHistory(searchTerm);

        fetch('https://api.tvmaze.com/search/shows?q=' + searchTerm)
            .then(response => response.json())
            .then(data => {
                displaySearchResults(data);
            })
            .catch(error => {
                console.error('Erreur dans la requête : ', error);
            });
    });


    // Affiche les informations
    function displaySearchResults(data) {
        var resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '';

        data.forEach(function(result) {
            var showName = result.show.name;
            var showSummary = result.show.summary;
            var showImage = result.show.image ? result.show.image.medium : 'Image non disponible.';

            var showDiv = document.createElement('div');
            showDiv.classList.add('card');
            showDiv.innerHTML = `
                <div class="card-body" style="text-align: center;">
                    <h5 class="card-title" style="font-size: smaller;">${showName}</h5>
                    <a href="https://api.tvmaze.com/singlesearch/shows?q=${showName}" target="_blank">
                        <img id="image" src="${showImage}" alt="${showName}" class="card-img-top" style="max-width: 200px; margin: auto; cursor: pointer;" title="Accéder au json">
                    </a>
                    <p class="card-text" style="font-size: smaller;">${showSummary ? showSummary : 'No summary available'}</p>
                </div>`;
            resultsContainer.appendChild(showDiv);
        });
    }

    // Fonction pour ajouter un terme de recherche à l'historique
    function addToSearchHistory(searchTerm) {
        var searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        // Vérifier si le terme de recherche existe déjà dans l'historique
        if (!searchHistory.includes(searchTerm)) {
            // Ajouter le terme de recherche à l'historique
            searchHistory.push(searchTerm);
            // Mettre à jour le localStorage avec le nouvel historique
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        }
    }
});