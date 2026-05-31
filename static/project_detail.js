const projectId = window.location.pathname.split('/').filter(Boolean).pop();
const token = localStorage.getItem('access_token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// ========== LOAD PROJECT ==========
fetch(`/api/projects/${projectId}/`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('loadingDiv').style.display = 'none';
        document.getElementById('projectContent').style.display = 'block';

        // Breadcrumb
        document.getElementById('breadcrumbTitle').textContent = data.title;

        // Title & Info
        document.getElementById('projectTitle').textContent = data.title;
        document.getElementById('projectCategory').textContent = data.category_name || 'General';
        document.getElementById('projectStatus').textContent = data.status;
        document.getElementById('projectDescription').textContent = data.description;

        // Stats
        document.getElementById('projectBudget').textContent = '$' + data.budget;
        document.getElementById('projectDeadline').textContent = data.deadline;
        document.getElementById('projectProposals').textContent = data.proposal_count;

        // Tags
        document.getElementById('projectTags').innerHTML = `
            <span class="project-tag"><i class="fas fa-tag me-1"></i>${data.category_name || 'General'}</span>
            <span class="project-tag"><i class="fas fa-dollar-sign me-1"></i>$${data.budget}</span>
            <span class="project-tag"><i class="fas fa-calendar me-1"></i>${data.deadline}</span>
        `;

        // Attachment
        if (data.attachment) {
            document.getElementById('attachmentDiv').style.display = 'block';
            document.getElementById('attachmentLink').href = data.attachment;
        }

        // Client Info
        document.getElementById('clientName').textContent = data.client_info?.full_name || 'Client';
        document.getElementById('clientEmail').textContent = data.client_info?.email || '';
        document.getElementById('clientInitial').textContent = (data.client_info?.full_name || 'C')[0].toUpperCase();

        // Reviews
        loadReviews(data.reviews);

        // Proposal Section
        setupProposalSection();
    })
    .catch(() => {
        document.getElementById('loadingDiv').innerHTML =
            '<p class="text-danger text-center">Failed to load project.</p>';
    });

// ========== LOAD REVIEWS ==========
function loadReviews(reviews) {
    const container = document.getElementById('reviewsContainer');
    const ratingOverview = document.getElementById('ratingOverview');

    if (!reviews || reviews.length === 0) {
        ratingOverview.style.display = 'none';
        container.innerHTML = '<p class="text-muted text-center py-3">No reviews yet.</p>';
        return;
    }

    // Calculate average
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    document.getElementById('avgRating').textContent = avg.toFixed(1);
    document.getElementById('totalReviews').textContent = reviews.length + ' reviews';

    // Star display
    document.getElementById('avgStars').innerHTML = getStarHTML(avg);

    // Rating bars
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach(r => counts[r.rating - 1]++);
    const barsHTML = [5,4,3,2,1].map(star => `
        <div class="rating-bar-row">
            <span>${star}</span>
            <div class="rating-bar-bg">
                <div class="rating-bar-fill" style="width:${reviews.length ? (counts[star-1]/reviews.length*100) : 0}%"></div>
            </div>
            <span class="pct">${reviews.length ? Math.round(counts[star-1]/reviews.length*100) : 0}%</span>
        </div>
    `).join('');
    document.getElementById('ratingBars').innerHTML = barsHTML;

    // Individual reviews
    container.innerHTML = reviews.map(r => `
        <div class="review-item">
            <div class="d-flex gap-3">
                <div class="reviewer-avatar">${r.client_name[0].toUpperCase()}</div>
                <div class="flex-1 w-100">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <div class="reviewer-name">${r.client_name}</div>
                            <div class="review-date">${new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                        <div class="review-stars">${getStarHTML(r.rating)}</div>
                    </div>
                    <p class="review-text">${r.comment}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function getStarHTML(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) html += '★';
        else if (i - rating < 1) html += '½';
        else html += '☆';
    }
    return html;
}

// ========== PROPOSAL SECTION ==========
function setupProposalSection() {
    if (!token) {
        document.getElementById('loginPrompt').style.display = 'block';
        return;
    }

    if (user.role === 'client') {
        document.getElementById('clientMessage').style.display = 'block';
        document.getElementById('reviewFormDiv').style.display = 'block';
        return;
    }

    if (user.role === 'freelancer') {
        // Check if already applied
        fetch('/api/auth/applied-jobs/', {
            headers: {'Authorization': 'Bearer ' + token}
        })
        .then(res => res.json())
        .then(data => {
            const applied = data.some(p => p.project == projectId);
            if (applied) {
                document.getElementById('alreadyApplied').style.display = 'block';
            } else {
                document.getElementById('proposalForm').style.display = 'block';
            }
        });
    }
}

// ========== SUBMIT PROPOSAL ==========
async function submitProposal() {
    const btn = document.getElementById('proposalBtn');
    const alertBox = document.getElementById('proposalAlert');
    const coverLetter = document.getElementById('coverLetter').value;

    if (!coverLetter.trim() || coverLetter.length < 30) {
        alertBox.style.display = 'block';
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'Cover letter must be at least 30 characters.';
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';

    try {
        const res = await fetch('/api/proposals/submit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                project: projectId,
                cover_letter: coverLetter
            })
        });
        const result = await res.json();

        if (res.ok) {
            document.getElementById('proposalForm').style.display = 'none';
            document.getElementById('alreadyApplied').style.display = 'block';
        } else {
            alertBox.style.display = 'block';
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = result.error || 'Failed to submit.';
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Apply for this Job';
        }
    } catch (err) {
        alertBox.style.display = 'block';
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'Something went wrong.';
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Apply for this Job';
    }
}

// ========== SUBMIT REVIEW ==========
async function submitReview() {
    const alertBox = document.getElementById('reviewAlert');
    const freelancerEmail = document.getElementById('freelancerEmail').value;
    const comment = document.getElementById('reviewComment').value;

    // Get selected star rating
    const selectedRating = document.querySelector('input[name="rating"]:checked');
    if (!selectedRating) {
        alertBox.style.display = 'block';
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'Please select a rating.';
        return;
    }

    if (!freelancerEmail || !comment) {
        alertBox.style.display = 'block';
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'Please fill in all fields.';
        return;
    }

    try {
        const res = await fetch('/api/projects/reviews/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                project: projectId,
                freelancer_email: freelancerEmail,
                rating: parseInt(selectedRating.value),
                comment: comment
            })
        });
        const result = await res.json();

        if (res.ok) {
            alertBox.style.display = 'block';
            alertBox.className = 'alert alert-success';
            alertBox.textContent = 'Review submitted successfully!';
            document.getElementById('reviewComment').value = '';
            document.getElementById('freelancerEmail').value = '';
            setTimeout(() => location.reload(), 1500);
        } else {
            alertBox.style.display = 'block';
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = result.error || JSON.stringify(result);
        }
    } catch (err) {
        alertBox.style.display = 'block';
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'Something went wrong.';
    }
}