// src/js/components.js
// Loads header and required packages

// Function to load HTML components
function loadComponent(id, url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${url}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;
        })
        .catch(err => console.error('Error loading component:', err));
}

// Function to dynamically load Ionicons scripts
function loadIonicons() {
    // Check if Ionicons scripts are already loaded
    if (document.querySelector('script[data-ionicons="true"]')) {
        return; // Scripts already loaded
    }

    const scriptModule = document.createElement('script');
    scriptModule.type = 'module';
    scriptModule.src = 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js';
    scriptModule.setAttribute('data-ionicons', 'true');

    const scriptNoModule = document.createElement('script');
    scriptNoModule.nomodule = true;
    scriptNoModule.src = 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js';
    scriptNoModule.setAttribute('data-ionicons', 'true');

    document.body.appendChild(scriptModule);
    document.body.appendChild(scriptNoModule);
}

// Load Header and Footer on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Load Header and Footer
    Promise.all([
        loadComponent('header', '/pages/margins/header.html'),
        loadComponent('footer', '/pages/margins/footer.html')
    ]).then(() => {
        // After header is loaded, load Ionicons scripts
        loadIonicons();
    });
});
