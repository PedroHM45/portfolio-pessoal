// ===== PORTFÓLIO JAPONÊS SUMI-E - MAIN JAVASCRIPT =====

/**
 * Sistema principal de navegação e funcionalidades do portfólio
 * Inspirado na arte japonesa Sumi-e
 * 
 * NAVEGAÇÃO: Exclusivamente por clique nos links do menu
 * - Sem navegação por scroll/wheel
 * - Sem navegação por swipe/touch
 * - Sem navegação por teclado (exceto Escape para fechar menu)
 * - Transições suaves sem movimento vertical da tela
 */

class SumieSidebar {
    constructor() {
        this.sections = ['home', 'about', 'skills', 'projects', 'contact'];
        this.currentSection = 'home';
        this.isMenuOpen = false;
        this.isMobile = window.innerWidth <= 768;
        
        // Cache de seletores para performance
        this.cache = {};
        this.cacheElements();
        
        // Carrossel de projetos
        this.currentSlide = 0;
        this.totalSlides = 3;
        this.carouselTrack = null; // Será definido em setupCarousel()
        this.carouselDots = null; // Será definido em setupCarousel()
        
        // Observer para animações de entrada
        this.observer = null;
        
        // Debounce timers
        this.resizeTimer = null;
        this.scrollTimer = null;
        
        this.init();
    }

    // Cache elementos DOM para evitar queries repetidas
    cacheElements() {
        this.sidebar = document.getElementById('sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.mobileToggle = document.querySelector('.mobile-menu-toggle');
        this.mobileOverlay = document.querySelector('.mobile-overlay');
        this.navLinks = document.querySelectorAll('.nav-link');
    }

    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.setupLazyLoading();
        this.setupCarousel();
        this.initializeAnimations();
        this.setActiveNavigation();
        
        // Configurações iniciais
        this.updateMobileStatus();
        
        // Configurar navegação por scroll no mobile
        this.setupMobileScrollNavigation();
        
        // Garantir que o menu mobile inicie fechado
        this.ensureMobileMenuClosed();
        
        window.addEventListener('resize', () => this.handleResize());
        
        console.log('🎨 Sumi-e Portfolio inicializado - Navegação apenas por clique');
    }

    // ===== NAVEGAÇÃO E MENU =====
    
