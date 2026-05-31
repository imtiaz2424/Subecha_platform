// ========== LOAD CATEGORIES ==========
function loadCategories() {
    fetch('/api/projects/categories/')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('categoriesContainer');
            const icons = ['fa-code', 'fa-mobile-alt', 'fa-paint-brush', 'fa-pen', 'fa-database', 'fa-chart-bar', 'fa-video', 'fa-bullhorn'];

            if (data.length === 0) {
                container.innerHTML = '<p class="text-center text-muted">No categories yet.</p>';
                return;
            }

            container.innerHTML = data.map((cat, i) => `
                <div class="col-md-3 col-6 mb-4">
                    <a href="/projects/?category=${cat.id}" class="text-decoration-none">
                        <div class="category-card">
                            <div class="category-icon">
                                <i class="fas ${icons[i] || 'fa-folder'}"></i>
                            </div>
                            <h6 class="fw-bold mt-3 mb-0">${cat.name}</h6>
                            <small class="text-muted">Browse Projects →</small>
                        </div>
                    </a>
                </div>
            `).join('');

            // Also fill search category dropdown
            const select = document.getElementById('searchCategory');
            data.forEach(cat => {
                select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            });
        });
}

// ========== LOAD LATEST PROJECTS ==========
function loadLatestProjects() {
    fetch('/api/projects/?ordering=-created_at')
        .then(res => res.json())
        .then(data => {
            const projects = data.results || data;
            const container = document.getElementById('latestProjects');

            if (projects.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                        <p class="text-muted">No projects yet.</p>
                    </div>`;
                return;
            }

            container.innerHTML = projects.slice(0, 4).map(p => `
                <div class="col-md-6 mb-4">
                    <div class="latest-project-card">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <span class="badge-category">${p.category_name || 'General'}</span>
                                <span class="ms-2 text-muted small">
                                    <i class="fas fa-clock me-1"></i>${new Date(p.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <span class="badge bg-success">${p.status}</span>
                        </div>
                        <h5 class="fw-bold mt-2 project-title-link">
                            <a href="/projects/${p.id}/" class="text-decoration-none text-dark">${p.title}</a>
                        </h5>
                        <p class="text-muted small mb-3">${p.description.substring(0, 120)}...</p>
                        <div class="d-flex flex-wrap gap-2 mb-3">
                            <span class="skill-tag"><i class="fas fa-tag me-1"></i>${p.category_name || 'General'}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center border-top pt-3">
                            <div>
                                <span class="text-muted small me-3">
                                    <i class="fas fa-paper-plane me-1"></i>${p.proposal_count} Proposals
                                </span>
                                <span class="fw-bold text-primary">
                                    $${p.budget} <small class="text-muted fw-normal">fixed-price</small>
                                </span>
                            </div>
                            <a href="/projects/${p.id}/" class="btn-apply-now">Apply Now</a>
                        </div>
                    </div>
                </div>
            `).join('');
        })
        .catch(() => {
            document.getElementById('latestProjects').innerHTML =
                '<p class="text-center text-danger">Failed to load projects.</p>';
        });
}

// ========== SEARCH ==========
function searchProjects() {
    const query = document.getElementById('searchInput').value;
    const category = document.getElementById('searchCategory').value;
    let url = '/projects/?';
    if (query) url += `search=${query}&`;
    if (category) url += `category=${category}`;
    window.location.href = url;
}

// Allow Enter key to search
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchProjects();
});

// ========== RUN ==========
loadCategories();
loadLatestProjects();