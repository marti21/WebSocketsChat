import React, { useRef, useEffect } from 'react';
import '../App.css' 

export function Messages({ messages, message, owner }) {
    const containerRef = useRef(null);

    // Función para agregar mensajes al contenedor
    const addMessageToContainer = (message) => {
        if (containerRef.current) {
            if(owner){
                containerRef.current.insertAdjacentHTML('beforeend', `<div class="box">${message}</div>`);
                
            }
            else{
                containerRef.current.insertAdjacentHTML('beforeend', `<div>${message}</div>`);
            }
            console.log('AQUI EL MENSAJE: ' + message);
        }
    };

    // Efecto para manejar la lista de mensajes al inicio
    useEffect(() => {
        if (messages && messages.length > 0) {
            for (let i = 0; i < messages.length; i++) {
                addMessageToContainer(messages[i]);
            }
        }
    }, [messages]);

    // Efecto para manejar el mensaje individual
    useEffect(() => {
        if (message) {
            addMessageToContainer(message);
        }
    }, [message]);

    return <div className="grid-container" ref={containerRef}></div>;

}