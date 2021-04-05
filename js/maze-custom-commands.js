(function () {
    class MazeCustomCommands extends HTMLElement {
        constructor() {
            super();
            this.model = {
                customCommands: [
                    {
                        name: 'Snu venstre',
                        codeName: 'snuVenstre',
                        code: 'function snuVenstre() {\n\n}\n',
                    },
                ],
            };
            this.attachShadow({ mode: 'open' });
            this.onclick = null;
            const style = document.createElement('style');
            style.innerText = getStyle();
            this.shadowRoot.appendChild(style)
            this.div = document.createElement('div');
            this.div.classList.add('customCommands');
            this.shadowRoot.appendChild(this.div);
            this.updateView();
        }

        connectedCallback() {
            // this.btnGo = this.shadowRoot.getElementById('btn1');
            // this.btnTurnRight = this.shadowRoot.getElementById('btn2');
            // this.btnIsAtExit = this.shadowRoot.getElementById('btn3');
            // this.btnGo.onclick = this.handleClick.bind(this);
            // this.btnTurnRight.onclick = this.handleClick.bind(this);
            // this.btnIsAtExit.onclick = this.handleClick.bind(this);
        }

        updateView() {
            const model = this.model;
            this.div.innerHTML = `
                    ${model.customCommands.map(this.createCustomCommandHtml.bind(this)).join('')}
                    <div class="customCommand" style="align-self: stretch">
                        <div style="display: flex; align-items: center; height: 100%">
                            <button click="addCustomCommand()" class="nonCommand">+</button>
                        </div>
                    </div>
            `;
            this.removeButtonEventListeners();
            this.addButtonEventListeners();
            if (model.requestFocus) {
                const inputTag = document.getElementById(model.requestFocus.name);
                inputTag.focus();
                inputTag.setSelectionRange(model.requestFocus.selectionStart, model.requestFocus.selectionEnd);
                model.requestFocus = null;
            }
        }

        removeButtonEventListeners() {
            if (!this.buttons) return;
            for (let btn of this.buttons) {
                btn.onclick = null;
            }
        }

        addButtonEventListeners() {
            this.buttons = this.div.getElementsByTagName('button');
            for (let btn of this.buttons) {
                btn.onclick = this.handleClick.bind(this);
            }
        }

        handleClick(clickEvent) {
            const btn = clickEvent.srcElement;
            const code = btn.getAttribute('click');
            eval('this.' + code);
        }

        createCustomCommandHtml(customCommand, index) {
            const isInEditMode = this.model.customCommands[index].isInEditMode;
            const preHtml = isInEditMode ? '' : `
                <button 
                    class="command" 
                    onclick="runCustomCommand('${customCommand.codeName}')"
                    >
                    ${customCommand.name}
                </button>            
            `;
            const postHtml = isInEditMode ? `
                <button click="editCustomCommand(${index}, false)">Avslutt redigering</button>
                `: `
                <button click="editCustomCommand(${index}, true)">Rediger</button>
                <button click="deleteCustomCommand(${index})">Slett</button>
                `;

            return `
                <div class="customCommand">
                    ${preHtml}                    
                    ${this.createJavaScriptFunction(customCommand)}
                    ${postHtml}
                </div>
                `;
        }

        createJavaScriptFunction(customCommand) {
            return customCommand.isInEditMode
                ? `<code-editor name="${customCommand.name}"></code-editor>`
                : `<pre>${customCommand.code}</pre>`;
        }

        createLastCodeHtml(command, returnValue) {
            return `<div class="code">
                        <span style="color: gray">Kommando: &nbsp;</span>
                        ${command}
                        <br/>
                        <span style="color: gray">Returverdi: </span>${returnValue}
                    </div>
                `;
        }
        createButton(click, text) {
            const btn = document.createElement('button');
            btn.classList.add('command');
            btn.setAttribute('click', click);
            btn.innerText = text;
        }

        // controller
        addCustomCommand() {
            this.model.customCommands.push({
                name: 'Min funksjon',
                codeName: 'minFunksjon',
                code: 'function minFunksjon() {\n\n}\n',
            });
            this.updateView();
        }

        editCustomCommand(index, isInEditMode) {
            const customCommand = this.model.customCommands[index];
            customCommand.isInEditMode = isInEditMode;
            if (!isInEditMode) {
                const editor = this.div.getElementsByTagName('code-editor')[0];
                customCommand.code = editor.getFunctionCode(true);
                customCommand.codeName = editor.model.codeName;
                customCommand.name = editor.model.name;
            }
            this.updateView();
        }

        deleteCustomCommand(index) {
            this.model.customCommands.splice(index, 1);
            this.updateView();
        }

        editCommandName(inputTag, index) {
            const customCommand = this.model.customCommands[index];
            customCommand.name = inputTag.value;
            customCommand.codeName = toCamelCase(inputTag.value);
            this.model.requestFocus = {
                name: inputTag.id,
                selectionStart: inputTag.selectionStart,
                selectionEnd: inputTag.selectionEnd,
            };
            this.updateView();
        }
    }

    function toCamelCase(str) {
        return str.split(' ').map(function (word, index) {
            return index == 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join('');
    }

    function getStyle() {
        return `        
            button.command {
                font-size: 150%;
                background-color: green;
                color: white;
            }
            
            .code {
                font-family: monospace;
                font-size: 150%;
            }

            pre {
                font-size: 150%;
            }

            .customCommands {
                display: flex;
                flex-direction: row;
                justify-content: start;
            }
            
            .customCommand {
                padding: 2vmin;
                margin-right: 2vmin;
                border: 0.5vmin dashed gray;
            
            }
        `;
    }

    function quotify(value) {
        return typeof (value) === 'string' ? `'${value}'` : value;
    }

    customElements.define('maze-custom-commands', MazeCustomCommands);
})();