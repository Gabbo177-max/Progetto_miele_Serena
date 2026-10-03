// ==========================================
// 1. DATABASE PRODOTTI
// ==========================================
const catalogDB = [
    { name: "Miele di Acacia", price: 8.00, desc: "Delicato, dolce e dal colore chiaro. Perfetto per dolcificare tisane e yogurt senza alterarne il sapore." },
    { name: "Miele Millefiori", price: 7.00, desc: "Un concentrato di fiori primaverili. Ricco di sfumature, ideale per la colazione e spalmato sul pane." },
    { name: "Miele di Castagno", price: 9.00, desc: "Colore ambrato scuro e sapore deciso, leggermente amarognolo. Fantastico in abbinamento ai formaggi stagionati." },
    { name: "Miele di Tiglio", price: 8.50, desc: "Profumo mentolato e sapore fresco. Noto per le sue proprietà calmanti, ottimo prima di andare a dormire." },
    { name: "Miele di Eucalipto", price: 8.00, desc: "Aroma balsamico e consistenza compatta. L'alleato perfetto contro i malanni di stagione e i mal di gola." },
    { name: "Polline di Fiori", price: 12.00, desc: "Un superfood naturale ricco di proteine e vitamine. Da sciogliere in succhi di frutta o consumare al cucchiaio." }
];

// Recupera carrello e preferenze di acquisto dalla memoria
let cart = JSON.parse(localStorage.getItem('miele_cart')) || [];
let preferences = JSON.parse(localStorage.getItem('miele_prefs')) || {};

// ==========================================
// 2. GESTIONE CARRELLO E NUMERINO
// ==========================================
function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        countElement.textContent = totalItems;
    }
}

function setupAddToCart() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        if(button.dataset.bound) return;
        button.dataset.bound = true;

        button.addEventListener('click', () => {
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));
            
            // Aggiunge al carrello
            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name, price, quantity: 1 });
            }
            localStorage.setItem('miele_cart', JSON.stringify(cart));
            
            // Registra la preferenza locale in base ai click di aggiunta
            preferences[name] = (preferences[name] || 0) + 1;
            localStorage.setItem('miele_prefs', JSON.stringify(preferences));

            updateCartCount();
            
            // Feedback visivo sul bottone
            button.textContent = "Aggiunto! ✓";
            button.style.backgroundColor = "var(--color-secondary)";
            setTimeout(() => {
                button.textContent = "Aggiungi";
                button.style.backgroundColor = "var(--color-primary)";
            }, 1500);
        });
    });
}

// ==========================================
// 3. GENERAZIONE DINAMICA HOMEPAGE
// ==========================================
function renderFeatured() {
    const container = document.getElementById('featured-products-container');
    const title = document.getElementById('featured-title');
    
    if (!container) return; 

    const sortedPrefs = Object.keys(preferences).sort((a, b) => preferences[b] - preferences[a]);

    // Se l'utente è nuovo, mostra il banner che invita ad esplorare il catalogo
    if (sortedPrefs.length === 0) {
        title.textContent = "Esplora la nostra dolcezza";
        container.style.display = "block"; 
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; background: white; border-radius: 8px; box-shadow: var(--box-shadow);">
                <h3 style="font-family: var(--font-heading); font-size: 1.8rem; margin-bottom: 15px; color: var(--color-primary-dark);">Non hai ancora un miele preferito?</h3>
                <p style="margin-bottom: 25px; color: #666; font-size: 1.1rem;">Visita il nostro catalogo per scoprire tutte le varietà prodotte dalle nostre api. Una volta aggiunti al carrello, i tuoi gusti preferiti appariranno qui!</p>
                <a href="catalogo.html" class="btn btn-primary">Vai al Catalogo Completo</a>
            </div>
        `;
    } else {
        title.textContent = "In Evidenza";
        container.style.display = "grid"; 
        let html = '';
        
        const top3 = sortedPrefs.slice(0, 3);
        
        top3.forEach(name => {
            const prod = catalogDB.find(p => p.name === name);
            if (prod) {
                html += `
                    <article class="product-card">
                        <img src="" alt="${prod.name}" class="product-img" style="background-color: #e9e9e9;">
                        <div class="product-info">
                            <h3>${prod.name}</h3>
                            <p>${prod.desc}</p>
                            <div class="product-footer">
                                <span class="price">€ ${prod.price.toFixed(2).replace('.', ',')}</span>
                                <button class="btn btn-primary add-to-cart" data-name="${prod.name}" data-price="${prod.price}">Aggiungi</button>
                            </div>
                        </div>
                    </article>
                `;
            }
        });
        
        container.innerHTML = html;
        setupAddToCart(); 
    }
}

// ==========================================
// 4. PAGINA CARRELLO E WHATSAPP
// ==========================================
function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const whatsappBtn = document.getElementById('checkout-whatsapp');
    
    if (!cartContainer) return; 
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Il tuo carrello è vuoto. Vai al <a href="catalogo.html" style="text-decoration:underline; color:var(--color-primary-dark);">catalogo</a> per riempirlo!</p>';
        whatsappBtn.style.display = 'none';
        totalElement.innerHTML = '';
        return;
    }

    let html = '';
    let total = 0;
    let message = "Ciao! Vorrei ordinare i seguenti mieli:%0A%0A"; 

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;">
                <div>
                    <strong>${item.quantity}x</strong> ${item.name} <br>
                    <small style="color: #666;">€${item.price.toFixed(2).replace('.', ',')} l'uno</small>
                </div>
                <div style="display: flex; gap: 15px; align-items: center;">
                    <strong>€ ${itemTotal.toFixed(2).replace('.', ',')}</strong>
                    <button onclick="removeFromCart(${index})" style="color: red; border: none; background: none; cursor: pointer; text-decoration: underline;">Rimuovi</button>
                </div>
            </div>
        `;
        message += `- ${item.quantity}x ${item.name} (€${itemTotal.toFixed(2)})%0A`;
    });

    cartContainer.innerHTML = html;
    totalElement.innerHTML = `<h3 style="margin-top:20px; text-align:right;">Totale: € ${total.toFixed(2).replace('.', ',')}</h3>`;
    message += `%0ATotale: €${total.toFixed(2)}%0A%0AGrazie!`;
    
    whatsappBtn.href = `https://wa.me/393517226322?text=${message}`;
    whatsappBtn.target = "_blank"; 
    whatsappBtn.style.display = 'inline-block';

    // Svuota il carrello all'invio dell'ordine su WhatsApp
    whatsappBtn.onclick = function() {
        setTimeout(() => {
            cart = []; 
            localStorage.removeItem('miele_cart'); 
            updateCartCount(); 
            renderCart(); 
        }, 500);
    };
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    localStorage.setItem('miele_cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// ==========================================
// 5. MENU HAMBURGER
// ==========================================
const mobileBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');

if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        if (navLinks.classList.contains('active')) {
            mobileBtn.textContent = '✕';
        } else {
            mobileBtn.textContent = '☰';
        }
    });
}

// Inizializzazione all'avvio
updateCartCount();
renderFeatured();
setupAddToCart(); 
renderCart();