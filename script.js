document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
        apiKey: "AIzaSyAnhGdb0T9gDcK5l9g4l_ESj3e7OKIOK8Q",
        authDomain: "file-de5e4.firebaseapp.com",
        projectId: "file-de5e4",
        storageBucket: "file-de5e4.firebasestorage.app",
        messagingSenderId: "393267437288",
        appId: "1:393267437288:web:8bf7c94db437a61f34335d",
        measurementId: "G-PDJ0L5WE4R"
    };

    firebase.initializeApp(firebaseConfig);
    
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    const themeToggle = document.querySelector('.theme-toggle');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authContainer = document.getElementById('auth-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const usernameDisplay = document.getElementById('username-display');
    const selectFileBtn = document.getElementById('select-file-btn');
    const clipboardBtn = document.getElementById('clipboard-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const fileSection = document.getElementById('file-section');
    const clipboardSection = document.getElementById('clipboard-section');
    const fileUpload = document.getElementById('file-upload');
    const uploadArea = document.querySelector('.upload-area');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.getElementById('upload-progress');
    const progressText = document.getElementById('progress-text');
    const filesList = document.getElementById('files-list');

    let currentUser = null;

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            const icon = themeToggle.querySelector('i');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }

    function initApp() {
        loadTheme();
        
        auth.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                fetchUserProfile();
                showDashboard();
            } else {
                authContainer.style.display = 'block';
                dashboardContainer.style.display = 'none';
            }
        });
    }

    function fetchUserProfile() {
        db.collection('users').doc(currentUser.uid).get()
            .then(doc => {
                if (!doc.exists) {
                    const displayName = currentUser.email.split('@')[0];
                    db.collection('users').doc(currentUser.uid).set({
                        username: displayName,
                        email: currentUser.email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    usernameDisplay.textContent = displayName;
                } else {
                    usernameDisplay.textContent = doc.data().username;
                }
            });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.style.display = 'none';
            });
            
            document.getElementById(tabId).style.display = 'block';
        });
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                alert(error.message);
            });
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                return db.collection('users').doc(userCredential.user.uid).set({
                    username: username,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .catch(error => {
                alert(error.message);
            });
    });

    function showDashboard() {
        authContainer.style.display = 'none';
        dashboardContainer.style.display = 'flex';
    }

    function setActiveSection(btn, section) {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.section-container').forEach(s => {
            s.style.display = 'none';
        });
        
        section.style.display = 'block';
    }

    selectFileBtn.addEventListener('click', () => {
        setActiveSection(selectFileBtn, fileSection);
    });

    clipboardBtn.addEventListener('click', () => {
        setActiveSection(clipboardBtn, clipboardSection);
    });

    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#6c63ff';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        
        if (e.dataTransfer.files.length) {
            console.log('Files dropped:', e.dataTransfer.files);
        }
    });

    fileUpload.addEventListener('change', () => {
        if (fileUpload.files.length) {
            console.log('Files selected:', fileUpload.files);
        }
    });

    initApp();
});