    setupEventListeners() {
        // Menu mobile toggle
        this.mobileToggle?.addEventListener('click', () => this.toggleMobileMenu());
        this.mobileOverlay?.addEventListener('click', () => this.closeMobileMenu());
        
        // Links de navegação
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });
        
        // Touch events para mobile
        this.setupTouchEvents();
        
        // Funcionalidade de copiar email
        this.setupEmailCopy();
        
        // Manter apenas Escape para fechar menu mobile
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
        
        // Detectar mudanças de orientação/redimensionamento com debounce
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                this.updateMobileStatus();
            }, 250); // Debounce de 250ms
        });
        
        window.addEventListener('orientationchange', () => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                this.updateMobileStatus();
            }, 100);
        });
    }

    handleNavigation(e) {
        e.preventDefault();
        const targetSection = e.currentTarget.dataset.section;
        
        if (targetSection && this.sections.includes(targetSection)) {
            this.setActiveSection(targetSection);
            
            // Fechar menu mobile se estiver aberto
            if (this.isMenuOpen) {
                this.closeMobileMenu();
            }
        }
    }

    setActiveSection(sectionName) {
        if (!this.sections.includes(sectionName) || sectionName === this.currentSection) {
            return;
        }

        // No mobile, fazer scroll suave para a seção
        if (this.isMobile) {
            const targetSectionEl = this.getSectionElement(sectionName);
            if (targetSectionEl) {
                targetSectionEl.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            this.currentSection = sectionName;
            this.updateActiveNavigation();
            this.trackSectionView(sectionName);
            return;
        }

        // Comportamento desktop (animações de fade) com cache
        const currentSectionEl = this.getSectionElement(this.currentSection);
        const targetSectionEl = this.getSectionElement(sectionName);
        
        if (currentSectionEl) {
            currentSectionEl.classList.add('fade-out');
            
            // Usar requestAnimationFrame para melhor performance
            requestAnimationFrame(() => {
                setTimeout(() => {
                    currentSectionEl.classList.remove('active', 'fade-out');
                    
                    // Animação de entrada da nova seção
                    if (targetSectionEl) {
                        targetSectionEl.classList.add('active');
                        this.triggerSectionAnimations(targetSectionEl);
                    }
                }, 150);
            });
        }

        this.currentSection = sectionName;
        this.updateActiveNavigation();
        
        // Analytics/tracking
        this.trackSectionView(sectionName);
    }

    // Cache helper para elementos de seção
    getSectionElement(sectionName) {
        if (!this.cache[sectionName]) {
            this.cache[sectionName] = document.getElementById(sectionName);
        }
        return this.cache[sectionName];
    }

    updateActiveNavigation() {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === this.currentSection) {
                link.classList.add('active');
            }
        });
    }

    setActiveNavigation() {
        this.updateActiveNavigation();
    }

    // ===== MENU MOBILE =====
    
    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.isMenuOpen = true;
        this.mobileToggle?.classList.add('active');
        this.sidebar?.classList.add('mobile-open');
        this.mobileOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Animação sequencial dos itens do menu
        this.animateMenuItems();
    }

    closeMobileMenu() {
        this.isMenuOpen = false;
        this.mobileToggle?.classList.remove('active');
        this.sidebar?.classList.remove('mobile-open');
        this.mobileOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    animateMenuItems() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.style.setProperty('--animation-delay', index);
            item.classList.add('animate-in');
        });
    }

    // ===== CARROSSEL DE PROJETOS =====
    
    setupCarousel() {
        // Pequeno delay para garantir que o DOM esteja totalmente carregado
        setTimeout(() => {
            // Cache elementos se ainda não foram carregados
            if (!this.cache.carouselTrack) {
                this.carouselTrack = document.querySelector('.carousel-track');
                this.carouselDots = document.querySelectorAll('.carousel-dot');
                this.cache.carouselTrack = this.carouselTrack;
                this.cache.carouselDots = this.carouselDots;
                this.cache.prevBtn = document.querySelector('.carousel-prev');
                this.cache.nextBtn = document.querySelector('.carousel-next');
            } else {
                // Usar cache
                this.carouselTrack = this.cache.carouselTrack;
                this.carouselDots = this.cache.carouselDots;
            }
            
            if (!this.carouselTrack || this.carouselDots.length === 0) {
                console.warn('⚠️ Elementos do carrossel não encontrados - tentando novamente...');
                return;
            }
            
            console.log('🎠 Carrossel inicializado com', this.carouselDots.length, 'dots');
            
            // Se for mobile, configurar layout vertical
            if (this.isMobile) {
                this.setupMobileVerticalLayout();
                return;
            }
            
            // Desktop: comportamento original com cache
            this.cache.prevBtn?.addEventListener('click', () => this.prevSlide());
            this.cache.nextBtn?.addEventListener('click', () => this.nextSlide());
            
            // Dots navigation
            this.carouselDots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goToSlide(index));
            });
            
            // Inicializar carrossel no primeiro slide
            this.updateCarousel();
            
            // Touch/Swipe support
            this.setupCarouselSwipe();
        }, 100);
    }
    
    setupMobileVerticalLayout() {
        console.log('📱 Configurando layout vertical para mobile');
        
        // Ocultar controles do carrossel no mobile
        const controls = document.querySelectorAll('.carousel-prev, .carousel-next, .carousel-dots');
        controls.forEach(control => {
            if (control) control.style.display = 'none';
        });
        
        // Modificar estilos do carrossel para layout vertical
        if (this.carouselTrack) {
            this.carouselTrack.style.cssText = `
                display: flex !important;
                flex-direction: column !important;
                width: 100% !important;
                transform: none !important;
                gap: 30px !important;
            `;
            
            // Tornar todos os slides visíveis
            const slides = this.carouselTrack.querySelectorAll('.project-slide');
            slides.forEach((slide, index) => {
                slide.style.cssText = `
                    width: 100% !important;
                    flex-shrink: 0 !important;
                    margin-bottom: 20px !important;
                `;
            });
        }
        
        // Garantir que todos os elementos estejam visíveis no mobile
        this.clearMobileAnimations();
        
        console.log('✅ Layout vertical configurado para mobile');
    }
    
    clearMobileAnimations() {
        if (!this.isMobile) return;
        
        console.log('🧹 Limpando animações no mobile');
        
        // Selecionar todos os elementos que podem ter animações
        const animatedElements = document.querySelectorAll('.project-card, .animate-in, .fade-in-up, .slide-in, .project-slide');
        
        animatedElements.forEach(element => {
            element.style.cssText += `
                opacity: 1 !important;
                animation: none !important;
                transform: none !important;
                filter: none !important;
            `;
        });
        
        // Garantir que todas as seções estejam visíveis
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.cssText += `
                opacity: 1 !important;
                display: block !important;
            `;
        });
        
        console.log('✅ Animações limpas no mobile');
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
    }

    goToSlide(index) {
        if (index >= 0 && index < this.totalSlides) {
            this.currentSlide = index;
            this.updateCarousel();
        }
    }

    updateCarousel() {
        if (this.carouselTrack) {
            // Usar requestAnimationFrame para melhor performance
            requestAnimationFrame(() => {
                // Mover apenas 33.333% por slide, não 100%
                const translateX = -this.currentSlide * 33.333;
                this.carouselTrack.style.transform = `translate3d(${translateX}%, 0, 0)`;
            });
        }
        
        // Atualizar dots
        if (this.carouselDots && this.carouselDots.length > 0) {
            // Primeiro, remover 'active' de todos os dots
            this.carouselDots.forEach(dot => dot.classList.remove('active'));
            
            // Depois, adicionar 'active' apenas no dot atual
            if (this.carouselDots[this.currentSlide]) {
                this.carouselDots[this.currentSlide].classList.add('active');
            }
        }
        
        // Animação dos projetos com RAF
        requestAnimationFrame(() => this.animateProjectSlide());
    }

    animateProjectSlide() {
        const activeSlide = document.querySelector('.project-slide:nth-child(' + (this.currentSlide + 1) + ')');
        if (activeSlide) {
            const elements = activeSlide.querySelectorAll('.project-content > *');
            elements.forEach((el, index) => {
                el.style.setProperty('--animation-delay', index);
                el.classList.add('slide-in');
            });
        }
    }

    setupCarouselSwipe() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        const carousel = document.querySelector('.carousel-container');
        if (!carousel) return;
        
        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });
        
        carousel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        });
        
        carousel.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const diffX = startX - currentX;
            const threshold = 50;
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            isDragging = false;
        });
    }

    // ===== LAZY LOADING DE IMAGENS =====
    setupLazyLoading() {
        // Intersection Observer para lazy loading
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-load');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observar todas as imagens com lazy-load
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ===== FUNCIONALIDADE DE COPIAR EMAIL =====
    setupEmailCopy() {
        const emailLink = document.querySelector('.contact-link[href^="mailto:"]');
        if (!emailLink) return;

        // Adicionar indicação visual que o email é clicável
        emailLink.style.cursor = 'pointer';
        emailLink.title = 'Clique para copiar o email';

        emailLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.copyEmailToClipboard(emailLink.textContent.trim(), e);
        });
    }

    async copyEmailToClipboard(email, event) {
        try {
            await navigator.clipboard.writeText(email);
            this.showCopyNotification('Copiado!', 'success', event);
        } catch (err) {
            // Fallback para navegadores mais antigos
            this.fallbackCopyTextToClipboard(email, event);
        }
    }

    fallbackCopyTextToClipboard(text, event) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showCopyNotification('Copiado!', 'success', event);
            } else {
                this.showCopyNotification('Erro', 'error', event);
            }
        } catch (err) {
            this.showCopyNotification('Erro', 'error', event);
        }

        document.body.removeChild(textArea);
    }

    showCopyNotification(message, type = 'success', event) {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `copy-notification copy-notification--${type}`;
        notification.textContent = message;
        
        // Posicionar no local do clique
        if (event) {
            const rect = event.target.getBoundingClientRect();
            notification.style.position = 'fixed';
            notification.style.left = `${rect.left + rect.width / 2}px`;
            notification.style.top = `${rect.top - 40}px`;
            notification.style.transform = 'translateX(-50%)';
        }
        
        // Adicionar ao body
        document.body.appendChild(notification);
        
        // Mostrar com animação
        setTimeout(() => {
            notification.classList.add('copy-notification--show');
        }, 10);
        
        // Remover após 2 segundos
        setTimeout(() => {
            notification.classList.remove('copy-notification--show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    // ===== ANIMAÇÕES E EFEITOS =====
    
    setupIntersectionObserver() {
        const options = {
            threshold: 0.3,
            rootMargin: '0px 0px -10% 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    this.animateElements(entry.target);
                }
            });
        }, options);
        
        // Observar elementos animáveis
        const animatableElements = document.querySelectorAll(
            '.skill-block, .detail-card, .project-card, .contact-item, .intro-content > *'
        );
        
        animatableElements.forEach(el => {
            this.observer.observe(el);
        });
    }

    animateElements(container) {
        const elements = container.querySelectorAll('*');
        elements.forEach((el, index) => {
            el.style.setProperty('--animation-delay', index);
            el.classList.add('fade-in-up');
        });
    }

    triggerSectionAnimations(section) {
        // Reset previous animations
        const animatedElements = section.querySelectorAll('.animate-in, .fade-in-up');
        animatedElements.forEach(el => {
            el.classList.remove('animate-in', 'fade-in-up');
        });
        
        // Trigger new animations mais rápido
        setTimeout(() => {
            const elements = section.querySelectorAll(
                '.section-title, .intro-content > *, .skill-block, .detail-card, .contact-item'
            );
            
            elements.forEach((el, index) => {
                setTimeout(() => {
                    el.style.setProperty('--animation-delay', index);
                    el.classList.add('animate-in');
                }, index * 40); // Reduzido de 100ms para 40ms para ser mais rápido
            });
        }, 50); // Reduzido de 100ms para 50ms para começar mais cedo
    }

    initializeAnimations() {
        // Adicionar classes CSS para animações - SEM movimento vertical
        const style = document.createElement('style');
        style.textContent = `
            .fade-out {
                opacity: 0;
                transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .animate-in {
                animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                opacity: 0;
            }
            
            .fade-in-up {
                animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                animation-delay: calc(var(--animation-delay, 0) * 0.05s);
                opacity: 0;
            }
            
            .slide-in {
                animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                animation-delay: calc(var(--animation-delay, 0) * 0.08s);
                opacity: 0;
                transform: translateX(30px);
            }
            
            @keyframes fadeIn {
                to {
                    opacity: 1;
                }
            }
            
            @keyframes slideInRight {
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            .section {
                transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .section:not(.active) {
                opacity: 0;
                pointer-events: none;
            }
            
            /* Corrigir para mobile - todas as seções visíveis */
            @media (max-width: 768px) {
                .section:not(.active) {
                    opacity: 1 !important;
                    pointer-events: auto !important;
                }
                
                .section {
                    opacity: 1 !important;
                }
                
                .project-card {
                    opacity: 1 !important;
                }
                
                .animate-in,
                .fade-in-up,
                .slide-in {
                    opacity: 1 !important;
                    animation: none !important;
                }
            }
            
            .carousel-track {
                transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
        `;
        document.head.appendChild(style);
    }

    // ===== EFEITOS DE SCROLL =====
    
    setupScrollEffects() {
        // Efeitos parallax desabilitados para manter foco apenas na navegação por clique
        // A navegação entre seções é feita exclusivamente pelos links do menu
        
        // Função disponível para efeitos futuros se necessário
        // let ticking = false;
        
        // const handleScroll = () => {
        //     if (!ticking) {
        //         requestAnimationFrame(() => {
        //             this.updateParallaxEffects();
        //             ticking = false;
        //         });
        //         ticking = true;
        //     }
        // };
        
        // Scroll effects removidos - navegação apenas por clique
        // document.addEventListener('wheel', handleScroll, { passive: true });
    }

    updateParallaxEffects() {
        const scrollY = window.scrollY;
        
        // Efeito parallax sutil no sidebar
        if (this.sidebar && !this.isMobile) {
            const parallaxOffset = scrollY * 0.1;
            this.sidebar.style.transform = `translateY(${parallaxOffset}px)`;
        }
        
        // Efeito de profundidade nos elementos
        const parallaxElements = document.querySelectorAll('.zen-decoration, .brush-stroke');
        parallaxElements.forEach((el, index) => {
            const speed = 0.2 + (index * 0.1);
            const yPos = -(scrollY * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    }

    // ===== TOUCH EVENTS =====
    
    setupTouchEvents() {
        // Touch events para navegação entre seções removidos
        // A navegação é feita exclusivamente pelos links do menu
        
        // Swipe gestures desabilitados para manter foco na navegação por clique
        // Os touch events do carrossel são mantidos em setupCarouselSwipe()
        
        console.log('📱 Touch navigation desabilitado - use os links do menu');
    }

    // ===== MOBILE SCROLL NAVIGATION =====
    
    setupMobileScrollNavigation() {
        if (!this.isMobile) return;
        
        console.log('📱 Configurando scroll contínuo para mobile...');
        
        // Permitir scroll natural removendo a prevenção
        document.body.style.overflow = 'auto';
        
        // Limpar animações para garantir visibilidade
        setTimeout(() => {
            this.clearMobileAnimations();
        }, 100);
        
        // Detectar qual seção está visível durante o scroll
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            if (!this.isMobile) return;
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateActiveByScroll();
            }, 100);
        }, { passive: true });
        
        console.log('✅ Scroll contínuo configurado para mobile');
    }
    
    updateActiveByScroll() {
        const sections = document.querySelectorAll('.section');
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        
        let activeSection = null;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            const sectionBottom = sectionTop + rect.height;
            
            if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
                activeSection = section.id;
            }
        });
        
        if (activeSection && activeSection !== this.currentSection) {
            console.log(`� Seção visível: ${activeSection}`);
            this.currentSection = activeSection;
            this.updateActiveNavigation();
        }
    }
    
    getNextSection() {
        const currentIndex = this.sections.indexOf(this.currentSection);
        return currentIndex < this.sections.length - 1 ? this.sections[currentIndex + 1] : null;
    }
    
    getPreviousSection() {
        const currentIndex = this.sections.indexOf(this.currentSection);
        return currentIndex > 0 ? this.sections[currentIndex - 1] : null;
    }

    // ===== RESPONSIVIDADE =====
    
    updateMobileStatus() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (!this.isMobile && this.isMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Configurar overflow baseado no dispositivo
        if (this.isMobile) {
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
            console.log('📱 Mobile: scroll contínuo ativado');
        } else {
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
            console.log('🖥️ Desktop: scroll permitido');
        }
        
        // Se mudou de desktop para mobile ou vice-versa, reconfigurar navegação
        if (wasMobile !== this.isMobile) {
            if (this.isMobile) {
                console.log('📱 Mudou para mobile - ativando scroll navigation');
                this.setupMobileScrollNavigation();
                this.setupMobileVerticalLayout();
            } else {
                console.log('🖥️ Mudou para desktop - navegação por menu');
                this.setupCarousel(); // Reconfigurar carrossel para desktop
            }
        }
    }

    ensureMobileMenuClosed() {
        // Garantir que o menu mobile inicie sempre fechado
        this.isMenuOpen = false;
        this.mobileToggle?.classList.remove('active');
        this.sidebar?.classList.remove('mobile-open');
        this.mobileOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.updateMobileStatus();
        
        if (wasMobile !== this.isMobile) {
            // Transição de mobile para desktop ou vice-versa
            this.reinitializeLayout();
        }
    }

    reinitializeLayout() {
        // Limpar animações
        document.querySelectorAll('.animate-in, .fade-in-up').forEach(el => {
            el.classList.remove('animate-in', 'fade-in-up');
        });
        
        // Reconfigurar observadores
        if (this.observer) {
            this.observer.disconnect();
            this.setupIntersectionObserver();
        }
        
        // Retriggear animações da seção atual
        const currentSectionEl = document.getElementById(this.currentSection);
        if (currentSectionEl) {
            setTimeout(() => this.triggerSectionAnimations(currentSectionEl), 50);
        }
    }

    // ===== UTILITÁRIOS =====
    
    trackSectionView(sectionName) {
        // Analytics tracking
        if (window.gtag) {
            gtag('event', 'page_view', {
                page_title: `Portfolio - ${sectionName}`,
                page_location: `#${sectionName}`
            });
        }
        
        console.log(`📍 Navegou para: ${sectionName}`);
    }

    // ===== API PÚBLICA =====
    
    // Método público para navegação externa
    navigateTo(section) {
        this.setActiveSection(section);
    }
    
    // Método público para obter seção atual
    getCurrentSection() {
        return this.currentSection;
    }
    
    // Método público para verificar se é mobile
    isMobileDevice() {
        return this.isMobile;
    }
}

