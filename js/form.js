document.addEventListener("DOMContentLoaded", function() {

    document.getElementById('searchForm').addEventListener('submit', function(event) {
        event.preventDefault(); // empêche la soumission du formulaire
        var searchTerm = document.getElementById('searchInput').value;
        if (!searchTerm || searchTerm.trim().length === 0) {
            alert("Veuillez saisir une valeur.");
            return;
        }         

        fetchAndDisplayResults(searchTerm);
        saveSearchTerm(searchTerm); // Enregistrer la recherche
    });

    function fetchAndDisplayResults(searchTerm) {
        if ('caches' in window) {
            caches.match('search-' + searchTerm).then(function(response) {
                if (response) {
                    response.json().then(function(data) {
                        displaySearchResults(data);
                    });
                } else {
                    fetchSearchResults(searchTerm);
                }
            });
        } else {
            fetchSearchResults(searchTerm);
        }
    }

    function fetchSearchResults(searchTerm) {
        fetch('https://api.tvmaze.com/search/shows?q=' + searchTerm)
        .then(response => response.json())
        .then(data => {
            displaySearchResults(data);
            if ('caches' in window) {
                caches.open('searches-cache').then(function(cache) {
                    cache.put('search-' + searchTerm, new Response(JSON.stringify(data)));
                });
            }
        })
        .catch(error => {
            console.error('Erreur dans la requête : ', error);
        });
    }

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

    function saveSearchTerm(searchTerm) {
        var searchHistory = localStorage.getItem('searchHistory');
        searchHistory = searchHistory ? JSON.parse(searchHistory) : [];
        searchHistory.push(searchTerm);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }

    // Fonction pour afficher l'historique des recherches en mode hors ligne
    function displayOfflineResults() {
        var offlineResultsContainer = document.getElementById('offlineResults');
        offlineResultsContainer.innerHTML = '';
        var searchHistory = localStorage.getItem('searchHistory');
        if (searchHistory) {
            searchHistory = JSON.parse(searchHistory);
            searchHistory.forEach(function(term) {
                var termDiv = document.createElement('div');
                termDiv.textContent = term;
                offlineResultsContainer.appendChild(termDiv);
            });
        }
    }

    // Appel à la fonction pour afficher l'historique des recherches dès que la page est chargée
    displayOfflineResults();
});