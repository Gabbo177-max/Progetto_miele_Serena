window.setupFavorites = function() {
    let favorites = JSON.parse(localStorage.getItem('miele_favorites')) || [];

    document.querySelectorAll('.product-card').forEach(card => {
        const btn = card.querySelector('.favorite-btn');
        if (!btn) return;
        const name = btn.getAttribute('data-name');

        // Imposta lo stato iniziale della stellina
        if (favorites.includes(name)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }

        // Evita di duplicare gli eventi
        if (btn.dataset.favBound) return;
        btn.dataset.favBound = true;

        // Gestione del click sulla stellina
        btn.addEventListener('click', () => {
            favorites = JSON.parse(localStorage.getItem('miele_favorites')) || [];

            if (favorites.includes(name)) {
                favorites = favorites.filter(fav => fav !== name);
                btn.classList.remove('active');
            } else {
                favorites.push(name);
                btn.classList.add('active');
            }

            // Salva in memoria
            localStorage.setItem('miele_favorites', JSON.stringify(favorites));

            // Aggiorna la Home se aperta
            if (typeof renderFeatured === 'function') {
                renderFeatured();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', setupFavorites);