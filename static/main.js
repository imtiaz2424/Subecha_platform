// ========== AUTH FUNCTIONS ==========
function checkAuth() {
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (token) {
        document.getElementById('guestNav').style.display = 'none';
        document.getElementById('userNav').style.display = 'flex';
        document.getElementById('navUserName').textContent = user.full_name || 'Profile';
        if (user.role === 'client') {
            document.getElementById('postProjectNav').style.display = 'block';
            document.getElementById('becomeSellerNav').style.display = 'block';
        }
    }
}

function logout() {
    const refresh = localStorage.getItem('refresh_token');
    fetch('/api/auth/logout/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        },
        body: JSON.stringify({refresh: refresh})
    }).finally(() => {
        localStorage.clear();
        window.location.href = '/login/';
    });
}

function showAlert(msg, type='success') {
    const box = document.getElementById('alertBox');
    const alert = document.getElementById('alertMsg');
    box.style.display = 'block';
    alert.className = `alert alert-${type}`;
    alert.textContent = msg;
    setTimeout(() => box.style.display = 'none', 4000);
}

// ========== LOAD CATEGORIES IN NAVBAR ==========
function loadNavCategories() {
    fetch('/api/projects/categories/')
        .then(res => res.json())
        .then(data => {
            const dropdown = document.getElementById('categoryDropdown');
            const icons = ['fa-code', 'fa-mobile-alt', 'fa-paint-brush', 'fa-pen', 'fa-database', 'fa-chart-bar'];
            data.forEach((cat, i) => {
                dropdown.innerHTML += `
                    <li>
                        <a class="dropdown-item" href="/projects/?category=${cat.id}">
                            <i class="fas ${icons[i] || 'fa-folder'} me-2"></i>${cat.name}
                        </a>
                    </li>`;
            });
        });
}

// ========== RUN ON PAGE LOAD ==========
checkAuth();
loadNavCategories();