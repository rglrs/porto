document.addEventListener('DOMContentLoaded', () => {

    // --- Logika untuk Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Mencegah lompatan langsung

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // --- Efek Animasi Partikel di Background ---
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray;

    const mouse = {
        x: null,
        y: null,
        radius: (canvas.height / 120) * (canvas.width / 120)
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    // Mendapatkan warna aksen dari variabel CSS
    function getParticleColor() {
        const color = getComputedStyle(document.documentElement).getPropertyValue('--primary-accent').trim();
        // Mengubah warna hex/named ke RGBA untuk opacity
        const tempCtx = document.createElement('canvas').getContext('2d');
        tempCtx.fillStyle = color;
        const hex = tempCtx.fillStyle;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.5)`;
    }

    class Particle {
        constructor(x, y, directionX, directionY, size) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = getParticleColor();
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) this.x += 5;
                if (mouse.x > this.x && this.x > this.size * 10) this.x -= 5;
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) this.y += 5;
                if (mouse.y > this.y && this.y > this.size * 10) this.y -= 5;
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            particlesArray.push(new Particle(x, y, directionX, directionY, size));
        }
    }

    function connect() {
        let opacityValue = 1;
        const lineColor = getParticleColor().replace('0.5', '1'); // Gunakan opacity penuh
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                               ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = lineColor.replace('1', opacityValue);
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }

    window.addEventListener('resize', () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        mouse.radius = (canvas.height / 120) * (canvas.width / 120);
        init();
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    init();
    animate();

    // --- Logika Light/Dark Mode ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Fungsi untuk menerapkan tema
    function applyTheme(theme) {
        if (theme === 'light') {
            body.classList.add('light-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('light-mode');
            themeToggle.checked = false;
        }
        // Re-inisialisasi partikel agar warnanya update
        init();
    }

    // Cek tema yang tersimpan di localStorage saat halaman dimuat
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    // Event listener untuk tombol toggle
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // --- Efek Animasi Saat Scroll ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
});