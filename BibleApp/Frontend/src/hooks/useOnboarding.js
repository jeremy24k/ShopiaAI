import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../styles/onboarding.css';

const ONBOARDING_KEY = 'shopia_onboarding_done';

function useOnboarding(user, language = 'es') {
    useEffect(() => {
        if (!user) return;
        if (localStorage.getItem(ONBOARDING_KEY)) return;

        // Pequeño delay para que todos los elementos rendericen
        const timer = setTimeout(() => {
            const isEs = language === 'es';
            let driverObj;

            const steps = [
                // 1. Bienvenida
                {
                    element: '#onboarding-nav',
                    popover: {
                        title: isEs ? '¡Bienvenido a Shopia!' : 'Welcome to Shopia!',
                        description: isEs
                            ? 'Shopia es tu compañero de estudio bíblico. Te haremos un recorrido rápido por las funciones principales.'
                            : 'Shopia is your Bible study companion. Let us walk you through the main features.',
                        side: 'right',
                        align: 'start',
                    },
                },
                // 2. Leer
                {
                    element: '#onboarding-read',
                    popover: {
                        title: isEs ? 'Lee la Biblia' : 'Read the Bible',
                        description: isEs
                            ? 'Explora múltiples traducciones, navega por libros y capítulos, y selecciona versículos para estudiar o compartir.'
                            : 'Explore multiple translations, browse books and chapters, and select verses to study or share.',
                        side: 'right',
                        align: 'start',
                    },
                },
                // 3. Favoritos
                {
                    element: '#onboarding-favorites',
                    popover: {
                        title: isEs ? 'Tus Favoritos' : 'Your Favorites',
                        description: isEs
                            ? 'Guarda los versículos que más te impactan. Accede a ellos en cualquier momento desde esta sección.'
                            : 'Save the verses that speak to you most. Access them anytime from this section.',
                        side: 'right',
                        align: 'start',
                    },
                },
                 // 7. Notas
                {
                    element: '#onboarding-notes',
                    popover: {
                        title: isEs ? 'Tus Notas' : 'Your Notes',
                        description: isEs
                            ? 'Escribe reflexiones, pensamientos o resúmenes de estudio. Todo se guarda en tu cuenta y puedes volver cuando quieras.'
                            : 'Write reflections, thoughts, or study summaries. Everything is saved to your account and you can revisit anytime.',
                        side: 'right',
                        align: 'start',
                    },
                },
                // 4. IA — intro
                {
                    element: '#onboarding-ai',
                    popover: {
                        title: isEs ? 'Asistente de IA Bíblico' : 'Biblical AI Assistant',
                        description: isEs
                            ? 'Tienes una IA especializada en la Biblia. Puedes hacerle preguntas, pedir explicaciones de pasajes y mucho más.'
                            : 'You have an AI specialized in the Bible. Ask questions, request passage explanations, and much more.',
                        side: 'right',
                        align: 'start',
                    },
                },
                // 5. IA — contexto
                {
                    element: '#onboarding-ai',
                    popover: {
                        title: isEs ? 'Contexto Inteligente' : 'Smart Context',
                        description: isEs
                            ? 'Puedes seleccionar versículos desde la Biblia y enviarlos directamente al chat de IA. Ella los usará como contexto para darte respuestas más precisas.'
                            : 'Select verses from the Bible and send them directly to the AI chat. It uses them as context for more precise answers.',
                        side: 'right',
                        align: 'start',
                    },
                },
                // 6. IA — modos
                {
                    element: '#onboarding-ai',
                    popover: {
                        title: isEs ? 'Modos y Perspectivas' : 'Modes & Perspectives',
                        description: isEs
                            ? 'En el chat puedes cambiar el modo (guía personal, devocional, académico...) y la perspectiva teológica para adaptar las respuestas a tu forma de fe.'
                            : 'In the chat you can change the mode (personal guide, devotional, academic...) and theological perspective to adapt responses to your faith.',
                        side: 'right',
                        align: 'start',
                    },
                },
                // 8. Ajustes
                {
                    element: '#onboarding-settings',
                    popover: {
                        title: isEs ? '¡Ya casi estás listo!' : 'Almost there!',
                        description: isEs
                            ? 'Desde aquí puedes cambiar el idioma de la app y activar el modo oscuro para leer con más comodidad. ¡Que disfrutes Shopia!'
                            : 'From here you can change the app language and enable dark mode for more comfortable reading. Enjoy Shopia!',
                        side: 'top',
                        align: 'start',
                    },
                },
            ];

            driverObj = driver({
                showProgress: true,
                steps,
                nextBtnText: isEs ? 'Siguiente →' : 'Next →',
                prevBtnText: isEs ? '← Anterior' : '← Back',
                doneBtnText: isEs ? '¡Empezar!' : "Let's go!",
                allowClose: true,
                // Al cerrar con la X: mostrar confirmación
                onCloseClick: () => {
                    const confirmMsg = isEs
                        ? '¿Seguro que quieres saltar el tour? No podrás volverte a verlo automáticamente.'
                        : 'Are you sure you want to skip the tour? You won\'t be able to see it automatically again.';
                    if (window.confirm(confirmMsg)) {
                        localStorage.setItem(ONBOARDING_KEY, 'true');
                        driverObj.destroy();
                    }
                    // Si cancela, no hace nada → el tour sigue
                },
                onDestroyStarted: () => {
                    // Solo se llama cuando se completa (Done) o se destruye tras confirmación
                    if (!driverObj.isActive()) return;
                    localStorage.setItem(ONBOARDING_KEY, 'true');
                    driverObj.destroy();
                },
            });

            driverObj.drive();
        }, 1200);

        return () => clearTimeout(timer);
    }, [user, language]);
}

export default useOnboarding;
