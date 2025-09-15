document.addEventListener('DOMContentLoaded', function() {
    // Funções para gerenciar o estado do login
    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const showLoginHeader = document.getElementById('show-login-header');
        const profileLink = document.getElementById('profile-link');
        const headerProfilePic = document.getElementById('header-profile-pic');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (showLoginHeader && profileLink) {
            if (isLoggedIn && currentUser) {
                showLoginHeader.style.display = 'none';
                profileLink.style.display = 'block';
                const storedPic = currentUser.profilePicUrl || "https://via.placeholder.com/40/e0e6ed/7f8c8d?text=User";
                if (headerProfilePic) {
                    headerProfilePic.src = storedPic;
                }
            } else {
                showLoginHeader.style.display = 'block';
                profileLink.style.display = 'none';
            }
        }
    }

    // Lógica de login (executada apenas em page1.html)
    const loginBtn = document.getElementById('form-login');
    if (loginBtn) {
        loginBtn.addEventListener('submit', function(event) {
            event.preventDefault(); 
            
            const usernameInput = document.getElementById('log-username').value;
            const passwordInput = document.getElementById('log-password').value;
            const logMessage = document.getElementById('log-message');

            const allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
            const userFound = allUsers.find(user => user.username === usernameInput && user.password === passwordInput);

            if (userFound) {
                // Salva a conta logada em um local temporário
                localStorage.setItem('currentUser', JSON.stringify(userFound));
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href = 'index.html';
            } else {
                logMessage.textContent = 'Usuário ou senha incorretos.';
                logMessage.style.color = 'red';
            }
        });
    }
    
    // Lógica de cadastro (executada apenas em page2.html)
    const registerBtn = document.getElementById('form-register');
    if (registerBtn) {
        registerBtn.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const username = document.getElementById('reg-username').value;
            const password = document.getElementById('reg-password').value;
            const passwordConfirm = document.getElementById('reg-password-confirm').value;
            const email = document.getElementById('reg-email').value;
            const dob = document.getElementById('reg-dob').value;
            const regMessage = document.getElementById('reg-message');

            if (password !== passwordConfirm) {
                regMessage.textContent = 'As senhas não coincidem. Tente novamente.';
                regMessage.style.color = 'red';
                return;
            }

            const allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];

            // Verifica se o usuário já existe
            const userExists = allUsers.some(user => user.username === username);
            if (userExists) {
                regMessage.textContent = 'Este nome de usuário já existe. Escolha outro.';
                regMessage.style.color = 'red';
                return;
            }
            
            const userData = {
                username: username,
                password: password,
                email: email,
                dob: dob,
                profilePicUrl: "https://via.placeholder.com/150/e0e6ed/7f8c8d?text=PERFIL" 
            };
            
            allUsers.push(userData); // Adiciona a nova conta na lista
            localStorage.setItem('allUsers', JSON.stringify(allUsers));
            
            regMessage.textContent = 'Cadastro realizado com sucesso! Você será redirecionado para o login.';
            regMessage.style.color = 'green';
            
            setTimeout(() => {
                window.location.href = 'page1.html';
            }, 2000); 
        });
    }

    // Lógica de logout (no perfil.html)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('currentUser'); // Limpa a conta logada
            window.location.href = 'page1.html';
        });
    }

    // === LÓGICA DA PÁGINA DE PERFIL (executada apenas em perfil.html) ===
    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const profilePic = document.getElementById('profile-pic');
        const profilePicInput = document.getElementById('profile-pic-input');
        const changePicBtn = document.getElementById('change-pic-btn');
        const saveProfileBtn = document.getElementById('save-profile-btn');
        const profileMessage = document.getElementById('profile-message');

        // Carregar dados e foto ao abrir a página
        function loadProfileData() {
            if (currentUser) {
                document.getElementById('profile-username').value = currentUser.username || '';
                document.getElementById('profile-email').value = currentUser.email || '';
                document.getElementById('profile-dob').value = currentUser.dob || '';
                const storedPic = currentUser.profilePicUrl;
                if (storedPic) {
                    profilePic.src = storedPic;
                }
            } else {
                window.location.href = 'page1.html'; // Redireciona se não houver usuário logado
            }
        }

        // Trocar foto de perfil
        changePicBtn.addEventListener('click', function() {
            profilePicInput.click();
        });

        profilePicInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file && currentUser) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profilePic.src = e.target.result;
                    currentUser.profilePicUrl = e.target.result; // Salva a foto no objeto do usuário logado
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    // Atualiza o objeto na lista de todos os usuários
                    let allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
                    const userIndex = allUsers.findIndex(user => user.username === currentUser.username);
                    if (userIndex !== -1) {
                        allUsers[userIndex] = currentUser;
                        localStorage.setItem('allUsers', JSON.stringify(allUsers));
                    }

                    profileMessage.textContent = 'Foto de perfil salva com sucesso!';
                    profileMessage.style.color = 'green';
                    setTimeout(() => {
                        profileMessage.textContent = '';
                    }, 3000);
                    checkLoginStatus(); 
                }
                reader.readAsDataURL(file);
            }
        });

        // Salvar dados do perfil
        saveProfileBtn.addEventListener('click', function() {
            if (currentUser) {
                currentUser.email = document.getElementById('profile-email').value;
                currentUser.dob = document.getElementById('profile-dob').value;
                
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                // Atualiza o objeto na lista de todos os usuários
                let allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
                const userIndex = allUsers.findIndex(user => user.username === currentUser.username);
                if (userIndex !== -1) {
                    allUsers[userIndex] = currentUser;
                    localStorage.setItem('allUsers', JSON.stringify(allUsers));
                }

                profileMessage.textContent = 'Alterações salvas com sucesso!';
                profileMessage.style.color = 'green';

                setTimeout(() => {
                    profileMessage.textContent = '';
                }, 3000);
            }
        });
        
        loadProfileData();
    }
    
    checkLoginStatus();
});