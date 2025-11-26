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
            ...(bodyData || method === 'POST' || method === 'PUT' || method === 'PATCH'
                ? { 'Content-Type': 'application/json' }
                : {}),
            ...customHeaders
        },
    };

    if (bodyData && method !== 'GET' && method !== 'HEAD') {
        config.body = JSON.stringify(bodyData);
    }

    if (method !== 'GET' && method !== 'HEAD') {
        displayLog(`Petición: ${method} ${url}...`, 'info');
    }

    try {
        const response = await fetch(url, config);

        const xMsg = response.headers.get('X-msg');

        // ⛔ EVITAR LECTURA SI ES HEAD
        if (method === 'HEAD') {
            return {
                success: response.ok,
                status: response.status,
                data: null // HEAD nunca tiene cuerpo
            };
        }

        if (response.ok) {

            const isNoContent =
                response.status === 204 ||
                response.headers.get('content-length') === '0' ||
                response.headers.get('Content-Type') === null;

            const data = isNoContent
                ? { data: "Operación Exitosa" }
                : await safeJSON(response); // Usemos un lector seguro

            return {
                success: true,
                status: response.status,
                data: data
            };

        } else {

            let data = {};
            let errorMessage = xMsg;

            try {
                data = await safeJSON(response);
                if (!errorMessage) {
                    errorMessage = data.msg || data.message;
                }
            } catch (e) {}

            if (!errorMessage || errorMessage.trim() === '') {
                errorMessage = `Error de la API [Status ${response.status}]`;
            }

            showPopup(errorMessage);

            return {
                success: false,
                status: response.status,
                error: errorMessage
            };
        }

    } catch (error) {
        showPopup(`Error de red/conexión: ${error.message}`);
        return {
            success: false,
            status: 0,
            error: `Error de red/conexión: ${error.message}`
        };
    }
}


async function safeJSON(response) {
    const text = await response.text();
    if (!text) return {};
    return JSON.parse(text);
}
