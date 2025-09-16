// Importa as funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

// === CONFIGURAÇÃO DO FIREBASE (SUBSTITUA PELAS SUAS CHAVES) ===
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const usersCollection = collection(db, "users");
const carsCollection = collection(db, "cars");

// Caminho para a imagem de perfil padrão
const DEFAULT_PROFILE_PIC = 'imagens/default-profile.png';

// === FUNÇÕES PRINCIPAIS ===
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

    // Função para renderizar os carros no catálogo principal
    async function renderAllCars() {
        const carGrid = document.querySelector('.car-grid');
        if (!carGrid) return;
        
        carGrid.innerHTML = ''; // Limpa os carros antigos

        const defaultCars = [
            { id: "system-1", name: "McQueen", year: "2006", km: "100", description: "7 vezes campeão da copa pistão.", price: "90.000.000.000", img: "imagens/carros/mcqueen.jfif", postedBy: "System" },
            { id: "system-2", name: "Mercedes-Benz Classe C", year: "2025", km: "0", description: "Para você que quer alto desempenho e tecnologia avançada.", price: "2.280.500", img: "imagens/carros/MERCEDES-BENZ AMG GT 63.jpeg", postedBy: "System" },
            { id: "system-3", name: "Audi R8", year: "2021", km: "9800", description: "Elegância e tecnologia em um só lugar.", price: "1.600.000", img: "imagens/carros/audi r8.jpeg", postedBy: "System" }
        ];

        let userCars = [];
        try {
            const querySnapshot = await getDocs(carsCollection);
            querySnapshot.forEach(doc => {
                userCars.push({ id: doc.id, ...doc.data() });
            });
        } catch (e) {
            console.error("Erro ao carregar carros do Firebase: ", e);
        }

        const allCars = [...defaultCars, ...userCars];

        allCars.forEach(car => {
            const carCard = document.createElement('div');
            carCard.className = 'car-card';
            carCard.innerHTML = `
                <img src="${car.img}" alt="Imagem do carro">
                <h3>${car.name}</h3>
                <p><strong>Ano:</strong> ${car.year}</p>
                <p><strong>KM:</strong> ${car.km}</p>
                <p class="car-description">${car.description}</p>
                <p class="price">R$ ${car.price}</p>
                <button class="buy-button">Comprar</button>
            `;
            carGrid.appendChild(carCard);
        });
    }

    // Lógica de login (executada apenas em page1.html)
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

    // Lógica de cadastro (executada apenas em page2.html)
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
            const regMessage = document.getElementById('reg-message');

            if (password !== passwordConfirm) {
                regMessage.textContent = 'As senhas não coincidem. Tente novamente.';
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
                    profilePicUrl: null // Define a URL da foto de perfil como nula no cadastro
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

    // Lógica de logout (no perfil.html)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('currentUser'); 
            window.location.href = 'page1.html';
        });
    }

    // Lógica para anunciar carro (em vender.html)
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

            if (carImgFile) {
                const reader = new FileReader();
                reader.onload = async function(e) {
                    try {
                        const carData = {
                            name: carName,
                            year: carYear,
                            km: carKm,
                            description: carDescription,
                            price: carPrice,
                            img: e.target.result,
                            postedBy: currentUser.username
                        };

                        await addDoc(carsCollection, carData);
                        
                        messageEl.textContent = 'Anúncio enviado com sucesso! Você será redirecionado para a página inicial.';
                        messageEl.style.color = 'green';
                        
                        setTimeout(() => {
                            window.location.href = 'index.html';
                            isSubmitting = false;
                        }, 2000);
                    } catch (e) {
                        console.error("Erro ao adicionar o carro: ", e);
                        messageEl.textContent = 'Erro ao anunciar o carro. Tente novamente.';
                        messageEl.style.color = 'red';
                        isSubmitting = false;
                    }
                }
                reader.readAsDataURL(carImgFile);
            } else {
                messageEl.textContent = 'Por favor, selecione uma imagem para o carro.';
                messageEl.style.color = 'red';
                isSubmitting = false;
            }
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
        const profilePicMessage = document.getElementById('profile-pic-message');

        function loadProfileData() {
            if (currentUser) {
                document.getElementById('profile-username').value = currentUser.username || '';
                document.getElementById('profile-email').value = currentUser.email || '';
                document.getElementById('profile-dob').value = currentUser.dob || '';
                
                // Lógica da foto de perfil
                if (currentUser.profilePicUrl) {
                    profilePic.src = currentUser.profilePicUrl;
                    profilePicMessage.textContent = ''; // Limpa a mensagem
                } else {
                    profilePic.src = DEFAULT_PROFILE_PIC;
                    profilePicMessage.textContent = 'Adicione uma foto de perfil!';
                }
            } else {
                window.location.href = 'page1.html'; 
            }
        }

        async function handleEditCar(carId) {
            const newName = prompt("Editar nome:");
            const newYear = prompt("Editar ano:");
            const newKm = prompt("Editar KM:");
            const newPrice = prompt("Editar preço:");
        
            if (newName || newYear || newKm || newPrice) {
                const carRef = doc(db, "cars", carId);
                const updatedData = {};
                if (newName) updatedData.name = newName;
                if (newYear) updatedData.year = newYear;
                if (newKm) updatedData.km = newKm;
                if (newPrice) updatedData.price = newPrice;
        
                try {
                    await updateDoc(carRef, updatedData);
                    alert('Anúncio editado com sucesso!');
                    renderUserCars();
                    renderAllCars();
                } catch (e) {
                    console.error("Erro ao editar o carro: ", e);
                    alert('Erro ao editar o anúncio.');
                }
            }
        }
        
        async function handleDeleteCar(carId) {
            if (confirm('Tem certeza que deseja excluir este anúncio?')) {
                try {
                    await deleteDoc(doc(db, "cars", carId));
                    alert('Anúncio excluído com sucesso!');
                    renderUserCars();
                    renderAllCars();
                } catch (e) {
                    console.error("Erro ao excluir o carro: ", e);
                    alert('Erro ao excluir o anúncio.');
                }
            }
        }

        async function renderUserCars() {
            const userCarsSection = document.getElementById('user-cars-section');
            if (!userCarsSection) return;

            userCarsSection.innerHTML = `<h3>Meus Anúncios</h3>`;

            const q = query(carsCollection, where("postedBy", "==", currentUser.username));
            const querySnapshot = await getDocs(q);
            const userCars = [];
            querySnapshot.forEach(doc => {
                userCars.push({ id: doc.id, ...doc.data() });
            });

            if (userCars.length > 0) {
                const carList = document.createElement('div');
                carList.className = 'car-list-user';
                userCars.forEach(car => {
                    const carItem = document.createElement('div');
                    carItem.className = 'car-item';
                    carItem.innerHTML = `
                        <img src="${car.img}" alt="Imagem do carro">
                        <div>
                            <h4>${car.name}</h4>
                            <p><strong>Ano:</strong> ${car.year}</p>
                            <p><strong>KM:</strong> ${car.km}</p>
                            <p>${car.description}</p>
                            <p><strong>Preço:</strong> R$ ${car.price}</p>
                            <div class="user-car-actions">
                                <button class="edit-btn" data-car-id="${car.id}">Editar</button>
                                <button class="delete-btn" data-car-id="${car.id}">Excluir</button>
                            </div>
                        </div>
                    `;
                    carList.appendChild(carItem);
                });
                userCarsSection.appendChild(carList);
                
                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', (e) => handleEditCar(e.target.dataset.carId));
                });
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', (e) => handleDeleteCar(e.target.dataset.carId));
                });

            } else {
                userCarsSection.innerHTML += `<p>Você ainda não anunciou nenhum carro.</p>`;
            }
        }

        // Trocar foto de perfil
        changePicBtn.addEventListener('click', function() {
            profilePicInput.click();
        });

        profilePicInput.addEventListener('change', async function(event) {
            const file = event.target.files[0];
            if (file && currentUser) {
                const reader = new FileReader();
                reader.onload = async function(e) {
                    profilePic.src = e.target.result;
                    
                    // Encontre o documento do usuário no Firestore para atualizar
                    const q = query(usersCollection, where("username", "==", currentUser.username));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const docId = querySnapshot.docs[0].id;
                        const userRef = doc(db, "users", docId);
                        
                        try {
                            await updateDoc(userRef, { profilePicUrl: e.target.result });
                            
                            // Atualiza o localStorage com o novo URL
                            currentUser.profilePicUrl = e.target.result;
                            localStorage.setItem('currentUser', JSON.stringify(currentUser));
                            
                            profilePicMessage.textContent = 'Foto de perfil salva com sucesso!';
                            profilePicMessage.style.color = 'green';
                            
                            // Atualiza a imagem do cabeçalho
                            checkLoginStatus(); 
                        } catch (e) {
                            console.error("Erro ao salvar foto de perfil: ", e);
                            profilePicMessage.textContent = 'Erro ao salvar a foto. Tente novamente.';
                            profilePicMessage.style.color = 'red';
                        }
                    } else {
                         profilePicMessage.textContent = 'Erro: Usuário não encontrado no banco de dados.';
                         profilePicMessage.style.color = 'red';
                    }

                    setTimeout(() => {
                        profilePicMessage.textContent = '';
                    }, 3000);
                }
                reader.readAsDataURL(file);
            }
        });

        // Salvar dados do perfil
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
        renderUserCars();
    }
    
    checkLoginStatus();
    renderAllCars();
});