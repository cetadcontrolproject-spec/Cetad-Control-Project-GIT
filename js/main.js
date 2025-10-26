// 'DOMContentLoaded' es un evento que se dispara cuando todo el HTML
// ha sido cargado por completo. Ponemos todo nuestro código dentro
// para asegurarnos de que no intentamos manipular elementos que aún no existen.
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. OBTENER LAS HERRAMIENTAS DE FIREBASE ---
    // Tomamos las herramientas que "globalizamos" en el index.html
    const { app, getAuth, signInWithEmailAndPassword, signOut } = window.firebaseTools;

    // --- 2. "ATAJOS" A LOS ELEMENTOS DEL HTML ---
    // Guardamos en variables los elementos que vamos a necesitar manipular
    const loginForm = document.getElementById('login-form');
    const loginView = document.getElementById('login-view');
    const appContainer = document.getElementById('app-container');
    const loginError = document.getElementById('login-error'); // El div de error
    const logoutButton = document.getElementById('logout-button'); // ¡El nuevo botón!

    // --- 3. INICIALIZAR EL SERVICIO DE AUTENTICACIÓN ---
    // Le decimos a Firebase: "Quiero usar tu servicio de Autenticación"
    const auth = getAuth(app);

    // --- 4. FUNCIÓN PARA CAMBIAR DE VISTA ---
    // Una función simple para ocultar todas las vistas y mostrar solo la que queremos
    function switchView(viewIdToShow) {
        // Oculta todas las vistas (las que tienen la clase .app-view)
        document.querySelectorAll('.app-view').forEach(view => {
            view.classList.remove('active-view');
        });
        
        // Muestra solo la vista que queremos
        const viewToShow = document.getElementById(viewIdToShow);
        if (viewToShow) {
            viewToShow.classList.add('active-view');
        }
    }

    // --- 5. EL "INTERRUPTOR" DEL LOGIN ---
    // ... (cuando alguien intente 'enviar' (submit) el formulario 'login-form'...)
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            // 'e.preventDefault()' es MUY importante.
            // Evita que el formulario recargue la página, que es su comportamiento por defecto.
            e.preventDefault();

            // Limpia errores antiguos
            loginError.textContent = '';
            loginError.classList.add('hidden'); // 'hidden' es una clase de Tailwind para 'display: none'

            // --- 6. OBTENER LOS DATOS DEL USUARIO ---
            // Tomamos el valor que el usuario escribió en los campos 'email' y 'password'
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            // --- 7. INTENTAR INICIAR SESIÓN CON FIREBASE ---
            // 'try...catch' se usa para manejar errores.
            try {
                // ¡LA MAGIA DE FIREBASE!
                // Le decimos a Firebase: "Intenta iniciar sesión con este email y contraseña"
                // 'await' significa que nuestro código esperará aquí hasta que Firebase responda.
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                
                // Si llegamos a esta línea, ¡el login fue exitoso!
                console.log('Usuario autenticado:', userCredential.user);
                
                // Usamos nuestra función para cambiar a la vista principal de la app
                switchView('app-container');

            } catch (error) {
                // Si Firebase da un error (contraseña incorrecta, usuario no existe)...
                console.error('Error de autenticación:', error.code, error.message);
                
                // Mostramos un mensaje amigable al usuario
                let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
                
                // Podemos ser más específicos si queremos
                if (error.code === 'auth/invalid-credential') {
                    errorMessage = 'Correo o contraseña incorrectos.';
                }

                loginError.textContent = errorMessage;
                loginError.classList.remove('hidden'); // Hacemos visible el div de error
            }
        });
    }

    // --- 8. EL "INTERRUPTOR" DEL LOGOUT (CERRAR SESIÓN) ---
    // Esta es la nueva sección que hace que el botón funcione.
    if (logoutButton) {
        // Le decimos: "Oye, cuando alguien haga 'click' en el 'logoutButton'..."
        logoutButton.addEventListener('click', async () => {
            console.log('Cerrando sesión...');
            try {
                // Le decimos a Firebase: "Cierra la sesión del usuario actual"
                await signOut(auth);
                
                // Enviamos al usuario de vuelta a la pantalla de login
                switchView('login-view');

            } catch (error) {
                // Si hay algún error al cerrar sesión
                console.error('Error al cerrar sesión:', error);
            }
        });
    }

});

