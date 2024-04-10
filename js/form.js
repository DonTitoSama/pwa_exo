document.addEventListener("DOMContentLoaded", function() {

    document.getElementById('searchForm').addEventListener('submit', function(event) {
        event.preventDefault(); // empêche la soumission du formulaire
        var searchTerm = document.getElementById('searchInput').value;
        if (!searchTerm || searchTerm.trim().length === 0) {
            alert("Veuillez saisir une valeur.");
            return;
        }         

        fetchAndDisplayResults(searchTerm);
        saveSearchTermOnline(searchTerm); // Enregistrer la recherche uniquement si en ligne
    });


    function fetchAndDisplayResults(searchTerm) {
        if ('caches' in window) {
            caches.match('search-' + searchTerm).then(function(response) {
                if (response) {
                    response.json().then(function(data) {
                        displaySearchResults(data);
                    });
                } else {
                    if (navigator.onLine) { // Vérifier si en ligne
                        fetchSearchResults(searchTerm);
                    } else {
                        console.error('Vous êtes hors ligne et les données ne sont pas disponibles.');
                        displayErrorMessage("Cette série n'a pas été recherchée auparavant.");
                    }
                }
            });
        } else {
            if (navigator.onLine) { // Vérifier si en ligne
                fetchSearchResults(searchTerm);
            } else {
                console.error('Vous êtes hors ligne et les données ne sont pas disponibles.');
                displayErrorMessage("Cette série n'a pas été recherchée auparavant.");
            }
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
            displayErrorMessage("Cette série n'a pas été recherchée auparavant.");
        });
    }

    function displaySearchResults(data) {
        var resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '';
        data.forEach(function(result) {
            var showName = result.show.name;
            var showSummary = result.show.summary;
            var showImage = result.show.image ? result.show.image.medium : '';

            var showDiv = document.createElement('div');
            showDiv.classList.add('card');
            showDiv.innerHTML = `
                <div class="card-body" style="text-align: center;">
                    <h5 class="card-title" style="font-size: smaller;">${showName}</h5>
                    <a href="details.html?name=${encodeURIComponent(showName)}&image=${encodeURIComponent(showImage)}&summary=${encodeURIComponent(showSummary)}">
                        <img class="show-image" src="${showImage}" alt="${showName}" class="card-img-top" style="max-width: 200px; margin: auto; cursor: pointer;" title="Voir les détails">
                    </a>
                    <p class="card-text" style="font-size: smaller;">${showSummary ? showSummary : 'Pas de résumé disponible'}</p>
                </div>`;
            resultsContainer.appendChild(showDiv);
        });
    }

    function saveSearchTermOnline(searchTerm) {
        if (navigator.onLine) { // Vérifier si en ligne
            var searchHistory = localStorage.getItem('searchHistory');
            searchHistory = searchHistory ? JSON.parse(searchHistory) : [];
            searchHistory.push(searchTerm);
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        }
    }

    // Fonction pour afficher l'historique des recherches en mode hors ligne
    function displayOfflineResults() {
        if (!navigator.onLine) { 
            var offlineResultsContainer = document.getElementById('offlineResults');
            if (offlineResultsContainer) {
                offlineResultsContainer.innerHTML = '';
            }
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
    }

    // Afficher un message d'erreur
    function displayErrorMessage(message) {
        var errorContainer = document.getElementById('searchResults');
        errorContainer.innerHTML = '<div class="alert alert-danger" role="alert">' + message + '</div>';
    }

    // Appel à la fonction pour afficher l'historique des recherches dès que la page est chargée
    displayOfflineResults();
});
