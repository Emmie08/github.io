document.addEventListener('DOMContentLoaded', () => {
    console.log("--- SITE CHARGÉ : SCRIPT ACTIF ---");

    // ======================================================
    // 0. MARQUEE INFINI (Clonage automatique)
    // ======================================================
    const marqueeTrack = document.querySelector('.marquee-track');
    const marqueeGroup = document.querySelector('.marquee-group');
    if (marqueeTrack && marqueeGroup) {
    const clone = marqueeGroup.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    marqueeTrack.appendChild(clone);
}

    


    // ======================================================
    // 1. GESTION DES TRANSITIONS DE PAGE (RIDEAU & CHARGEMENT)
    // ======================================================
    
    // A. L'ARRIVÉE : On lève le rideau
    setTimeout(() => {
        document.body.classList.add('page-loaded');
        console.log("Page chargée : rideau levé.");
    }, 100);

    // B. LE DÉPART : On baisse le rideau au clic sur un lien
    const transitionLinks = document.querySelectorAll('.transition-link, .project-item, .back-button, .logo a, .nav-links a');

    transitionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            // Si c'est un lien interne valide (pas # seul, pas vide, pas la page actuelle)
            if (href && !href.startsWith('#') && href !== window.location.href) {
                e.preventDefault(); 
                const target = link.href;

                console.log("Départ vers : " + target);
                document.body.classList.remove('page-loaded');
                document.body.classList.add('is-leaving');

                setTimeout(() => {
                    window.location.href = target;
                }, 800);
            }
        });
    });


    // ======================================================
    // 2. GESTION DU SCROLL DOUX (Smooth Scroll) POUR LES ANCRES
    // ======================================================
    // Indispensable pour le bouton "Explore"
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });


    // ======================================================
    // 3. GESTION DU SCROLL HORIZONTAL FLUIDE (Projets)
    // ======================================================
    const scrollContainer = document.querySelector('#horizontal-scroll');

    if (scrollContainer) {
        console.log("Scroll horizontal fluide activé.");
        let currentScroll = 0;
        let targetScroll = 0;
        let isScrolling = false;
        const ease = 0.05; 

        scrollContainer.addEventListener('wheel', (evt) => {
            evt.preventDefault();
            // On accélère un peu le scroll (* 2.5) pour que ce soit moins lent
            targetScroll += evt.deltaY * 2.5; 
            
            // --- CORRECTION ICI ---
            // On utilise clientWidth au lieu de window.innerWidth
            const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
            
            targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
            
            if (!isScrolling) {
                isScrolling = true;
                requestAnimationFrame(animateScroll);
            }
        }, { passive: false });

        function animateScroll() {
            currentScroll += (targetScroll - currentScroll) * ease;
            scrollContainer.scrollLeft = currentScroll;

            if (Math.abs(targetScroll - currentScroll) > 1) {
                requestAnimationFrame(animateScroll);
            } else {
                isScrolling = false;
            }
        }
        
        window.addEventListener('resize', () => {
             // --- CORRECTION ICI AUSSI ---
             const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
             targetScroll = Math.min(targetScroll, maxScroll);
        });
    }



    // ======================================================
    // 5. GESTION LIGHTBOX CARROUSEL (Galerie Croquis)
    // ======================================================
    const gallerySourceImages = document.querySelectorAll('.gallery-column img');
    
    if (gallerySourceImages.length > 0) {
        const lightbox = document.getElementById('lightbox');
        const lightboxTrack = document.getElementById('lightbox-track');
        const closeBtn = document.querySelector('.close-btn');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        let currentIndex = 0;
        let lightboxImages = [];

        // --- 1. INITIALISATION : CLONAGE DES IMAGES ---
        gallerySourceImages.forEach((sourceImg, index) => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('lightbox-image-wrapper');
            const img = document.createElement('img');
            img.src = sourceImg.src;
            img.alt = sourceImg.alt;
            img.draggable = false;
            wrapper.appendChild(img);
            lightboxTrack.appendChild(wrapper);
            lightboxImages.push(wrapper);

            // Clic sur l'image originale pour ouvrir
            sourceImg.style.cursor = "zoom-in"; 
            sourceImg.addEventListener('click', function() {
                openLightbox(index);
            });
        });

        // --- 2. FONCTIONS DE MISE À JOUR ---
        function updateCarousel() {
            if(lightboxImages.length === 0) return;
            const imageWidth = lightboxImages[0].offsetWidth; 
            const gap = 50; 
            const translateX = - (currentIndex * (imageWidth + gap));
            
            lightboxTrack.style.transform = `translateX(${translateX}px)`;

            lightboxImages.forEach((wrapper, i) => {
                if (i === currentIndex) wrapper.classList.add('active');
                else wrapper.classList.remove('active');
            });
        }

        function openLightbox(index) {
            currentIndex = index;
            lightbox.classList.add('active');
            setTimeout(() => { updateCarousel(); }, 100);
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
        }

        function showNext() {
            currentIndex++;
            if (currentIndex >= lightboxImages.length) currentIndex = 0;
            updateCarousel();
        }

        function showPrev() {
            currentIndex--;
            if (currentIndex < 0) currentIndex = lightboxImages.length - 1;
            updateCarousel();
        }

        // --- 3. ÉVÉNEMENTS LIGHTBOX ---
        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        
        if (nextBtn) nextBtn.addEventListener('click', (e) => { 
            e.stopPropagation(); showNext(); 
        });
        
        if (prevBtn) prevBtn.addEventListener('click', (e) => { 
            e.stopPropagation(); showPrev(); 
        });
        
        if (lightbox) lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === lightboxTrack || e.target.classList.contains('lightbox-carousel-track-container')) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (lightbox && lightbox.classList.contains('active')) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowRight') showNext();
                if (e.key === 'ArrowLeft') showPrev();
            }
        });
    }
});