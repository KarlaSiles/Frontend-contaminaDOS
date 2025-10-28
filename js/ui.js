// =================================================================
//  UTILIDADES DE UI Y POPUP                       MODULO 2  = ui.js
// =================================================================
import { elements } from './api.js';


// Función para mostrar mensajes en el área de resultados/log
export const displayLog = (message, type = 'info', append = true) => {
    const time = new Date().toLocaleTimeString();
    const logElement = `<div class="log-message ${type}">[${time}] ${message}</div>`;

    if (append) {
        elements.resultsDiv.innerHTML = logElement + elements.resultsDiv.innerHTML;
    } else {
        elements.resultsDiv.innerHTML = logElement;
    }
};

// Función para mostrar un popup en la esquina derecha
export const showPopup = (message, duration = 4000) => {
    elements.popupMessage.textContent = message;
    elements.popupMessage.style.display = 'block';

    // Reinicia la animación
    void elements.popupMessage.offsetWidth;
    elements.popupMessage.style.opacity = 1;

    setTimeout(() => {
        elements.popupMessage.style.opacity = 0;
        setTimeout(() => {
            elements.popupMessage.style.display = 'none';
        }, 500);
    }, duration);
};

// Validación de inputs
export const validateInputs = (value, min, max, name) => {
    if (value.length < min || value.length > max) {
        displayLog(`Validación: El campo '${name}' debe tener entre ${min} y ${max} caracteres.`, 'error');
        return false;
    }
    return true;
};

// =================================================================
//  FUNCIÓN UNIVERSAL DE API. Tambien incluye manejo de errores y mensajes
// =================================================================
export async function llamarAPI(url, method, bodyData = null, customHeaders = {}) {
    const config = {
        method: method,
        headers: {
            'Accept': 'application/json',
            // Si hay datos en el cuerpo o el método es POST, PUT o PATCH, se añade el Content-Type
            ...(bodyData || method === 'POST' || method === 'PUT' || method === 'PATCH' ? { 'Content-Type': 'application/json' } : {}),
            ...customHeaders // Añade cualquier encabezado personalizado.
        },
    };

    if (bodyData && method !== 'GET' && method !== 'HEAD') {
        config.body = JSON.stringify(bodyData);
    }

    if (method !== 'GET' && method !== 'HEAD') {
        displayLog(`Petición: ${method} ${url}...`, 'info');
    }

    try {// Realiza la llamada al API
        const response = await fetch(url, config);

        const xMsg = response.headers.get('X-msg'); // mensaje del servidor en el header

        if (response.ok) { // si el estado es 200-299
            
            // Si el estado es 204 (No Content) o 200/201 (OK) con Content-Length 0 (ej. HEAD, OPTIONS)
            const isNoContent = response.status === 204 || response.headers.get('content-length') === '0';
            
            const data = isNoContent
                ? { data: "Operación Exitosa" } // No intenta leer el cuerpo JSON
                : await response.json(); // Solo intenta parsear JSON si hay contenido
                
            return { success: true, status: response.status, data: data };
            
        } else { // si no fue exitoso (4xx, 5xx)
            let data = {};
            let errorMessage = xMsg; // 1. Prioridad: Header X-msg

            try {// intenta parsear el JSON de error
                data = await response.json();
                // 2. Segunda prioridad: msg o message del body
                if (!errorMessage) {
                    errorMessage = data.msg || data.message;
                }
            } catch (e) { }

            // 3. Tercera prioridad: Si sigue vacío, usar un mensaje genérico con el status
            if (!errorMessage || errorMessage.trim() === '') {
                errorMessage = `Error de la API [Status ${response.status}]`;
            }
            
            // muestra el error en un popup
            showPopup(errorMessage);
            
            return { success: false, status: response.status, error: errorMessage };
        }

    } catch (error) {// Manejo de errores de red o excepciones
        showPopup(`Error de red/conexión: ${error.message}`);
        return { success: false, status: 0, error: `Error de red/conexión: ${error.message}` };
    }
}