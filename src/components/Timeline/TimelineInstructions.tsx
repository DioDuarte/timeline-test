import {Instructions} from "./styles";
import React from "react";

const TimelineInstructions = () => {
    return (
        <Instructions>
            <p><strong>Instruções:</strong></p>
            <ul>
                <li>Arraste itens horizontalmente para reposicioná-los no tempo</li>
                <li>Arraste a timeline com o mouse para navegar pelas datas</li>
                <li>Use os botões de zoom ou role o mouse com Alt pressionado para mudar a visualização</li>
                <li>Clique duplo em qualquer data para criar um ponto de referência para zoom</li>
                <li>Clique duplo em qualquer evento da timeline abrirá o modal de edição de eventos</li>
                <li>Na direita há o painel de navegação rápida</li>
                <li>Selecionar qualquer evento o posicionará no centro da timeline com uma cor diferente para facilitar a visualização.</li>
            </ul>
        </Instructions>
    )
}


export default TimelineInstructions;