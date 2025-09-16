// Importa as funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

// === CONFIGURAÇÃO DO FIREBASE (SUAS CHAVES) ===
const firebaseConfig = {
    apiKey: "AIzaSyA0u9w69i1bflyVju3At_cVweU_zDf4WnI",
    authDomain: "katchau-86464.firebaseapp.com",
    projectId: "katchau-86464",
    storageBucket: "katchau-86464.appspot.com",
    messagingSenderId: "482704550968",
    appId: "1:482704550968:web:708a93ea7f1ca8898ecacd"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const usersCollection = collection(db, "users");
const carsCollection = collection(db, "cars");

const DEFAULT_PROFILE_PIC = 'imagens/default-profile.png';

// === FUNÇÕES PRINCIPAIS ===
document.addEventListener('DOMContentLoaded', function() {
    
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
                const storedPic = currentUser.profilePicUrl || DEFAULT_PROFILE_PIC;
                if (headerProfilePic) {
                    headerProfilePic.src = storedPic;
                }
            } else {
                showLoginHeader.style.display = 'block';
                profileLink.style.display = 'none';
            }
        }
    }

    const loginBtn = document.getElementById('form-login');
    if (loginBtn) {
        let isSubmitting = false;

        loginBtn.addEventListener('submit', async function(event) {
            event.preventDefault(); 
            
            if (isSubmitting) return;
            isSubmitting = true;

            const usernameInput = document.getElementById('log-username').value;
            const passwordInput = document.getElementById('log-password').value;
            const logMessage = document.getElementById('log-message');

            try {
                const q = query(usersCollection, where("username", "==", usernameInput), where("password", "==", passwordInput));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data();

                    localStorage.setItem('currentUser', JSON.stringify(userData));
                    localStorage.setItem('isLoggedIn', 'true');
                    window.location.href = 'index.html';
                } else {
                    logMessage.textContent = 'Usuário ou senha incorretos.';
                    logMessage.style.color = 'red';
                }
            } catch (e) {
                console.error("Erro ao fazer login: ", e);
                logMessage.textContent = 'Erro ao tentar fazer login. Tente novamente.';
                logMessage.style.color = 'red';
            } finally {
                isSubmitting = false;
            }
        });
    }

    const registerBtn = document.getElementById('form-register');
    if (registerBtn) {
        let isSubmitting = false;

        registerBtn.addEventListener('submit', async function(event) {
            event.preventDefault();

            if (isSubmitting) return;
            isSubmitting = true;

            const username = document.getElementById('reg-username').value;
            const password = document.getElementById('reg-password').value;
            const passwordConfirm = document.getElementById('reg-password-confirm').value;
            const email = document.getElementById('reg-email').value;
            const dob = document.getElementById('reg-dob').value;
            const cpf = document.getElementById('reg-cpf').value;
            const rg = document.getElementById('reg-rg').value;
            const regMessage = document.getElementById('reg-message');

            if (password !== passwordConfirm) {
                regMessage.textContent = 'As senhas não coincidem. Tente novamente.';
                regMessage.style.color = 'red';
                isSubmitting = false;
                return;
            }

            const today = new Date();
            const birthDate = new Date(dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDifference = today.getMonth() - birthDate.getMonth();
            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 18 || age > 100) {
                regMessage.textContent = 'Você deve ter entre 18 e 100 anos para se cadastrar.';
                regMessage.style.color = 'red';
                isSubmitting = false;
                return;
            }

            try {
                const q = query(usersCollection, where("username", "==", username));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    regMessage.textContent = 'Este nome de usuário já existe. Escolha outro.';
                    regMessage.style.color = 'red';
                    isSubmitting = false;
                    return;
                }

                const userData = {
                    username: username,
                    password: password, 
                    email: email,
                    dob: dob,
                    cpf: cpf,
                    rg: rg,
                    profilePicUrl: null
                };

                await addDoc(usersCollection, userData);
                
                regMessage.textContent = 'Cadastro realizado com sucesso! Você será redirecionado para o login.';
                regMessage.style.color = 'green';
                
                setTimeout(() => {
                    window.location.href = 'page1.html';
                    isSubmitting = false;
                }, 2000); 

            } catch (e) {
                console.error("Erro ao adicionar documento: ", e);
                regMessage.textContent = 'Erro ao se cadastrar. Tente novamente.';
                regMessage.style.color = 'red';
                isSubmitting = false;
            }
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('currentUser'); 
            window.location.href = 'page1.html';
        });
    }

    const carForm = document.getElementById('car-form');
    if (carForm) {
        let isSubmitting = false;
        
        carForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            if (isSubmitting) return;
            isSubmitting = true;
            
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                document.getElementById('message').textContent = 'Você precisa estar logado para anunciar um carro.';
                isSubmitting = false;
                return;
            }

            const carName = document.getElementById('car-name').value;
            const carYear = document.getElementById('car-year').value;
            const carKm = document.getElementById('car-km').value;
            const carDescription = document.getElementById('car-description').value;
            const carPrice = document.getElementById('car-price').value;
            const carImgFile = document.getElementById('car-images').files[0];
            const messageEl = document.getElementById('message');

            // Esta parte do código vai tentar subir a imagem,
            // mas vai falhar sem o plano Blaze.
            if (carImgFile) {
                try {
                    // Sem Storage, essa parte vai dar erro
                    messageEl.textContent = 'Erro: Para enviar imagens, é necessário o plano Blaze do Firebase.';
                    messageEl.style.color = 'red';
                    isSubmitting = false;

                } catch (e) {
                    console.error("Erro ao adicionar o carro: ", e);
                    messageEl.textContent = 'Erro ao anunciar o carro. Tente novamente.';
                    messageEl.style.color = 'red';
                    isSubmitting = false;
                }
            } else {
                messageEl.textContent = 'Por favor, selecione uma imagem para o carro.';
                messageEl.style.color = 'red';
                isSubmitting = false;
            }
        });
    }

    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const profilePic = document.getElementById('profile-pic');
        const profilePicInput = document.getElementById('profile-pic-input');
        const changePicBtn = document.getElementById('change-pic-btn');
        const saveProfileBtn = document.getElementById('save-profile-btn');
        const profileMessage = document.getElementById('profile-message');
        const profilePicMessage = document.getElementById('profile-pic-message');

        function loadProfileData() {
            if (currentUser) {
                document.getElementById('profile-username').value = currentUser.username || '';
                document.getElementById('profile-email').value = currentUser.email || '';
                document.getElementById('profile-dob').value = currentUser.dob || '';
                
                // Imagem de perfil padrão
                profilePic.src = DEFAULT_PROFILE_PIC;

            } else {
                window.location.href = 'page1.html'; 
            }
        }
        
        // Remove as funções de editar e deletar carros do perfil,
        // pois elas dependem do Firebase.

        changePicBtn.addEventListener('click', function() {
            profilePicInput.click();
        });

        profilePicInput.addEventListener('change', async function(event) {
            // A funcionalidade de upload foi removida pois requer o plano Blaze.
            profilePicMessage.textContent = 'Erro: A funcionalidade de upload de fotos não está disponível sem o plano Blaze do Firebase.';
            profilePicMessage.style.color = 'red';
            setTimeout(() => {
                profilePicMessage.textContent = '';
            }, 3000);
        });

        saveProfileBtn.addEventListener('click', async function() {
            if (currentUser) {
                const updatedData = {
                    email: document.getElementById('profile-email').value,
                    dob: document.getElementById('profile-dob').value
                };

                try {
                    const q = query(usersCollection, where("username", "==", currentUser.username));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const docId = querySnapshot.docs[0].id;
                        const userRef = doc(db, "users", docId);
                        await updateDoc(userRef, updatedData);
                        
                        currentUser.email = updatedData.email;
                        currentUser.dob = updatedData.dob;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        
                        profileMessage.textContent = 'Alterações salvas com sucesso!';
                        profileMessage.style.color = 'green';
                    }
                } catch (e) {
                    console.error("Erro ao salvar perfil: ", e);
                    profileMessage.textContent = 'Erro ao salvar alterações. Tente novamente.';
                    profileMessage.style.color = 'red';
                }
                
                setTimeout(() => {
                    profileMessage.textContent = '';
                }, 3000);
            }
        });
        
        loadProfileData();
    }
    
    checkLoginStatus();
});