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
    const MAX_CHUNK_SIZE = 900000;

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
        
        loadFiles();
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
            handleFiles(e.dataTransfer.files);
        }
    });

    fileUpload.addEventListener('change', () => {
        if (fileUpload.files.length) {
            handleFiles(fileUpload.files);
        }
    });

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            uploadFileInChunks(file);
        });
    }

    function uploadFileInChunks(file) {
        const reader = new FileReader();
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        progressText.textContent = '0%';

        reader.onload = async (e) => {
            const fileData = e.target.result;
            const totalChunks = Math.ceil(fileData.length / MAX_CHUNK_SIZE);
            
            const fileMetadata = {
                name: file.name,
                type: file.type,
                size: file.size,
                totalChunks: totalChunks,
                dateAdded: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            try {
                const fileRef = await db.collection('users').doc(currentUser.uid)
                    .collection('files').add(fileMetadata);
                
                for (let i = 0; i < totalChunks; i++) {
                    const start = i * MAX_CHUNK_SIZE;
                    const end = Math.min(fileData.length, start + MAX_CHUNK_SIZE);
                    const chunk = fileData.slice(start, end);
                    
                    await db.collection('users').doc(currentUser.uid)
                        .collection('fileChunks').doc(`${fileRef.id}_${i}`)
                        .set({
                            fileId: fileRef.id,
                            chunkIndex: i,
                            data: chunk,
                            dateAdded: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    
                    const progress = Math.min(100, Math.round(((i + 1) / totalChunks) * 100));
                    progressBar.style.width = `${progress}%`;
                    progressText.textContent = `${progress}%`;
                }
                
                alert(`File ${file.name} uploaded successfully!`);
                progressContainer.style.display = 'none';
                loadFiles();
            } catch (error) {
                alert(`Error uploading file: ${error.message}`);
                progressContainer.style.display = 'none';
            }
        };
        
        reader.readAsDataURL(file);
    }

    async function loadFiles() {
    if (!currentUser) return;
    
    try {
        const filesSnapshot = await db.collection('users').doc(currentUser.uid)
            .collection('files')
            .orderBy('dateAdded', 'desc')
            .get();
        
        filesList.innerHTML = '';
        
        if (filesSnapshot.empty) {
            filesList.innerHTML = '<div class="empty-message">No files uploaded yet</div>';
            return;
        }
        
        filesSnapshot.forEach(doc => {
            const fileData = doc.data();
            const fileId = doc.id;
            
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item glass-effect';
            
            let fileIcon = 'fa-file';
            if (fileData.type.includes('image')) {
                fileIcon = 'fa-file-image';
            } else if (fileData.type.includes('pdf')) {
                fileIcon = 'fa-file-pdf';
            } else if (fileData.type.includes('word')) {
                fileIcon = 'fa-file-word';
            } else if (fileData.type.includes('excel') || fileData.type.includes('sheet')) {
                fileIcon = 'fa-file-excel';
            } else if (fileData.type.includes('video')) {
                fileIcon = 'fa-file-video';
            } else if (fileData.type.includes('audio')) {
                fileIcon = 'fa-file-audio';
            } else if (fileData.type.includes('zip') || fileData.type.includes('archive')) {
                fileIcon = 'fa-file-archive';
            } else if (fileData.type.includes('code') || fileData.type.includes('javascript') || fileData.type.includes('html')) {
                fileIcon = 'fa-file-code';
            }
            
            const date = fileData.dateAdded ? new Date(fileData.dateAdded.toDate()) : new Date();
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
            });
            
            const fileSizeMB = (fileData.size / (1024 * 1024)).toFixed(2);
            
            fileElement.innerHTML = `
                <div class="file-icon">
                    <i class="fas ${fileIcon}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${fileData.name}</div>
                    <div class="file-meta">${fileSizeMB} MB · ${formattedDate}</div>
                </div>
                <div class="file-actions">
                    <button class="download-btn" data-file-id="${fileId}">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="delete-btn" data-file-id="${fileId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            filesList.appendChild(fileElement);
        });
    } catch (error) {
        console.error('Error loading files:', error);
        filesList.innerHTML = '<div class="error-message">Error loading files</div>';
    }
}

    initApp();
});