// ===== FUNCIONALIDADES ADICIONAIS =====

/**
 * Sistema de performance e otimização
 */
class PerformanceManager {
    constructor() {
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }
    
    init() {
        this.respectMotionPreferences();
        this.optimizeImages();
        this.preloadCriticalResources();
    }
    
    respectMotionPreferences() {
        if (this.isReducedMotion) {
            document.documentElement.style.setProperty('--transition-speed', '0.1s');
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
        }
    }
    
    optimizeImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    preloadCriticalResources() {
        // Preload de recursos críticos
        const criticalResources = [
            'assets/css/style.css',
            'assets/images/icon-python.svg'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'image';
            document.head.appendChild(link);
        });
    }
}

/**
 * Sistema de tema e personalização
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'sumi-e';
        this.themes = {
            'sumi-e': {
                name: 'Sumi-e Original',
                colors: {
                    primary: '#1a1a1a',
                    accent: '#c53030'
                }
            }
        };
    }
    
    applyTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            const theme = this.themes[themeName];
            
            Object.entries(theme.colors).forEach(([key, value]) => {
                document.documentElement.style.setProperty(`--theme-${key}`, value);
            });
        }
    }
}

/**
 * Sistema de notificações e feedback
 */
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = this.createContainer();
    }
    
    createContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }
    
    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            background: var(--ink-black);
            color: var(--paper-white);
            padding: 12px 20px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
        `;
        
        this.container.appendChild(notification);
        
        // Animação de entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto-remover
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
}

// ===== INICIALIZAÇÃO =====

// Aguarda o DOM estar carregado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistemas
    window.SumieSidebar = new SumieSidebar();
    window.PerformanceManager = new PerformanceManager();
    window.ThemeManager = new ThemeManager();
    window.NotificationManager = new NotificationManager();
    
    // Configuração global de erro
    window.addEventListener('error', (e) => {
        console.error('❌ Erro no portfólio:', e.error);
        window.NotificationManager?.show('Ops! Algo deu errado.', 'error');
    });
    
    console.log('🎌 Portfólio Sumi-e totalmente carregado!');
});

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registrado:', registration);
            })
            .catch(registrationError => {
                console.log('SW falhou:', registrationError);
            });
    });
}