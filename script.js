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
    
    // --- Efek Animasi Partikel di Background (Ambient Floating Particles) ---
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray = [];

    const mouse = {
        x: null,
        y: null,
        radius: 120
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    function getParticleRGB() {
        const color = getComputedStyle(document.documentElement).getPropertyValue('--primary-accent').trim();
        const tempCtx = document.createElement('canvas').getContext('2d');
        tempCtx.fillStyle = color;
        const hex = tempCtx.fillStyle;
        const r = parseInt(hex.slice(1, 3), 16) || 0;
        const g = parseInt(hex.slice(3, 5), 16) || 229;
        const b = parseInt(hex.slice(5, 7), 16) || 255;
        return { r, g, b };
    }

    class Particle {
        constructor(x, y, directionX, directionY, size) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.alpha = (Math.random() * 0.35) + 0.15;
            this.alphaSpeed = (Math.random() * 0.008) + 0.002;
        }

        draw() {
            const { r, g, b } = getParticleRGB();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
            ctx.fill();
        }

        update() {
            // Efek bernapas lembut (twinkling)
            this.alpha += this.alphaSpeed;
            if (this.alpha > 0.5 || this.alpha < 0.12) {
                this.alphaSpeed = -this.alphaSpeed;
            }

            // Gerakan mengambang perlahan
            this.x += this.directionX;
            this.y += this.directionY;

            // Membungkus layar dengan mulus
            if (this.x > canvas.width + 10) this.x = -10;
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.y > canvas.height + 10) this.y = -10;
            if (this.y < -10) this.y = canvas.height + 10;

            // Reaksi halus terhadap kursor (tanpa garis yang berantakan)
            if (mouse.x != null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.x -= Math.cos(angle) * force * 1.8;
                    this.y -= Math.sin(angle) * force * 1.8;
                }
            }

            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        const numberOfParticles = Math.floor((canvas.height * canvas.width) / 16000);
        for (let i = 0; i < numberOfParticles; i++) {
            const size = (Math.random() * 1.6) + 0.8;
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const directionX = (Math.random() * 0.25) - 0.125;
            const directionY = (Math.random() * 0.25) - 0.125;
            particlesArray.push(new Particle(x, y, directionX, directionY, size));
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
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

    // --- Logika Modal Detail Proyek ---
    const modal = document.getElementById('project-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalFeaturesContainer = document.getElementById('modal-features-container');
    const modalTags = document.getElementById('modal-tags');
    let currentOpenCard = null;

    function openModal(card) {
        if (!modal) return;
        currentOpenCard = card;
        const img = card.querySelector('.project-img');
        const title = card.querySelector('.project-content h4')?.textContent || '';
        const desc = card.querySelector('.project-desc')?.textContent || '';
        const features = card.querySelector('.project-features');
        const tags = card.querySelector('.project-tags')?.innerHTML || '';

        const imgSrc = img?.getAttribute('src') || '';
        if (imgSrc && !imgSrc.endsWith('.html') && !imgSrc.endsWith('/')) {
            modalImg.src = imgSrc;
            modalImg.alt = img.getAttribute('alt') || title;
            modalImg.parentElement.style.display = 'flex';
        } else {
            modalImg.parentElement.style.display = 'none';
        }

        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modalFeaturesContainer.innerHTML = features ? features.innerHTML : '';
        modalTags.innerHTML = tags;

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        currentOpenCard = null;
    }

    document.querySelectorAll('.btn-project-detail').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            if (card) openModal(card);
        });
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // --- Sistem Terjemahan Multi-Bahasa (ID & EN) ---
    const translations = {
        id: {
            hero_role: "Full-Stack Developer",
            hero_bio: "Lulusan D3 Teknik Informatika PENS dengan keahlian dalam rekayasa web full-stack dan aplikasi mobile. Berfokus pada pembangunan sistem yang skalabel, arsitektur bersih, dan pengalaman pengguna yang intuitif.",
            hero_contact: "Hubungi Saya",
            hero_exp: "Lihat Pengalaman",
            sec_languages: "Bahasa Pemrograman",
            sec_frameworks: "Framework & Library",
            sec_databases: "Database",
            sec_projects: "Proyek Pemrograman",
            sec_experience: "Pengalaman Kerja",
            sec_education: "Riwayat Pendidikan",
            btn_project_detail: "Detail Proyek",
            modal_tech_label: "Teknologi:",
            // Projects
            proj1_desc: "Platform manajemen operasional digital yang dirancang khusus untuk menyederhanakan proses bisnis percetakan, mulai dari penerimaan pesanan hingga pengiriman akhir.",
            proj1_features: `<h5>Fitur Utama:</h5>
<ul>
  <li><strong>Penerimaan Pesanan:</strong> Kelola dan lacak setiap pesanan pelanggan dari awal hingga akhir.</li>
  <li><strong>Estimasi Harga Otomatis:</strong> Hitung perkiraan biaya cetak berdasarkan spesifikasi pesanan dengan cepat.</li>
  <li><strong>Pelacakan Status Produksi:</strong> Berikan transparansi kepada pelanggan mengenai status pengerjaan pesanan mereka.</li>
  <li><strong>Katalog Layanan Digital:</strong> Tampilkan detail layanan cetak digital dan offset secara terorganisir.</li>
  <li><strong>Manajemen Pelanggan (CRM):</strong> Simpan dan kelola data pelanggan untuk membangun hubungan yang lebih baik.</li>
</ul>`,
            proj2_desc: "Platform manajemen produktivitas harian komprehensif yang terdiri dari aplikasi mobile cross-platform dinamis dan didukung oleh arsitektur backend API yang tangguh serta skalabel.",
            proj2_features: `<h5>Fitur Utama:</h5>
<ul>
  <li><strong>Manajemen Tugas & Waktu:</strong> Fitur To-Do List dan Timer Pomodoro terintegrasi untuk memaksimalkan fokus pengguna.</li>
  <li><strong>Sistem Autentikasi Aman:</strong> Dilengkapi API khusus untuk registrasi dan login guna menjaga keamanan data pengguna.</li>
  <li><strong>Sistem Notifikasi Terpusat:</strong> Dukungan backend untuk mengelola dan mengirimkan notifikasi aktivitas atau pengingat secara real-time.</li>
  <li><strong>Integrasi Kalender & Mode Gelap:</strong> Pemantauan jadwal yang mudah dibaca dengan antarmuka yang mendukung Dark Mode.</li>
  <li><strong>Arsitektur Backend Skalabel:</strong> Backend dibangun menggunakan arsitektur layered (Controllers, Services, Repositories) dan terintegrasi dengan Docker untuk kemudahan deployment.</li>
</ul>`,
            proj3_desc: "Platform manajemen program tahfizh berbasis web yang memudahkan pencatatan, pemantauan progres hafalan, serta evaluasi siswa secara digital dan terstruktur.",
            proj3_features: `<h5>Fitur Utama:</h5>
<ul>
  <li><strong>Pencatatan Hafalan & Murojaah:</strong> Lacak progres setoran hafalan harian dan pengulangan (murojaah) siswa dengan mudah.</li>
  <li><strong>Sistem Multi-Peran (Role-Based):</strong> Hak akses yang disesuaikan untuk Admin, Pengajar, dan Siswa untuk pengelolaan yang terpusat.</li>
  <li><strong>Manajemen Data Siswa:</strong> Kelola informasi profil dan riwayat akademik siswa tahfizh dalam satu dasbor.</li>
  <li><strong>Sistem Autentikasi Aman:</strong> Dilengkapi dengan sistem login (berbasis sesi/token) dan perlindungan middleware untuk menjaga privasi data.</li>
  <li><strong>Antarmuka Responsif:</strong> Desain UI/UX yang modern dan mudah digunakan, baik dari perangkat desktop maupun mobile.</li>
</ul>`,
            proj4_desc: "Aplikasi web yang dirancang untuk membantu pengguna melacak dan memantau kondisi kesejahteraan mental mereka melalui sistem evaluasi berbasis data.",
            proj4_features: `<h5>Fitur Utama:</h5>
<ul>
  <li><strong>Pemantauan & Evaluasi:</strong> Pengguna dapat melakukan pencatatan dan evaluasi rutin terkait kondisi kesehatan mental mereka.</li>
  <li><strong>Dasbor Profil & Hasil:</strong> Halaman khusus bagi pengguna untuk mengelola profil dan melihat riwayat hasil evaluasi sebelumnya dengan jelas.</li>
  <li><strong>Pengolahan Dataset:</strong> Terintegrasi dengan sistem backend untuk mengelola dataset guna menghasilkan analisis data yang relevan.</li>
  <li><strong>Arsitektur Client-Server:</strong> Dibangun menggunakan pemisahan frontend dan backend yang terstruktur untuk memastikan performa aplikasi yang optimal.</li>
</ul>`,
            proj5_desc: "Aplikasi konseling digital untuk sekolah yang memudahkan guru Bimbingan Konseling (BK) dan siswa dalam menjalankan proses bimbingan, konsultasi, serta pengembangan diri secara modern dan efisien.",
            proj5_features: `<h5>Fitur Utama:</h5>
<ul>
  <li><strong>Dasbor Layanan & Manajemen Siswa:</strong> Pusat kendali bagi guru BK untuk mengelola data siswa, jadwal konseling, dan melacak laporan perkembangan secara terpusat.</li>
  <li><strong>Konseling Jarak Jauh (Chat & Video Call):</strong> Fitur komunikasi real-time dan panggilan video yang terintegrasi untuk sesi konsultasi online.</li>
  <li><strong>Booking Jadwal Otomatis:</strong> Memungkinkan siswa untuk memesan jadwal konsultasi secara mandiri tanpa perlu mengantre.</li>
  <li><strong>Edukasi Mandiri & Modul Assessment:</strong> Menyediakan materi pengembangan diri, literasi digital, serta sistem bagi guru untuk memberikan tugas dan evaluasi (assessment).</li>
  <li><strong>Catatan Riwayat & Rekomendasi Layanan:</strong> Sistem pencatatan riwayat komprehensif (prestasi hingga masalah siswa) yang didukung dengan rekomendasi layanan otomatis sesuai kebutuhan siswa.</li>
</ul>`,
            proj6_desc: "Platform Enterprise Resource Planning (ERP) dan Human Resource (HR) komprehensif berbasis web yang dirancang untuk mengelola administrasi, data karyawan, dan operasional internal. Sistem ini menggabungkan antarmuka frontend yang modern dengan arsitektur backend yang tangguh dan terstruktur.",
            proj6_features: `<h5>Fitur Utama:</h5>
<ul>
  <li><strong>Manajemen Penggajian & Kehadiran:</strong> Sistem terintegrasi untuk melacak data kehadiran (attendance) dan mengkalkulasi rincian gaji (payroll) karyawan secara presisi.</li>
  <li><strong>Dasbor & Manajemen Proyek:</strong> Pusat kendali operasional (dasbor) untuk memantau aktivitas perusahaan serta modul khusus untuk manajemen layanan proyek.</li>
  <li><strong>Sistem Manajemen Dokumen:</strong> Fasilitas penanganan berkas (file uploads) yang efisien dan terhubung langsung ke penyimpanan server terpusat.</li>
  <li><strong>Keamanan & Autentikasi:</strong> Mengamankan akses pengguna dengan sistem login berbasis enkripsi hash (Bcrypt) untuk melindungi data internal perusahaan.</li>
  <li><strong>Arsitektur Fullstack Skalabel:</strong> Frontend yang cepat dan responsif dibangun menggunakan Next.js, didukung oleh backend berskala enterprise menggunakan NestJS, Prisma ORM, dan infrastruktur Docker.</li>
</ul>`,
            // Experience
            exp1_role: "Full-Stack Developer",
            exp1_date: "Agustus 2024 - Sekarang",
            exp1_desc: "Mengembangkan solusi web end-to-end (frontend & backend), merancang integrasi API, serta mengoptimalkan performa dan keandalan sistem aplikasi produksi.",
            exp2_role: "Front-End Developer",
            exp2_date: "Januari 2022 - Februari 2024",
            exp2_desc: "Mengembangkan antarmuka dan sistem informasi sekolah serta membangun struktur fundamental dalam pengembangan aplikasi web modern.",
            // Education
            edu1_degree: "D3 Teknik Informatika",
            edu1_date: "2023 - 2026 • Lulus (Wisuda 17 Oktober 2026)",
            edu1_desc: "Telah menyelesaikan studi D3 Teknik Informatika dengan fokus pada rekayasa perangkat lunak web dan mobile. Aktif dalam pengembangan proyek aplikasi produksi serta kolaborasi tim.",
            edu2_degree: "Multimedia & Rekayasa Perangkat Lunak",
            edu2_desc: "Mewakili LKS Jatim bidang IT Software Application, Juara 1 Film Pendek Galasinema, serta mendalami dasar pemrograman dan multimedia.",
            // Footer
            footer_text: "© 2026 Ragil Ridho Saputra. Dirancang & dibangun dengan dedikasi dan performa tinggi."
        },
        en: {
            hero_role: "Full-Stack Developer",
            hero_bio: "Computer Engineering graduate from PENS specializing in full-stack web and mobile development. Focused on building scalable systems, clean architecture, and intuitive user experiences.",
            hero_contact: "Contact Me",
            hero_exp: "View Experience",
            sec_languages: "Programming Languages",
            sec_frameworks: "Frameworks & Libraries",
            sec_databases: "Databases",
            sec_projects: "Featured Projects",
            sec_experience: "Work Experience",
            sec_education: "Education",
            btn_project_detail: "Project Details",
            modal_tech_label: "Technologies:",
            // Projects
            proj1_desc: "A digital operational management platform designed to streamline printing business workflows, from order intake to final dispatch.",
            proj1_features: `<h5>Key Features:</h5>
<ul>
  <li><strong>Order Management:</strong> Manage and track customer orders end-to-end with real-time status updates.</li>
  <li><strong>Automated Price Estimation:</strong> Instantly calculate printing costs based on custom job specifications.</li>
  <li><strong>Production Tracking:</strong> Provide customers with transparent, live progress on their print jobs.</li>
  <li><strong>Digital Service Catalog:</strong> Display organized digital and offset printing service options.</li>
  <li><strong>Customer Management (CRM):</strong> Organize customer data and order history to foster long-term relationships.</li>
</ul>`,
            proj2_desc: "A comprehensive daily productivity platform featuring a dynamic cross-platform mobile app powered by a robust, scalable backend API.",
            proj2_features: `<h5>Key Features:</h5>
<ul>
  <li><strong>Task & Time Management:</strong> Integrated To-Do lists and Pomodoro timer to maximize user focus.</li>
  <li><strong>Secure Authentication:</strong> Dedicated APIs for registration and authentication to safeguard user data.</li>
  <li><strong>Centralized Notification System:</strong> Backend support to manage and dispatch real-time activity reminders.</li>
  <li><strong>Calendar & Dark Mode:</strong> Intuitive schedule monitoring with seamless Dark Mode support.</li>
  <li><strong>Scalable Backend Architecture:</strong> Built with a layered architecture (Controllers, Services, Repositories) and Dockerized for streamlined deployment.</li>
</ul>`,
            proj3_desc: "A web-based Quran memorization (Tahfizh) management platform facilitating digital tracking, progress monitoring, and structured student evaluations.",
            proj3_features: `<h5>Key Features:</h5>
<ul>
  <li><strong>Memorization & Revision Tracking:</strong> Log daily student recitations and revision (murojaah) with ease.</li>
  <li><strong>Role-Based Access Control:</strong> Tailored permissions for Admins, Instructors, and Students.</li>
  <li><strong>Student Data Management:</strong> Centralized dashboard for managing student profiles and academic milestones.</li>
  <li><strong>Secure Authentication:</strong> Session/token-based login protected by middleware for data confidentiality.</li>
  <li><strong>Responsive UI:</strong> Clean, modern interface optimized for desktop, tablet, and mobile devices.</li>
</ul>`,
            proj4_desc: "A web application designed to help individuals track and monitor their mental well-being through data-driven evaluations.",
            proj4_features: `<h5>Key Features:</h5>
<ul>
  <li><strong>Monitoring & Self-Assessment:</strong> Allows users to log routine mental health evaluations and insights.</li>
  <li><strong>Profile & Results Dashboard:</strong> Dedicated space for users to manage profiles and review historical assessment outcomes.</li>
  <li><strong>Dataset Processing:</strong> Integrated with backend data processing to analyze patterns and generate meaningful insights.</li>
  <li><strong>Client-Server Architecture:</strong> Engineered with a decoupled frontend and backend for optimal performance and maintainability.</li>
</ul>`,
            proj5_desc: "A digital school counseling platform enabling guidance counselors and students to conduct consultations, progress tracking, and personal development efficiently.",
            proj5_features: `<h5>Key Features:</h5>
<ul>
  <li><strong>Counselor Dashboard & Student Management:</strong> Centralized hub for counselors to manage student records, session schedules, and progress reports.</li>
  <li><strong>Remote Counseling (Chat & Video Call):</strong> Integrated real-time messaging and video conferencing for virtual consultations.</li>
  <li><strong>Automated Appointment Booking:</strong> Enables students to schedule appointments independently without queuing.</li>
  <li><strong>Self-Paced Learning & Assessments:</strong> Provides personal growth materials, digital literacy guides, and evaluation tools.</li>
  <li><strong>Comprehensive Case History:</strong> In-depth tracking of student achievements and challenges, paired with automated counseling recommendations.</li>
</ul>`,
            proj6_desc: "A comprehensive web-based Enterprise Resource Planning (ERP) and Human Resource (HR) platform designed to manage administration, employee records, and internal operations. Combines a modern frontend with a robust, enterprise-grade backend architecture.",
            proj6_features: `<h5>Key Features:</h5>
<ul>
  <li><strong>Payroll & Attendance Management:</strong> Integrated system to track employee attendance and calculate payroll details with high precision.</li>
  <li><strong>Dashboard & Project Management:</strong> Operational command center to monitor company activities paired with dedicated project service modules.</li>
  <li><strong>Document Management System:</strong> Efficient file upload and document handling connected directly to centralized server storage.</li>
  <li><strong>Security & Authentication:</strong> Secure user access with Bcrypt hash encryption to safeguard sensitive enterprise data.</li>
  <li><strong>Scalable Full-Stack Architecture:</strong> High-performance Next.js frontend powered by an enterprise-grade NestJS backend, Prisma ORM, and Docker infrastructure.</li>
</ul>`,
            // Experience
            exp1_role: "Full-Stack Developer",
            exp1_date: "August 2024 - Present",
            exp1_desc: "Developing end-to-end web solutions (frontend & backend), architecting API integrations, and optimizing system performance and reliability for production applications.",
            exp2_role: "Front-End Developer",
            exp2_date: "January 2022 - February 2024",
            exp2_desc: "Developed user interfaces and school information systems while establishing foundational web development practices.",
            // Education
            edu1_degree: "Associate Degree in Computer Engineering",
            edu1_date: "2023 - 2026 • Graduated (Commencement Oct 17, 2026)",
            edu1_desc: "Completed studies in Computer Engineering with emphasis on web and mobile software engineering. Actively involved in production-ready projects and collaborative engineering.",
            edu2_degree: "Multimedia & Software Engineering",
            edu2_desc: "Competed in the East Java IT Software Application Student Competency Competition (LKS), 1st Place in Galasinema Short Film, focused on web development and multimedia fundamentals.",
            // Footer
            footer_text: "© 2026 Ragil Ridho Saputra. Designed & built with dedication and high performance."
        }
    };

    function setLanguage(lang) {
        if (!translations[lang]) return;
        document.documentElement.lang = lang;
        localStorage.setItem('preferred_lang', lang);

        // Update active class pada tombol switcher
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const isActive = btn.getAttribute('data-lang') === lang;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        // Update semua elemen teks bertanda data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key] !== undefined) {
                el.textContent = translations[lang][key];
            }
        });

        // Update semua elemen HTML bertanda data-i18n-html
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (translations[lang][key] !== undefined) {
                el.innerHTML = translations[lang][key];
            }
        });

        // Jika modal sedang terbuka, perbarui konten modalnya juga
        if (modal && modal.classList.contains('active') && currentOpenCard) {
            openModal(currentOpenCard);
        }
    }

    // Pasang event listener pada tombol switcher bahasa
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            setLanguage(lang);
        });
    });

    // Deteksi bahasa awal:
    // 1. Cek parameter URL (?lang=en atau ?lang=id)
    // 2. Cek localStorage
    // 3. Default ke 'id'
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang')?.toLowerCase();
    const savedLang = localStorage.getItem('preferred_lang');

    if (urlLang === 'en' || urlLang === 'id') {
        setLanguage(urlLang);
    } else if (savedLang === 'en' || savedLang === 'id') {
        setLanguage(savedLang);
    } else {
        setLanguage('id');
    }
});