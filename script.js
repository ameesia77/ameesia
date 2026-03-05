// ===========================
// Portfolio Site — Data-Driven
// URL-Based Routing
// ===========================

document.addEventListener('DOMContentLoaded', async function() {

    // ===========================
    // Load Project Data
    // ===========================

    let projectsData = [];
    let artistLinks = {};
    const cacheBust = '?v=' + Date.now();

    try {
        const response = await fetch('/projects-cms.json' + cacheBust);
        const data = await response.json();
        projectsData = data.projects;
        artistLinks = data.artistLinks || {};
    } catch (err) {
        console.error('Failed to load projects:', err);
    }

    // ===========================
    // Helpers
    // ===========================

    function artistTag(name) {
        const url = artistLinks[name];
        if (url) {
            return `<a href="${url}" class="artist-tag artist-link" target="_blank">${name}</a>`;
        }
        return `<span class="artist-tag">${name}</span>`;
    }

    function collectionArtistLink(name) {
        if (!name) return '';
        const url = artistLinks[name];
        if (url) {
            return `<a href="${url}" class="collection-artist artist-link" target="_blank">${name}</a>`;
        }
        return `<span class="collection-artist">${name}</span>`;
    }

    // ===========================
    // Page Load Fade In
    // ===========================

    const mainContainer = document.getElementById('main');
    setTimeout(() => {
        mainContainer.classList.add('visible');
    }, 100);

    // ===========================
    // DOM References
    // ===========================

    const navLinks = document.querySelectorAll('.nav-link');
    const pageSections = document.querySelectorAll('.page-section');
    const gridContainer = document.getElementById('project-grid');
    const projectDetailSection = document.getElementById('project-detail-page');
    const projectContent = document.getElementById('project-content');

    // ===========================
    // Meta Tag Management
    // ===========================

    const defaultTitle = 'Ameesia Marold';
    const defaultDescription = 'Curator, creative producer, writer.';

    function setMeta(title, description) {
        document.title = title || defaultTitle;
        const metaDesc = document.querySelector('meta[name="description"]');
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDesc = document.querySelector('meta[property="og:description"]');
        const twTitle = document.querySelector('meta[name="twitter:title"]');
        const twDesc = document.querySelector('meta[name="twitter:description"]');
        if (metaDesc) metaDesc.setAttribute('content', description || defaultDescription);
        if (ogTitle) ogTitle.setAttribute('content', title || defaultTitle);
        if (ogDesc) ogDesc.setAttribute('content', description || defaultDescription);
        if (twTitle) twTitle.setAttribute('content', title || defaultTitle);
        if (twDesc) twDesc.setAttribute('content', description || defaultDescription);
    }

    // ===========================
    // Router
    // ===========================

    function getRoute() {
        return window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    }

    function navigate(path, pushState) {
        if (pushState !== false) {
            history.pushState(null, '', '/' + path);
        }
        route();
    }

    function route() {
        const path = getRoute();

        // Close any lightbox
        const existingLightbox = document.querySelector('.lightbox-overlay');
        if (existingLightbox) existingLightbox.remove();

        if (path === '' || path === 'work') {
            showWorkPage();
        } else if (path === 'about') {
            showAboutPage();
        } else if (path === 'contact') {
            showContactPage();
        } else {
            // Try to find a project by slug
            const project = projectsData.find(p => p.slug === path);
            if (project) {
                showProjectPage(project);
            } else {
                // 404 — redirect to home
                showWorkPage();
                history.replaceState(null, '', '/');
            }
        }
    }

    // ===========================
    // Page Display Functions
    // ===========================

    function showWorkPage() {
        setMeta(defaultTitle, defaultDescription);
        setActiveNav('work');
        showSection('work-page');
        mainContainer.style.display = '';
        window.scrollTo(0, 0);
    }

    function showAboutPage() {
        setMeta('About — Ameesia Marold', 'Gallery founder, curator, and creative producer working across digital art, contemporary art, and live experience.');
        setActiveNav('about');
        showSection('about-page');
        mainContainer.style.display = '';
        window.scrollTo(0, 0);
    }

    function showContactPage() {
        setMeta('Contact — Ameesia Marold', 'Available for projects, exhibitions, and consulting.');
        setActiveNav('contact');
        showSection('contact-page');
        mainContainer.style.display = '';
        window.scrollTo(0, 0);
    }

    function showProjectPage(project) {
        setMeta(project.metaTitle, project.metaDescription);
        setActiveNav(null);
        showSection('project-detail-page');

        const html = buildProjectDetailHTML(project);
        projectContent.innerHTML = html;
        mainContainer.style.display = '';
        document.body.style.overflow = '';
        window.scrollTo(0, 0);
        initLightbox();
    }

    function setActiveNav(pageName) {
        navLinks.forEach(l => {
            l.classList.remove('active');
            if (pageName && l.getAttribute('data-page') === pageName) {
                l.classList.add('active');
            }
        });
    }

    function showSection(sectionId) {
        pageSections.forEach(section => {
            section.classList.remove('active');
        });
        const target = document.getElementById(sectionId);
        if (target) target.classList.add('active');
    }

    // ===========================
    // Navigation Event Listeners
    // ===========================

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            if (targetPage === 'work') {
                navigate('');
            } else {
                navigate(targetPage);
            }
        });
    });

    // Logo click navigates to home (work page)
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            navigate('');
        });
    }

    // Back/forward button
    window.addEventListener('popstate', () => {
        route();
    });

    // ===========================
    // Render Project Grid
    // ===========================

    const sortedProjects = [...projectsData].sort((a, b) => {
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        if (yearB !== yearA) return yearB - yearA;
        return (b.order || 0) - (a.order || 0);
    });

    sortedProjects.forEach((project, index) => {
        const article = document.createElement('article');
        article.className = `grid-item ${project.gridSize || 'normal'}`;
        article.setAttribute('data-project-id', project.id);
        article.setAttribute('data-category', project.category);

        let categoryLabel = project.organization || project.category;
        if (project.category === 'Writing') categoryLabel = 'Writing';
        else if (project.category === 'Speaking & Directing') categoryLabel = 'Speaking';

        const yearDisplay = project.year || '';
        const hasCover = project.coverImage && project.coverImage !== '';

        if (hasCover) {
            article.innerHTML = `
                <div class="image-wrapper">
                    <img src="${project.coverImage}${cacheBust}" alt="${project.title}" loading="lazy">
                    <div class="image-overlay">
                        <span class="overlay-category">${categoryLabel}</span>
                        <h3 class="project-title">${project.title}</h3>
                        <p class="project-year">${yearDisplay}</p>
                    </div>
                </div>
            `;
        } else {
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
        }

        // Handle broken images
        const img = article.querySelector('img');
        if (img) {
            img.onerror = function() {
                this.parentElement.innerHTML = `
                    <div class="image-placeholder" data-title="${project.title}">
                        <span class="placeholder-org">${project.organization || ''}</span>
                        <span class="placeholder-title">${project.title}</span>
                    </div>
                    <div class="image-overlay">
                        <span class="overlay-category">${categoryLabel}</span>
                        <h3 class="project-title">${project.title}</h3>
                        <p class="project-year">${yearDisplay}</p>
                    </div>
                `;
            };
        }

        // Fade-in animation
        article.style.opacity = '0';
        article.style.transform = 'translateY(20px)';
        article.style.transition = `opacity 0.6s ease ${index * 0.03}s, transform 0.6s ease ${index * 0.03}s`;

        // Click navigates to project URL
        article.addEventListener('click', () => {
            navigate(project.slug);
        });

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
                } else if (filter === 'exhibitions') {
                    item.style.display = category === 'Exhibition' ? '' : 'none';
                } else if (filter === 'writing') {
                    item.style.display = category === 'Writing' ? '' : 'none';
                } else if (filter === 'speaking') {
                    item.style.display = category === 'Speaking & Directing' ? '' : 'none';
                }
            });
        });
    });

    // ===========================
    // CV Links — navigate to project URL from About page
    // ===========================

    document.querySelectorAll('.cv-link[data-project-link]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = link.getAttribute('data-project-link');
            const project = projectsData.find(p => p.id === projectId);
            if (project) {
                navigate(project.slug);
            }
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
    // Lightbox
    // ===========================

    let lightboxImages = [];
    let lightboxIndex = 0;

    function initLightbox() {
        const existing = document.querySelector('.lightbox-overlay');
        if (existing) existing.remove();

        lightboxImages = [];
        const heroImg = projectContent.querySelector('.gallery-hero img');
        if (heroImg) lightboxImages.push(heroImg.src);

        projectContent.querySelectorAll('.gallery-item img').forEach(img => {
            lightboxImages.push(img.src);
        });

        if (lightboxImages.length === 0) return;

        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = `
            <button class="lightbox-close" aria-label="Close">&times;</button>
            <button class="lightbox-nav lightbox-prev" aria-label="Previous">&lsaquo;</button>
            <img class="lightbox-image" src="" alt="">
            <button class="lightbox-nav lightbox-next" aria-label="Next">&rsaquo;</button>
            <div class="lightbox-counter"></div>
        `;
        document.body.appendChild(overlay);

        const lbImage = overlay.querySelector('.lightbox-image');
        const lbCounter = overlay.querySelector('.lightbox-counter');
        const lbClose = overlay.querySelector('.lightbox-close');
        const lbPrev = overlay.querySelector('.lightbox-prev');
        const lbNext = overlay.querySelector('.lightbox-next');

        function showImage(index) {
            lightboxIndex = index;
            lbImage.style.opacity = '0';
            setTimeout(() => {
                lbImage.src = lightboxImages[index];
                lbImage.style.opacity = '1';
            }, 150);
            lbCounter.textContent = `${index + 1} / ${lightboxImages.length}`;
            lbPrev.style.display = lightboxImages.length > 1 ? '' : 'none';
            lbNext.style.display = lightboxImages.length > 1 ? '' : 'none';
        }

        function openLightbox(index) {
            showImage(index);
            overlay.classList.add('active');
        }

        function closeLightbox() {
            overlay.classList.remove('active');
        }

        function nextImage() {
            showImage((lightboxIndex + 1) % lightboxImages.length);
        }

        function prevImage() {
            showImage((lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length);
        }

        if (heroImg) {
            heroImg.addEventListener('click', () => openLightbox(0));
        }

        projectContent.querySelectorAll('.gallery-item img').forEach((img, i) => {
            const offset = heroImg ? 1 : 0;
            img.addEventListener('click', () => openLightbox(i + offset));
        });

        lbClose.addEventListener('click', closeLightbox);
        lbPrev.addEventListener('click', prevImage);
        lbNext.addEventListener('click', nextImage);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeLightbox();
        });

        function handleKeydown(e) {
            if (!overlay.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        }

        document.addEventListener('keydown', handleKeydown);
    }

    // ===========================
    // Build Project Detail HTML
    // ===========================

    function buildProjectDetailHTML(p) {
        let sections = '';

        // Back button
        sections += `
            <div class="detail-back">
                <a href="/" class="back-link" id="back-to-grid">&larr; Back</a>
            </div>
        `;

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
                    <span class="detail-separator">&middot;</span>
                    <span class="detail-date">${p.dateRange || p.year || ''}</span>
                </div>
                ${p.venue ? `<p class="detail-venue">${p.venue}</p>` : ''}
                ${p.location && p.location !== p.venue ? `<p class="detail-location">${p.location}</p>` : ''}
            </div>
        `;

        // Full description (skip if embedded essay is present)
        if (p.fullDescription && !(p.embeddedEssay && p.embeddedEssay.length > 0)) {
            const paragraphs = p.fullDescription.split('\n\n').filter(s => s.trim());
            sections += `
                <div class="detail-description">
                    ${paragraphs.map(para => `<p>${para}</p>`).join('')}
                </div>
            `;
        }

        // Embedded essay (full text on page)
        if (p.embeddedEssay && p.embeddedEssay.length > 0) {
            sections += `
                <div class="essay-body">
                    ${p.embeddedEssay.map(para => `<p>${para}</p>`).join('')}
                </div>
            `;
        }

        // External links (for writing entries)
        if (p.link || p.xLink) {
            sections += `<div class="detail-section essay-links">`;
            if (p.link) {
                sections += `
                    <a href="${p.link}" class="external-link" target="_blank">
                        Read on ${p.publication || 'External Site'} &rarr;
                    </a>
                `;
            }
            if (p.xLink) {
                sections += `
                    <a href="${p.xLink}" class="external-link" target="_blank">
                        View on X &rarr;
                    </a>
                `;
            }
            sections += `</div>`;
        }

        // Watch links
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

        // Exhibition link (AUTOMATA projects)
        if (p.exhibitionLink) {
            sections += `
                <div class="detail-section">
                    <a href="${p.exhibitionLink}" class="external-link exhibition-link" target="_blank">
                        View Exhibition &rarr;
                    </a>
                </div>
            `;
        }

        // Image gallery
        const hasImages = (p.images && p.images.length > 0) || p.coverImage;
        const hasVideos = p.videos && p.videos.length > 0;

        if (hasImages || hasVideos) {
            sections += `<div class="detail-gallery">`;

            if (p.coverImage) {
                sections += `
                    <div class="gallery-hero">
                        <img src="${p.coverImage}${cacheBust}" alt="${p.title}" loading="lazy">
                    </div>
                `;
            }

            if (hasVideos) {
                sections += `<div class="gallery-videos">`;
                p.videos.forEach(v => {
                    sections += `
                        <div class="video-embed">
                            <iframe src="https://www.youtube.com/embed/${v.youtubeId}"
                                title="${v.title}"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen>
                            </iframe>
                            <p class="video-title">${v.title}</p>
                        </div>
                    `;
                });
                sections += `</div>`;
            }

            if (p.images && p.images.length > 0) {
                sections += `<div class="gallery-grid">`;
                p.images.forEach(img => {
                    sections += `
                        <div class="gallery-item">
                            <img src="${img}${cacheBust}" alt="" loading="lazy">
                        </div>
                    `;
                });
                sections += `</div>`;
            }

            sections += `</div>`;
        } else {
            sections += `
                <div class="detail-gallery">
                    <div class="gallery-placeholder">
                        <span>Images coming soon</span>
                    </div>
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
                        ${p.aiCollection.map(a => artistTag(a)).join('')}
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
                                ${collectionArtistLink(item.artist)}
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
                        ${p.curatedCollection.map(a => artistTag(a)).join('')}
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
                        ${p.artists.map(a => artistTag(a)).join('')}
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
                                ${collectionArtistLink(ex.artist || ex.artists || '')}
                                ${ex.note ? `<span class="collection-note">${ex.note}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Opening Exhibition Artists (Venice Beach)
        if (p.openingArtists && p.openingArtists.length > 0) {
            const linkedNames = p.openingArtists.map(name => {
                const url = artistLinks[name];
                if (url) {
                    return `<a href="${url}" class="artist-inline-link" target="_blank">${name}</a>`;
                }
                return `<span class="artist-inline">${name}</span>`;
            });
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">Opening Exhibition</h3>
                    <p class="artist-inline-list">${linkedNames.join(', ')}, and more.</p>
                </div>
            `;
        }

        // Solo Shows (Venice Beach)
        if (p.soloShows && p.soloShows.length > 0) {
            const linkedShows = p.soloShows.map(entry => {
                const parts = entry.split(' x ');
                const linkedParts = parts.map(name => {
                    const trimmed = name.trim();
                    const url = artistLinks[trimmed];
                    if (url) {
                        return `<a href="${url}" class="artist-inline-link" target="_blank">${trimmed}</a>`;
                    }
                    return `<span class="artist-inline">${trimmed}</span>`;
                });
                return linkedParts.join(' x ');
            });
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">Solo Shows</h3>
                    <p class="artist-inline-list">${linkedShows.join(', ')}</p>
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
                                ${collectionArtistLink(item.artist)}
                                ${item.note ? `<span class="collection-note">${item.note}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Colorforms
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
                        ${collectionArtistLink(p.artistInResidence.artist)}
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
                        ${p.music.map(m => artistTag(m)).join('')}
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
                        ${p.partners.map(partner => artistTag(partner)).join('')}
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

        // CryptoCitizens
        if (p.cryptoCitizens) {
            sections += `
                <div class="detail-section">
                    <h3 class="section-heading">CryptoCitizens</h3>
                    <p class="detail-text">${p.cryptoCitizens}</p>
                </div>
            `;
        }

        return sections;
    }

    function buildCollectionSection(p) {
        const items = p.collection;
        if (!items || items.length === 0) return '';

        if (items[0].sectionTitle) {
            return `
                <div class="detail-section">
                    <h3 class="section-heading">${items[0].sectionTitle}</h3>
                    <div class="artist-list">
                        ${items[0].artists.map(a => artistTag(a)).join('')}
                    </div>
                </div>
            `;
        }

        const heading = 'Collection';
        return `
            <div class="detail-section">
                <h3 class="section-heading">${heading}</h3>
                <div class="collection-list">
                    ${items.map((item, i) => `
                        <div class="collection-item">
                            <span class="collection-number">${i + 1}</span>
                            ${item.title ? `<span class="collection-work">${item.title}</span>` : ''}
                            ${collectionArtistLink(item.artist)}
                            ${item.note ? `<span class="collection-note">${item.note}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ===========================
    // Back Link Handler (delegated)
    // ===========================

    document.addEventListener('click', (e) => {
        const backLink = e.target.closest('#back-to-grid');
        if (backLink) {
            e.preventDefault();
            navigate('');
        }
    });

    // ===========================
    // Initial Route
    // ===========================

    route();

});
