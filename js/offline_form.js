document.addEventListener("DOMContentLoaded", function() {
    // Récupérer l'historique des recherches hors ligne depuis localStorage
    var searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    var offlineResultsContainer = document.getElementById('offlineResults');

    // Afficher l'historique des recherches hors ligne
    if (searchHistory.length > 0) {
        searchHistory.forEach(function(searchTerm, index) {
            // Incrémenter l'index pour obtenir le numéro de recherche
            var searchNumber = index + 1;
            offlineResultsContainer.innerHTML += '<p>Recherche ' + searchNumber + ' : ' + searchTerm + '</p>';
        });
    } else {
        offlineResultsContainer.innerHTML = '<p>Aucune recherche hors ligne disponible.</p>';
    }

    // Écouter la soumission du formulaire de recherche
    document.getElementById('searchForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Empêcher la soumission du formulaire

        var searchTerm = document.getElementById('searchInput').value.trim();

        // Vérifier si le terme de recherche existe dans l'historique
        if (searchHistory.includes(searchTerm)) {
            // Effectuer la recherche
            fetch('https://api.tvmaze.com/singlesearch/shows?q=' + searchTerm)
                .then(response => response.json())
                .then(data => {
                    displaySearchResults(data);
                })
                .catch(error => {
                    console.error('Erreur dans la requête : ', error);
                });
        } else {
            // Afficher une erreur si le terme de recherche n'existe pas dans l'historique
            displayErrorMessage("Cette série n'a pas été recherchée auparavant.");
        }
    });

    // Afficher les résultats de la recherche
    function displaySearchResults(data) {
        var resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '';
        var showName = data.name;
        var showSummary = data.summary;
        var showImage = data.image ? data.image.medium : 'Image non disponible.';

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
    }

    // Afficher un message d'erreur
    function displayErrorMessage(message) {
        var errorContainer = document.getElementById('searchResults');
        errorContainer.innerHTML = '<div class="alert alert-danger" role="alert">' + message + '</div>';
    }

    document.getElementById('games').addEventListener('click', function() {
        window.location.href= "";
    });

});
