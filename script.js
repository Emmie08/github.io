document.addEventListener('DOMContentLoaded', () => {
    console.log("--- SITE CHARGÉ : SCRIPT ACTIF ---");

    // ======================================================
    // 1. GESTION DES TRANSITIONS DE PAGE
    // ======================================================
    setTimeout(() => {
        document.body.classList.add('page-loaded');
        console.log("Page chargée : rideau levé.");
    }, 100);

    const transitionLinks = document.querySelectorAll('.transition-link, .project-item, .back-button, .logo a, .nav-links a');
    transitionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && href !== window.location.href) {
                e.preventDefault(); 
                const target = link.href;
                document.body.classList.remove('page-loaded');
                document.body.classList.add('is-leaving');
                setTimeout(() => { window.location.href = target; }, 800);
            }
        });
    });

    // ======================================================
    // 2. SMOOTH SCROLL POUR ANCRES
    // ======================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ======================================================
    // 3. SLIDER ACCUEIL (AVEC BARRE DE DÉFILEMENT)
    // ======================================================
    const container = document.querySelector('.projects-container');
    const thumb = document.getElementById('scroll-thumb');
    const track = document.querySelector('.scroll-track');

    if (container && thumb && track) {
        let isDragging = false;
        let startX;
        let startThumbLeft;

        thumb.addEventListener('mousedown', (e) => {
            isDragging = true;
            thumb.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
            startX = e.clientX;
            startThumbLeft = thumb.offsetLeft;
            // On désactive le scroll-behavior smooth CSS pendant le drag pour éviter le lag
            container.style.scrollBehavior = 'auto'; 
        });

        window.addEventListener('mouseup', () => {
            if(isDragging) {
                isDragging = false;
                thumb.style.cursor = 'grab';
                document.body.style.userSelect = '';
                // On remet le scroll smooth pour la molette
                container.style.scrollBehavior = 'smooth';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const mouseDelta = e.clientX - startX;
            let newLeft = startThumbLeft + mouseDelta;
            const maxThumbMove = track.clientWidth - thumb.clientWidth;
            
            if (newLeft < 0) newLeft = 0;
            if (newLeft > maxThumbMove) newLeft = maxThumbMove;
            
            thumb.style.left = `${newLeft}px`;
            
            const scrollPercentage = newLeft / maxThumbMove;
            const maxScrollLeft = container.scrollWidth - container.clientWidth;
            container.scrollLeft = scrollPercentage * maxScrollLeft;
        });

        // Sync inverse (Scroll -> Curseur)
        container.addEventListener('scroll', () => {
            if (isDragging) return;
            const maxScrollLeft = container.scrollWidth - container.clientWidth;
            const scrollPercentage = container.scrollLeft / maxScrollLeft;
            const maxThumbMove = track.clientWidth - thumb.clientWidth;
            const newThumbPosition = scrollPercentage * maxThumbMove;
            thumb.style.left = `${newThumbPosition}px`;
        });
    }

    // ======================================================
    // 4. SLIDER PAGE PROJET (PANNEAU DROITE - FLUIDE / INERTIE)
    // ======================================================
    const projectPanel = document.querySelector('.project-visuals-panel');

    if (projectPanel) {
        console.log("Panel Projet détecté : Mode Fluide Activé.");
        
        let isDown = false;
        let startX;
        let scrollLeft;
        
        // Variables pour la fluidité (Inertie)
        let targetScroll = 0;
        let currentScroll = 0;
        let isAnimating = false;

        // Configuration de la fluidité (0.05 = très lent/lourd, 0.2 = rapide)
        const ease = 0.08; 

        // Initialisation position
        currentScroll = projectPanel.scrollLeft;
        targetScroll = currentScroll;

        // Boucle d'animation (C'est ça qui crée la fluidité)
        function animateScroll() {
            // On rapproche "current" de "target" petit à petit
            currentScroll += (targetScroll - currentScroll) * ease;
            
            // On applique le mouvement
            projectPanel.scrollLeft = currentScroll;

            // Si on est assez proche de la cible, on arrête le calcul pour économiser la batterie
            if (Math.abs(targetScroll - currentScroll) > 0.5) {
                requestAnimationFrame(animateScroll);
                isAnimating = true;
            } else {
                isAnimating = false;
            }
        }

        projectPanel.addEventListener('mousedown', (e) => {
            isDown = true;
            projectPanel.style.cursor = 'grabbing';
            projectPanel.style.userSelect = 'none';
            
            // Point de départ
            startX = e.pageX;
            // On note où on est au moment du clic
            scrollLeft = projectPanel.scrollLeft;
            
            // On synchronise nos variables pour éviter les sauts
            currentScroll = scrollLeft;
            targetScroll = scrollLeft;
            
            // On coupe le CSS smooth s'il y en a
            projectPanel.style.scrollBehavior = 'auto'; 
        });

        const stopDrag = () => {
            isDown = false;
            projectPanel.style.cursor = 'grab';
            projectPanel.style.userSelect = '';
        };

        projectPanel.addEventListener('mouseleave', stopDrag);
        projectPanel.addEventListener('mouseup', stopDrag);

        projectPanel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            
            const x = e.pageX;
            // Calcul de la distance parcourue par la souris
            const walk = (x - startX) * 1.5; // * 1.5 pour aller un peu plus vite que la souris
            
            // On met à jour la CIBLE (target), pas le scroll direct
            targetScroll = scrollLeft - walk;
            
            // On s'assure de ne pas sortir des limites
            const maxScroll = projectPanel.scrollWidth - projectPanel.clientWidth;
            targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

            // Si l'animation ne tourne pas déjà, on la lance
            if (!isAnimating) {
                requestAnimationFrame(animateScroll);
            }
        });
        
        // Support Molette (Haut/Bas -> Gauche/Droite) avec fluidité
        projectPanel.addEventListener('wheel', (evt) => {
            if (evt.deltaY !== 0) {
                evt.preventDefault();
                // On ajoute le mouvement de molette à la cible
                targetScroll += evt.deltaY * 2;
                
                // Limites
                const maxScroll = projectPanel.scrollWidth - projectPanel.clientWidth;
                targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
                
                if (!isAnimating) requestAnimationFrame(animateScroll);
            }
        });
    }

    // ======================================================
    // 5. LIGHTBOX CARROUSEL
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
            sourceImg.style.cursor = "zoom-in"; 
            sourceImg.addEventListener('click', function() { openLightbox(index); });
        });

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

        function closeLightbox() { lightbox.classList.remove('active'); }
        function showNext() { currentIndex = (currentIndex + 1) % lightboxImages.length; updateCarousel(); }
        function showPrev() { currentIndex = (currentIndex - 1 + lightboxImages.length) % lightboxImages.length; updateCarousel(); }

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
        if (lightbox) lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === lightboxTrack || e.target.classList.contains('lightbox-carousel-track-container')) closeLightbox();
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