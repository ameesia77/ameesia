// ===========================
// Portfolio Site — Data-Driven
// ===========================

document.addEventListener('DOMContentLoaded', async function() {

    // ===========================
    // Load Project Data
    // ===========================

    let projectsData = [];

    try {
        const response = await fetch('projects-cms.json');
        const data = await response.json();
        projectsData = data.projects;
    } catch (err) {
        console.error('Failed to load projects:', err);
    }

    // ===========================
    // Page Load Fade In
    // ===========================

    const mainContainer = document.getElementById('main');
    setTimeout(() => {
        mainContainer.classList.add('visible');
    }, 100);

    // ===========================
    // Navigation Between Pages
    // ===========================

    const navLinks = document.querySelectorAll('.nav-link');
    const pageSections = document.querySelectorAll('.page-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            navigateToPage(targetPage);
        });
    });

    function navigateToPage(pageName) {
        navLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`[data-page="${pageName}"]`);
        if (activeLink) activeLink.classList.add('active');

        pageSections.forEach(section => section.classList.remove('active'));
        const targetSection = document.getElementById(`${pageName}-page`);
        if (targetSection) targetSection.classList.add('active');

        // Close project detail if open
        const projectDetail = document.getElementById('project-detail');
        if (projectDetail.classList.contains('active')) {
            projectDetail.classList.remove('active');
            document.body.style.overflow = '';
        }

        window.scrollTo(0, 0);
    }

    // ===========================
    // Render Project Grid
    // ===========================

    const gridContainer = document.getElementById('project-grid');

    // Sort projects: newest first (by order descending, AUTOMATA first, then BM, then others)
    const sortedProjects = [...projectsData].sort((a, b) => {
        // Primary sort: by year descending
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        if (yearB !== yearA) return yearB - yearA;
        // Secondary: by order descending within same year
        return (b.order || 0) - (a.order || 0);
    });

    sortedProjects.forEach((project, index) => {
        const article = document.createElement('article');
        article.className = `grid-item ${project.gridSize || 'normal'}`;
        article.setAttribute('data-project-id', project.id);
        article.setAttribute('data-category', project.category);

        // Determine category label for the grid
        let categoryLabel = project.category;
        if (project.organization === 'AUTOMATA') categoryLabel = 'AUTOMATA';
        else if (project.category === 'Writing') categoryLabel = 'Writing';
        else if (project.category === 'Speaking & Directing') categoryLabel = 'Speaking';
        else if (project.category === 'Publication') categoryLabel = 'Publication';
        else if (project.category === "Christie's Auction") categoryLabel = "Christie's";
        else categoryLabel = 'Bright Moments';

        // Build year display
        const yearDisplay = project.year || '';

        article.innerHTML = `
            <div class="image-wrapper">
                <div class="image-placeholder" data-title="${project.title}">
                    <span class="placeholder-org">${project.organization || ''}</span>
                    <span class="placeholder-title">${project.title}</span>
                </div>
                <div class="image-overlay">
                    <span class="overlay-category">${categoryLabel}</span>
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-year">${yearDisplay}</p>
                </div>
            </div>
        `;

        // Fade-in animation
        article.style.opacity = '0';
        article.style.transform = 'translateY(20px)';
        article.style.transition = `opacity 0.6s ease ${index * 0.03}s, transform 0.6s ease ${index * 0.03}s`;

        article.addEventListener('click', () => openProjectDetail(project));

        gridContainer.appendChild(article);
    });

    // ===========================
    // Filter Tabs
    // ===========================

    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter');
            const gridItems = gridContainer.querySelectorAll('.grid-item');

            gridItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all') {
                    item.style.display = '';
                } else if (filter === 'automata') {
                    item.style.display = category === 'AUTOMATA' ? '' : 'none';
                } else if (filter === 'bright-moments') {
                    item.style.display = (category.startsWith('Bright Moments') ? '' : 'none');
                } else if (filter === 'other') {
                    item.style.display = (!category.startsWith('Bright Moments') && category !== 'AUTOMATA') ? '' : 'none';
                }
            });
        });
    });

    // ===========================
    // Scroll Animations
    // ===========================

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    gridContainer.querySelectorAll('.grid-item').forEach(item => {
        observer.observe(item);
    });

    // ===========================
    // Project Detail Page
    // ===========================

    const projectDetail = document.getElementById('project-detail');
    const projectContent = document.getElementById('project-content');
    const closeProject = document.getElementById('close-project');

    function openProjectDetail(project) {
        const html = buildProjectDetailHTML(project);
        projectContent.innerHTML = html;
        projectDetail.classList.add('active');
        document.body.style.overflow = 'hidden';
        projectDetail.scrollTop = 0;
    }

    function buildProjectDetailHTML(p) {
        let sections = '';

        // Header
        sections += `
            <div class="detail-header">
                <div class="detail-breadcrumb">
                    <span class="detail-org">${p.organization || ''}</span>
                    ${p.organizingPrinciple ? `<span class="detail-principle">"${p.organizingPrinciple}"</span>` : ''}
                </div>
                <h1 class="detail-title">${p.title}</h1>
                <div class="detail-meta">
                    <span class="detail-role">${p.role || ''}</span>
                    <span class="detail-separator">·</span>
                    <span class="detail-date">${p.dateRange || p.year || ''}</span>
                </div>
                ${p.venue ? `<p class="detail-venue">${p.venue}</p>` : ''}
                ${p.location && p.location !== p.venue ? `<p class="detail-location">${p.location}</p>` : ''}
            </div>
        `;

        // Image gallery placeholder
        sections += `
            <div class="detail-gallery">
                <div class="gallery-placeholder">
                    <span>Images coming soon</span>
                </div>
            </div>
        `;

        // CryptoCitizens badge
        if (p.cryptoCitizens) {
            sections += `
                <div class="detail-citizens">
                    <span class="citizens-label">CryptoCitizens</span>
                    <span class="citizens-name">${p.cryptoCitizens}</span>
                </div>
            `;
        }

        // Full description
        if (p.fullDescription) {
            const paragraphs = p.fullDescription.split('\n\n').filter(s => s.trim());
            sections += `
                <div class="detail-description">
                    ${paragraphs.map(para => `<p>${para}</p>`).join('')}
                </div>
            `;
        }

        // Collection / Artists section
        if (p.collection && p.collection.length > 0) {
            sections += buildCollectionSection(p);
        }

        // AI Collection (Tokyo)
        if (p.aiCollection && p.aiCollection.length > 0) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">AI Collection</h3>
                    <div class="artist-list">
                        ${p.aiCollection.map(a => `<span class="artist-tag">${a}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        // Japanese Contemporary Collection (Tokyo)
        if (p.japaneseContemporaryCollection && p.japaneseContemporaryCollection.length > 0) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">Japanese Contemporary Collection</h3>
                    <div class="collection-list">
                        ${p.japaneseContemporaryCollection.map(item => `
                            <div class="collection-item">
                                ${item.title ? `<span class="collection-work">${item.title}</span>` : ''}
                                <span class="collection-artist">${item.artist}</span>
                                ${item.note ? `<span class="collection-note">${item.note}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Curated Collection (Berlin)
        if (p.curatedCollection && p.curatedCollection.length > 0) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">Curated Collection</h3>
                    <div class="artist-list">
                        ${p.curatedCollection.map(a => `<span class="artist-tag">${a}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        // Simple artists list
        if (p.artists && p.artists.length > 0 && !p.collection) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">${p.artists.length === 1 ? 'Artist' : 'Artists'}</h3>
                    <div class="artist-list">
                        ${p.artists.map(a => `<span class="artist-tag">${a}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        // Exhibitions within activation
        if (p.exhibitions && p.exhibitions.length > 0) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">Exhibitions</h3>
                    <div class="collection-list">
                        ${p.exhibitions.map(ex => `
                            <div class="collection-item">
                                <span class="collection-work">${ex.title}</span>
                                <span class="collection-artist">${ex.artist || ex.artists || ''}</span>
                                ${ex.note ? `<span class="collection-note">${ex.note}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Opening reception mints (Buenos Aires)
        if (p.openingReceptionMints && p.openingReceptionMints.length > 0) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">Opening Reception</h3>
                    <div class="collection-list">
                        ${p.openingReceptionMints.map(item => `
                            <div class="collection-item">
                                <span class="collection-work">${item.title}</span>
                                <span class="collection-artist">${item.artist}</span>
                                ${item.note ? `<span class="collection-note">${item.note}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Colorforms (923 Empty Rooms)
        if (p.colorforms && p.colorforms.length > 0) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">Colorforms</h3>
                    <div class="colorforms-grid">
                        ${p.colorforms.map(cf => `
                            <div class="colorform-item">
                                <span class="colorform-form">${cf.form}</span>
                                <span class="colorform-city">${cf.city}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Artist in Residence (Paris)
        if (p.artistInResidence) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">Artist in Residence</h3>
                    <div class="collection-item">
                        <span class="collection-work">${p.artistInResidence.title}</span>
                        <span class="collection-artist">${p.artistInResidence.artist}</span>
                    </div>
                </div>
            `;
        }

        // Music
        if (p.music && p.music.length > 0) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">Music</h3>
                    <div class="artist-list">
                        ${p.music.map(m => `<span class="artist-tag">${m}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        // Partners
        if (p.partners && p.partners.length > 0) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">Partners</h3>
                    <div class="artist-list">
                        ${p.partners.map(partner => `<span class="artist-tag">${partner}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        // Educational
        if (p.educational) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">Educational Programming</h3>
                    <p class="detail-text">${p.educational}</p>
                </div>
            `;
        }

        // Additional notes
        if (p.additionalNotes) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">Notes</h3>
                    <p class="detail-text">${p.additionalNotes}</p>
                </div>
            `;
        }

        // Key highlights
        if (p.keyHighlights && p.keyHighlights.length > 0) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">Highlights</h3>
                    <ul class="highlights-list">
                        ${p.keyHighlights.map(h => `<li>${h}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Press
        if (p.press && p.press.length > 0) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">Press</h3>
                    <div class="press-list">
                        ${p.press.map(item => `
                            <a href="${item.link || '#'}" class="press-item" ${item.link && item.link !== '#' ? 'target="_blank"' : ''}>
                                <span class="press-publication">${item.publication}</span>
                                <span class="press-title">${item.title}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Links (for speaking/directing with YouTube links)
        if (p.links && p.links.length > 0) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">Watch</h3>
                    <div class="press-list">
                        ${p.links.map(link => `
                            <a href="${link.url}" class="press-item" target="_blank">
                                <span class="press-publication">YouTube</span>
                                <span class="press-title">${link.title}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // External link (for writing entries)
        if (p.link) {
            sections += `
                <div class="detail-section">
                    <a href="${p.link}" class="external-link" target="_blank">
                        Read on ${p.publication || 'External Site'} →
                    </a>
                </div>
            `;
        }

        return sections;
    }

    function buildCollectionSection(p) {
        // Handle different collection formats
        const items = p.collection;
        if (!items || items.length === 0) return '';

        // Check if this is the Tokyo format (with sectionTitle and artists array)
        if (items[0].sectionTitle) {
            return `
                <div class="detail-section">
                    <h3 class="section-heading">${items[0].sectionTitle}</h3>
                    <div class="artist-list">
                        ${items[0].artists.map(a => `<span class="artist-tag">${a}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        // Standard collection format (title + artist)
        const heading = p.cryptoCitizens ? 'Collection' : 'Collection';
        return `
            <div class="detail-section">
                <h3 class="section-heading">${heading}</h3>
                <div class="collection-list">
                    ${items.map((item, i) => `
                        <div class="collection-item">
                            <span class="collection-number">${i + 1}</span>
                            ${item.title ? `<span class="collection-work">${item.title}</span>` : ''}
                            <span class="collection-artist">${item.artist}</span>
                            ${item.note ? `<span class="collection-note">${item.note}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ===========================
    // Close Project Detail
    // ===========================

    if (closeProject) {
        closeProject.addEventListener('click', () => {
            projectDetail.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectDetail.classList.contains('active')) {
            projectDetail.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // ===========================
    // Logo Click — Return to Work
    // ===========================

    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage('work');
        });
    }

});
