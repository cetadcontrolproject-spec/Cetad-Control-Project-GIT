/* =================================================== */
/* --- DATOS DE PRUEBA (MOCK DATA) --- */
/* =================================================== */
// En un futuro, esto vendrá de la base de datos Firestore.
const mockPatients = [
    {
        id: 'p001',
        name: 'Juan Pérez',
        diagnosis: 'Trastorno por consumo de cocaína',
        admissionDate: '2023-01-15'
    },
    {
        id: 'p002',
        name: 'Ana García',
        diagnosis: 'Trastorno por consumo de alcohol',
        admissionDate: '2023-02-01'
    },
    {
        id: 'p003',
        name: 'Carlos Sánchez',
        diagnosis: 'Adicción al juego (Ludopatía)',
        admissionDate: '2023-02-20'
    },
    {
        id: 'p004',
        name: 'María Rodríguez',
        diagnosis: 'Trastorno por consumo de opiáceos',
        admissionDate: '2023-03-10'
    }
];


/* =================================================== */
/* --- INICIO DEL CÓDIGO DE LA APLICACIÓN --- */
/* =================================================== */
// Espera a que todo el HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {

    /* =================================================== */
    /* --- 1. HERRAMIENTAS Y AUTENTICACIÓN DE FIREBASE --- */
    /* =================================================== */

    // Tomamos las herramientas que "globalizamos" en index.html
    // Asegúrate de que 'getFirestore' esté incluido en 'window.firebaseTools' en tu HTML
    const { app, getAuth, signInWithEmailAndPassword, signOut, getFirestore } = window.firebaseTools;

    // Inicializa el servicio de Autenticación
    const auth = getAuth(app);
    // Inicializa el servicio de Base de Datos
    const db = getFirestore(app);


    /* =================================================== */
    /* --- 2. "ATAJOS" A ELEMENTOS DEL HTML (SELECTORES) --- */
    /* =================================================== */

    // Vistas principales
    const loginView = document.getElementById('login-view');
    const appContainer = document.getElementById('app-container');

    // Sección de Login
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // Sección Principal (App)
    const logoutButton = document.getElementById('logout-button');
    const sidebarNav = document.getElementById('sidebar-nav');

    // Vista de Pacientes
    const patientTableBody = document.getElementById('patient-table-body');
    
    // Vista de Asistente IA
    const aiForm = document.getElementById('ai-form');
    const aiInput = document.getElementById('ai-input');
    const chatWindow = document.getElementById('chat-window');


    /* =================================================== */
    /* --- 3. FUNCIONES DE LÓGICA DE VISTAS --- */
    /* =================================================== */

    /**
     * Cambia entre las vistas principales (Login vs App).
     * @param {string} viewIdToShow - El ID de la vista a mostrar ('login-view' o 'app-container').
     */
    function switchView(viewIdToShow) {
        document.querySelectorAll('.app-view').forEach(view => {
            view.classList.remove('active-view');
        });
        const viewToShow = document.getElementById(viewIdToShow);
        if (viewToShow) {
            viewToShow.classList.add('active-view');
        }
    }

    /**
     * Cambia entre las vistas de contenido (Dashboard, Pacientes, IA).
     * @param {string} viewIdToShow - El ID de la vista de contenido a mostrar.
     */
    function switchContentView(viewIdToShow) {
        // 1. Oculta todas las vistas de contenido
        document.querySelectorAll('.content-view').forEach(view => {
            view.classList.remove('active-content-view');
        });

        // 2. Muestra la vista seleccionada
        const viewToShow = document.getElementById(viewIdToShow);
        if (viewToShow) {
            viewToShow.classList.add('active-content-view');
        }

        // 3. Actualiza el estado activo en el menú lateral
        sidebarNav.querySelectorAll('a').forEach(link => {
            if (link.dataset.view === viewIdToShow) {
                link.classList.add('bg-gray-900'); // Estilo activo
            } else {
                link.classList.remove('bg-gray-900'); // Quita estilo activo
            }
        });
    }

    /* =================================================== */
    /* --- 4. FUNCIONES DE RENDERIZADO DE DATOS --- */
    /* =================================================== */

    /**
     * Rellena la tabla de pacientes con los datos de 'mockPatients'.
     */
    function renderPatientList() {
        if (!patientTableBody) return; // Seguridad por si el elemento no existe

        // Limpia la tabla
        patientTableBody.innerHTML = '';

        // Rellena con datos de prueba
        mockPatients.forEach(patient => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${patient.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        ${patient.diagnosis}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-700">${patient.admissionDate}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="#" class="text-indigo-600 hover:text-indigo-900">Ver Detalles</a>
                </td>
            `;
            patientTableBody.appendChild(row);
        });
    }

    /**
     * Añade un mensaje al chat de la IA.
     * @param {string} message - El texto del mensaje.
     * @param {boolean} isUser - true si el mensaje es del usuario, false si es de la IA.
     */
    function addChatMessage(message, isUser = false) {
        if (!chatWindow) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start gap-3 ${isUser ? 'justify-end' : ''}`;
        
        const messageBody = `
            ${!isUser ? `
            <div class="p-2 bg-indigo-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" /></svg>
            </div>` : ''}
            
            <div class="p-3 rounded-lg max-w-lg ${isUser ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}">
                <p class="text-sm">${message}</p>
            </div>
        `;
        
        messageDiv.innerHTML = messageBody;
        chatWindow.appendChild(messageDiv);
        
        // Auto-scroll al final
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }


    /* =================================================== */
    /* --- 5. "INTERRUPTORES" (EVENT LISTENERS) --- */
    /* =================================================== */

    // --- Login ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginError.textContent = '';
            loginError.classList.add('hidden');
            
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            // ¡¡¡IMPORTANTE!!!
            // Si tu firebaseConfig en index.html no está configurado,
            // 'auth' no será válido y este bloque 'try' podría
            // fallar silenciosamente o comportarse de forma extraña.
            try {
                // Iniciar sesión con Firebase
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                
                // Si es exitoso, cambia a la vista de la app
                console.log('Login exitoso:', userCredential.user);
                switchView('app-container');
                
                // Carga los datos de los pacientes
                renderPatientList();

            } catch (error) {
                // Si Firebase está configurado, aquí es donde se capturan
                // los errores de "contraseña incorrecta" o "usuario no encontrado".
                console.error('Error de autenticación:', error.code, error.message);
                let errorMessage = 'Error al iniciar sesión. Intenta de nuevo.';
                
                // Códigos de error comunes de Firebase
                if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                    errorMessage = 'Correo o contraseña incorrectos.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'El formato del correo es incorrecto.';
                }

                loginError.textContent = errorMessage;
                loginError.classList.remove('hidden');
            }
        });
    }

    // --- Logout ---
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            console.log('Cerrando sesión...'); // Para depuración
            try {
                // Cerrar sesión con Firebase
                await signOut(auth);
                
                // Cambia a la vista de login
                switchView('login-view');
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        });
    }

    // --- Navegación del Sidebar ---
    if (sidebarNav) {
        sidebarNav.addEventListener('click', (e) => {
            // Previene que el enlace '#' recargue la página
            e.preventDefault(); 
            
            // Encuentra el enlace <a> más cercano en el que se hizo clic
            const link = e.target.closest('a');
            
            if (link && link.dataset.view) {
                // Llama a la función de cambio de vista de contenido
                switchContentView(link.dataset.view);
            }
        });
    }

    // --- Chat de IA (Simulado) ---
    if (aiForm) {
        aiForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = aiInput.value.trim();
            
            if (query) {
                // 1. Muestra el mensaje del usuario
                addChatMessage(query, true);
                
                // Limpia el input
                aiInput.value = '';
                
                // 2. Simula una respuesta de la IA después de 1 segundo
                setTimeout(() => {
                    const aiResponse = `Respuesta (simulada) para: "${query}". En un futuro, aquí iría la respuesta de la API de IA basada en los datos del paciente y el BCI.`;
                    addChatMessage(aiResponse, false);
                }, 1000);
            }
        });
    }
    
    // --- Carga inicial de datos al entrar ---
    // (Asegurándonos de que si el login es exitoso, la tabla se llene)
    // Esto es un poco redundante con la llamada en el login, 
    // pero es bueno tenerlo como función de inicialización.
    renderPatientList();

});

