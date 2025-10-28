// =====================================================
// EFECTO TYPEWRITER ESTABLE (una sola vez por mensaje)
// =====================================================

const shownMessages = new Set(); // Guarda los textos ya animados
const activeAnimations = new WeakSet(); // Evita solapar animaciones

export function typeWriter(element, text, speed = 40) {
    if (!element) return;

    // Si ya se mostró antes, simplemente escribe el texto
    if (shownMessages.has(text)) {
        element.innerHTML = text;
        return;
    }

    // Si ya se está animando este elemento, salir para evitar solapamiento
    if (activeAnimations.has(element)) return;

    element.classList.add('arcade-text');
    element.innerHTML = '';
    activeAnimations.add(element); // Marca animación activa

    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            // Marcar como completado
            shownMessages.add(text);
            activeAnimations.delete(element); // Libera el elemento
        }
    }

    type();
}

