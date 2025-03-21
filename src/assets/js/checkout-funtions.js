

//--------------------------------------------------------------------------------
// Função para exibir o passo especificado e ocultar os demais em um elemento main
//--------------------------------------------------------------------------------
function showStepMain(stepId) {
    // Lista de todos os passos da página
    const steps = document.querySelectorAll('section[id^="step-"]');

    // Informação do estagio do processo de compra
    let stageInfo = document.getElementById("stage");

    // Selecione o elemento de descrição do plano no resumo checkout
    let planDescrptionResume = document.querySelector('.plan-description');

    // Define o stagio do processo de comrpa
    if(stepId == "step-01"){ 
        stageInfo.value = "identificacao";
        planDescrptionResume.classList.add('hidden-element');
    }else if(stepId == "step-02"){
        stageInfo.value = "faturamento";
        planDescrptionResume.classList.add('hidden-element');
    }else if(stepId == "step-03"){
        stageInfo.value = "pagamento";
        planDescrptionResume.classList.remove('hidden-element');
    }

    // Itera através de cada passo
    steps.forEach(step => {
        // Se o ID do passo corresponde ao ID especificado
        if (step.id === stepId) {
            // Remove a classe 'hidden-element' do passo especificado
            step.classList.remove('hidden-element');
        } else {
            // Adiciona a classe 'hidden-element' aos outros passos
            step.classList.add('hidden-element');
        }
    });

    // Remove a classe "active" de todos os <li>
    document.querySelectorAll(".checkout_breadcrumbs li").forEach(li => {
        li.classList.remove("active");
    });

    // Adiciona a classe "active" ao <li> correspondente ao passo
    const stepNumber = stepId.replace("step-0", ""); // Extrai "1", "2" ou "3"
    const activeStep = document.getElementById(`step-link-${stepNumber}`);
    
    if (activeStep) {
        activeStep.closest("li").classList.add("active"); // Adiciona "active" no <li> correto
    }

}



//-----------------------------------------------------
// Define o foco no campo de e-mail do formulário
//-----------------------------------------------------
function focusInInput(id_element) {
    // Obtém o elemento pelo ID
    var inputElement = document.getElementById(id_element);

    if (inputElement) {
        // Define o foco no campo
        inputElement.focus();

        // Se não for um <select>, seleciona o conteúdo
        if (inputElement.tagName.toLowerCase() !== "select") {
            inputElement.select();
        }
    }
}


//----------------------------------------------------------
// Função genérica para validação de campos de formulário
//----------------------------------------------------------
// Recebe um array com o nome do campo e o tipo do campo
function validateForm(fields, boxmsg) {
    for (const field of fields) {
        const { input_name, input_type, input_msg} = field;
        const inp_field = document.getElementById(`${input_name}`);
        const msg_container = document.getElementById(boxmsg);
        const msg_field = msg_container ? msg_container.querySelector("span") : null;

        const value = inp_field.value.trim();
        let fieldValid = value !== '';


        if (!fieldValid && msg_field) {
            msg_field.textContent = input_msg;
            msg_field.style.display = "block";
            inp_field.classList.add("alert-input");
            focusInInput(input_name);
            return { valid: false, field: input_name };

        } else if (msg_field) {
            msg_field.textContent = '';
            msg_field.style.display = "none";
            inp_field.classList.remove("alert-input");
        }


        // Adiciona validação extra para o nome completo
        if (input_name === 'billing_first_name') {
            const palavras = value.split(/\s+/);
            if (palavras.length < 2) {
                msg_field.textContent = 'Por favor, insira um nome completo (mínimo duas palavras)';
                msg_field.style.display = "block";
                inp_field.classList.add("alert-input");
                focusInInput(input_name);
                return { valid: false, field: input_name };
            }
        }
        
        // Valida se o campo de confirmação do e-mail está identico ao campo de e-mail
        if (input_name === 'billing_confirme_seu_email_2') {
            if(!compareEmails('billing_email','billing_confirme_seu_email_2')){
                msg_field.textContent = 'O e-mail de confirmação não é igual ao informado';
                msg_field.style.display = "block";
                inp_field.classList.add("alert-input");
                focusInInput(input_name);            
                return { valid: false, field: input_name };
            }
        }


        // validaçãoa adicional para o campo de documento CNPJ e CPF
        if (input_name === 'billing_persontype') {
            const selectPersonalType = document.getElementById(input_name);
            //console.log(selectPersonalType.value);

            const billingCPF = document.getElementById("billing_cpf");
            const billingCNPJ = document.getElementById("billing_cnpj");
            const billingCompany = document.getElementById("billing_company");

            // Selecione o campo Tipo de Documento
            if(selectPersonalType.value==0){
                msg_field.textContent = "Selecione o tipo de documento";
                msg_field.style.display = "block";
                inp_field.classList.add("alert-input");
                focusInInput(input_name);
                billingCPF.value = "";
                billingCNPJ.value = "";
                return { valid: false, field: input_name };
            }


            // Pessoa fisica
            if (selectPersonalType.value == 1) {
                const valueCPF = billingCPF.value.trim();
                let fieldValidCPF = valueCPF !== "" && validateCPF(valueCPF);
    
                if (!fieldValidCPF) {
                    msg_field.textContent = valueCPF === "" ? "Informe o número do CPF" : "Por favor informe um CPF válido!";
                    msg_field.style.display = "block";
                    billingCPF.classList.add("alert-input");
                    setTimeout(() => {
                        billingCPF.focus();
                        billingCPF.select();
                    }, 10);
                    return { valid: false, field: billingCPF };
                }
            }            


            // Pessoa juridica
            if(selectPersonalType.value==2){

                const valueCNPJ = billingCNPJ.value.trim();
                let fieldValidCNPJ = valueCNPJ !== "" && validateCNPJ(valueCNPJ);
    
                if (!fieldValidCNPJ) {
                    msg_field.textContent = valueCNPJ === "" ? "Informe o número do CNPJ" : "Por favor informe um CNPJ válido!";
                    msg_field.style.display = "block";
                    valueCNPJ.classList.add("alert-input");
                    setTimeout(() => {
                        valueCNPJ.focus();
                        valueCNPJ.select();
                    }, 10);
                    return { valid: false, field: valueCNPJ };
                }                


                const valueCompany = billingCompany.value.trim();
                let fieldValidCcompany = valueCompany !== '';

                if (!fieldValidCcompany) {
                    msg_field.textContent = "Informe a razão social do CNPJ";
                    msg_field.style.display = "block";
                    billingCompany.classList.add("alert-input");
                    billingCompany.focus();
                    //focusInInput(billingCompany);
                    return { valid: false, field: billingCompany };                 
                }
                                
                
            }
        }

    }
    return { valid: true, field: null };
}


// ----------------------------------------------------------------------
// Função que verifica se um nome completo foi inserido no campo de texto
// ----------------------------------------------------------------------
function validateFullName(event, nameInput, msg) {
    const valor = event.target.value.trim();
    const palavras = valor.split(/\s+/);
    const input_field = document.getElementById(nameInput);
    const msg_container = document.getElementById(msg);
    const msg_field = msg_container ? msg_container.querySelector("span") : null;


    if (input_field !== "") { // Só valida se o campo estiver preenchido
        if (palavras.length >= 2) {
            if (msg_field) {
                msg_field.textContent = '';
                msg_field.style.display = "none";
                input_field.classList.remove("alert-input");
            }
        } else {
            if (msg_field) {
                msg_field.style.display = "block";
                msg_field.textContent = 'Por favor, insira um nome completo (mínimo duas palavras)';
                input_field.classList.add("alert-input");
            }
            setTimeout(() => {
                input_field.focus();
                input_field.setSelectionRange(valor.length, valor.length);
            }, 10);
        }
    }
}



//------------------------------------------------------------------------
// Função genérica para limpar mensagens de erros dos inputs
//------------------------------------------------------------------------
function monitorInputFields(inputId, msgFieldId, inputType) {
    const inputField = document.getElementById(inputId);
    const msg_container = document.getElementById(msgFieldId);
    const msgField = msg_container ? msg_container.querySelector("span") : null;

    if (inputField && msgField) {
        let eventType;

        switch (inputType) {
            case "text":
                eventType = "input";
                break;
            case "select":
                eventType = "change";
                break;
            case "radio":
            case "checkbox":
                eventType = "change";
                inputField = document.querySelectorAll(`input[name='${inputId}']`);
                break;
            default:
                console.warn("Tipo de input não reconhecido");
                return;
        }

        if (inputType === "radio" || inputType === "checkbox") {
            inputField.forEach(field => {
                field.addEventListener(eventType, function () {
                    if (msgField.textContent) {
                        msgField.textContent = "";
                        msgField.style.display = "none";
                        field.classList.remove("alert-input");
                    }
                });
            });
        } else {
            inputField.addEventListener(eventType, function () {
                if (msgField.textContent) {
                    msgField.textContent = "";
                    msgField.style.display = "none";
                    inputField.classList.remove("alert-input");
                }
            });
        }
    }
}



//------------------------------------------------------------------------
// Adiciona máscara no campo de telefone
//------------------------------------------------------------------------
function addMaskPhone(input = "billing_phone"){

    let telefoneInput = document.getElementById(input);
    let maskOptions = {
        mask: [
            { mask: '+55 (00) 0000-0000' },  // Formato fixo
            { mask: '+55 (00) 00000-0000' } // Formato celular
        ]
        //lazy: false, // Mostra a máscara assim que o campo recebe foco
        //placeholderChar: '#'
    };
    let mask = IMask(telefoneInput, maskOptions);

    // Força a exibição da máscara ao focar no campo
    telefoneInput.addEventListener("focus", function () {
        if (telefoneInput.value === "") {
            mask.value = "+55 (  )      -    "; // Exibe um placeholder da máscara
        }
    });

    // Remove espaços vazios ao sair do campo, se não tiver número digitado
    telefoneInput.addEventListener("blur", function () {
        if (telefoneInput.value.replace(/\D/g, "").length <= 2) {
            mask.value = "";
        }
    });
}



// -------------------------------
// Validação de campo de Tefefone
// ------------------------------
function monitorarCampoTelefone(inputTelefone, msgFieldId) {
    
    const msg_container = document.getElementById(msgFieldId);
    const msgField = msg_container ? msg_container.querySelector("span") : null;

    // Adiciona um ouvinte de evento 'blur' ao campo de telefone
    inputTelefone.addEventListener("blur", function () {
        // Obtém o valor atualizado e remove espaços extras
        let telefone = inputTelefone.value.trim(); 
        if (telefone !== "") { // Só valida se o campo estiver preenchido
            if (validarTelefone(telefone)) {
                inputTelefone.classList.remove('alert-input');
            } else {
                setTimeout(() => {
                inputTelefone.focus(); // Mantém o foco no campo se o telefone for inválido
                inputTelefone.classList.add('alert-input');
                }, 10);
            }
        }
    });

    // Adiciona um ouvinte de evento 'input' para validar conforme o usuário digita
    inputTelefone.addEventListener("input", function () {
        let telefone = inputTelefone.value.trim(); // Obtém o valor atualizado e remove espaços extras
        if (telefone !== "") {
            if (validarTelefone(telefone)) {
                inputTelefone.classList.remove('alert-input');
            } else {
                inputTelefone.classList.add('alert-input');
                msgField.textContent = "Digite um telefone válido";
                msgField.style.display = "block";
            }
        } else {
            // Se o campo estiver vazio, remove a classe de erro
            inputTelefone.classList.remove('alert-input');
        }
    });
}
  
// Função para validar o formato do telefone
function validarTelefone(telefone) {
    // Regex para validar os formatos: +XX (XX) XXXX-XXXX ou +XX (XX) XXXXX-XXXX
    const regex = /^\+\d{2} \(\d{2}\) \d{4,5}-\d{4}$/;
    return regex.test(telefone);
}



//--------------------------------------------------------------------------
// Função para validar se um checkbox está selecionado
//--------------------------------------------------------------------------
function isCheckboxChecked(checkboxId, msg_field_id, msg_text) {
    const checkbox = document.getElementById(checkboxId);
    const msg_container = document.getElementById(msg_field_id);
    const msg_field = msg_container ? msg_container.querySelector("span") : null;

    if (checkbox && !checkbox.checked) {
        if (msg_field) {
            msg_field.textContent = msg_text;
            msg_field.style.display = "block";
        }
        return false;
    }

    if (msg_field) {
        msg_field.textContent = '';
    }
    return true;
}


//--------------------------------------------------------------------------
// Função para limpar mensagem na tela ao clicar no checkbox
//--------------------------------------------------------------------------
function checkboxClick(checkboxId, msg_field_id) {

    const checkbox = document.getElementById(checkboxId);
    const msg_container = document.getElementById(msg_field_id);
    const msg_field = msg_container ? msg_container.querySelector("span") : null;

    if(msg_field){
        msg_field.textContent = "";
        msg_field.style.display = "none";
    }

}


//------------------------------------------------------------------
// Função para validar e-mail
//------------------------------------------------------------------
function validarEmail(email) {

    // Converte todos os caracteres para minúsculas
    //email = email.toLowerCase();

    // Expressão regular para validar o formato do e-mail
    var regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // var regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return regex.test(email);
}


//------------------------------------------------------------------
// Monitora se o cliente digitou o e-mail corretamente no formulário
//-------------------------------------------------------------------
function monitorarCampoEmail(input, msgFieldId) {
    
    const inputEmail = document.getElementById(input);
    const msg_container = document.getElementById(msgFieldId);
    const msgField = msg_container ? msg_container.querySelector("span") : null;

    // Adiciona um ouvinte de evento 'blur' ao campo de E-mail
    inputEmail.addEventListener("blur", function () {
        // Remove espaços extras
        let inputEmailClear = inputEmail.value.trim();
        if(inputEmail.value.trim() !== "") { // Só valida se o campo estiver preenchido
            if (validarEmail(inputEmailClear)) {
                inputEmail.classList.remove('alert-input');
                msgField.style.display = "none";
            } else {
                setTimeout(() => {
                    inputEmail.focus();
                    msgField.style.display = "block";
                    msgField.textContent = 'Por favor, digite um e-mail válido.';
                    inputEmail.classList.add("alert-input");    
                }, 10);
            }
        }
    });
}



//------------------------------------------------------------------
// Se o enter foi pressionado, dispara clique no botão indicado
//-------------------------------------------------------------------
function monitorarEnter() {
    document.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Evita o envio de formulários padrão

            // Seleciona a seção visível cujo ID começa com "step-" e NÃO tem a classe "hidden-element"
            const visibleSection = document.querySelector("section[id^='step-']:not(.hidden-element)");

            if (visibleSection) {
                //console.log("Seção visível:", visibleSection);
                // Procura um botão dentro da seção visível
                const button = visibleSection.querySelector("input[type='button'], input[type='submit']");

                if (button) {
                    //console.log("Botão acionado:", button);
                    button.click(); // Dispara o clique no botão correspondente ao passo atual
                }
            }
        }
    });
}





// --------------------------------------------------------
// Monitorar chamada da página final de confirmação
// --------------------------------------------------------
function showPageEnd(){

    // Remove da tela o menu breadcrumbs
    document.querySelector('.checkout_breadcrumbs').innerHTML = '';

    // Esconde dobra de Pagamento e Resumo
    const formPayment = document.getElementById('step-03').classList.add('hidden-element');
    const boxResume = document.getElementById('resume').classList.add('hidden-element');

    // Obtem o nome do método de pagamento escolhido
    const paymentInput = document.getElementById("checkout_payment_method");

    if(paymentInput.value == "boleto" || paymentInput.value == "pix"){
        // Exibe página final
        const pagePendingPayment = document.getElementById('step-05').classList.remove('hidden-element');
    }else{
        // Exibe página final
        const pagePayment = document.getElementById('step-04').classList.remove('hidden-element');
    }
}



// --------------------------------------------------------
// Função para capturar um parâmetro da URL
// --------------------------------------------------------
function getParametroUrl(nome) {
    const params = new URLSearchParams(window.location.search);
    return params.get(nome);
}



// --------------------------------------------------------
// Links dos termos e politica de privacidade
// --------------------------------------------------------
function linkTerms(){
    document.getElementById('box-terms').addEventListener('click', function(event) {
        //event.preventDefault();
        document.getElementById('target-modal-terms').checked = true;
    });
    document.getElementById('box-policy').addEventListener('click', function(event) {
        //event.preventDefault();
        document.getElementById('target-modal-policy').checked = true;
    });
}



// ------------------------------------------------
// Função Generica para aplicar máscara nos campos
// ------------------------------------------------
// Exemplos
// applyMask(document.querySelector("#shipping_postcode"), "00000-000");
// applyMask(document.querySelector("#billing_cpf"), "000.000.000-00");
// applyMask(document.querySelector("#credit-card-cpf"), "000.000.000-00");
// applyMask(document.querySelector("#billing_cnpj"), "00.000.000/0000-00");
function applyMask(input, mask) {
    if (!input) return;
    input.addEventListener("input", function () {
        let value = input.value.replace(/\D/g, "");
        let maskedValue = "";
        let maskIndex = 0;

        for (let char of value) {
            while (mask[maskIndex] && mask[maskIndex] !== "0") {
                maskedValue += mask[maskIndex++];
            }
            if (!mask[maskIndex]) break;
            maskedValue += char;
            maskIndex++;
        }
        input.value = maskedValue;
    });
}


// ------------------------
// Função para validar CPF
// ------------------------
function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;

    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    return rev === parseInt(cpf.charAt(10));
}

// ------------------------
// Função para validar CNPJ
// ------------------------
function validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, "");
    if (cnpj.length !== 14) return false;

    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    let digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result != digits.charAt(0)) return false;

    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result == digits.charAt(1);
}


// -------------------------------------------------------------------------------------
// Função de suporte para validar os campos de CPF e CNPJ
// -------------------------------------------------------------------------------------
// validateField(document.querySelector("#billing_cpf"), validateCPF, "CPF inválido!");
// validateField(document.querySelector("#credit-card-cpf"), validateCPF, "CPF inválido!");
// validateField(document.querySelector("#billing_cnpj"), validateCNPJ, "CNPJ inválido!");
function validateField(input, validator, message, idmsg) {
    if (!input) return;
    input.addEventListener("blur", function () {
        // Se o campo estiver vazio retorna sem fazer a validação
        if (input.value.trim() === "") return;
        if (!validator(input.value)) {
            const input_field = document.getElementById(input.id);
            const msg_container = document.getElementById(idmsg);
            const msg_field = msg_container ? msg_container.querySelector("span") : null;
            
            if (msg_field) {
                msg_field.style.display = "block";
                msg_field.textContent = message;
            }
            
            input_field.classList.add("alert-input");
            
            // Adiciona setTimeout para evitar bloqueio da chamada após o alerta ou manipulação do DOM
            setTimeout(() => {
                input_field.focus();
                input_field.select();
            }, 10);
        }
    });
}



// ---------------------------------------------------------------------------
// Função que alterna entre exibir e esconder o campo código de segurança
// ---------------------------------------------------------------------------
function togglePasswordVisibility(inputName) {
    // Obtém o campo de senha pelo ID
    const passwordField = document.getElementById(inputName);

    // Obtém o ícone de visibilidade pelo ID
    const toggleIcon = document.getElementById("togglePasswordVisibility");

    // Verifica o tipo atual do campo
    if (passwordField.type === 'password') {
        // Se o tipo atual é 'password', altera para 'text' para exibir a senha
        passwordField.type = 'text';
        // Altera a classe do ícone para 'show-password'
        toggleIcon.classList.remove("hide-password");
        toggleIcon.classList.add("show-password");        
    } else {
        // Se o tipo atual não é 'password', altera para 'password' para esconder a senha
        passwordField.type = 'password';
        // Altera a classe do ícone para 'hide-password'
        toggleIcon.classList.remove("show-password");
        toggleIcon.classList.add("hide-password");        
    }
}


// ---------------------------------------------------------------------------
// Função genérica para exibir e esconder um modal
// ---------------------------------------------------------------------------
// Recebe ID do modal e o status true/false
function showHiddenModal(modal, status){
    document.getElementById(modal).checked = status;
}



// ---------------------------------------------------------------------------
// Função que carrega dados de endereçoa a partir do CEP
// ---------------------------------------------------------------------------
async function checkoutCepAutocomplete(inputedCep) {
    
    // Chama modal de loader ao carregar a página
    document.getElementById('target-modal-loader').checked = true;

    // Remove tudo que não for número
    let cep = inputedCep.replace(/\D/g, ""); 

    if (cep.length !== 8) {
      console.error("CEP inválido");
      document.getElementById('target-modal-loader').checked = false;
      return;
    }

    const endereco = document.getElementById("billing_address_1");
    const bairro = document.getElementById("billing_neighborhood");
    const estado = document.getElementById("billing_state");
    const cidade = document.getElementById("billing_city");
    

    const url = `https://viacep.com.br/ws/${cep}/json/`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        setTimeout(() => {
            document.getElementById('target-modal-loader').checked = false;
        }, 600);

        if (data.erro) {
            console.error("CEP não encontrado");
            document.getElementById('target-modal-loader').checked = false;
        } else {
            endereco.value = data.logradouro || "";
            bairro.value = data.bairro || "";
            estado.value = data.uf || "";
            cidade.value = data.localidade || "";
            localStorage.setItem("billing_city", data.localidade);
            localStorage.setItem("billing_uf", data.uf);
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        document.getElementById('target-modal-loader').checked = false;
    }
}



// ---------------------------------------------------------------------------
// Função para carregar cidades a partir do estado selecionado
// ---------------------------------------------------------------------------
async function carregarCidades(uf, city) {

    const citySelect = document.getElementById(city);
    const urlCidades = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios/?orderBy=nome`;

    // Limpa opções antigas
    if(citySelect){
        
        // Limpa opções antigas
        citySelect.innerHTML = '';
        const defaultOption = document.createElement("option");
        defaultOption.value = '';
        defaultOption.textContent = "Informe sua cidade";
        citySelect.prepend(defaultOption);
               
        
        //citySelect.innerHTML = `<option value="">Informe sua cidade</option>`;

        try {

            // Chama modal de loader ao carregar a página
            document.getElementById('target-modal-loader').checked = true;            

            const response = await fetch(urlCidades);

            if (!response.ok) {
                throw new Error("Erro ao buscar cidades");
            }

            const cidades = await response.json();

            cidades.forEach((cidade) => {
                const option = document.createElement("option");
                option.value = cidade.nome;
                option.textContent = cidade.nome;
                //option.classList.add("city_option");
                citySelect.appendChild(option);
            });

            const cidadeSalva = localStorage.getItem("billing_city");
            const estadoSalvo = localStorage.getItem("billing_uf");
      
            if (estadoSalvo && estadoSalvo !== "undefined" && estadoSalvo === uf) {
              if (cidadeSalva && cidadeSalva !== "undefined") {
                citySelect.value = cidadeSalva;
                console.log("Cidade salva encontrada.");
              } else {
                console.log("Nenhuma cidade salva encontrada.");
                citySelect.selectedIndex = 0;
              }
            } else {
              console.log("Nenhuma cidade salva encontrada.");
              citySelect.selectedIndex = 0;
            }            

        } catch (error) {
            console.error("Erro ao carregar cidades:", error);
        } finally {
            setTimeout(() => {
                document.getElementById('target-modal-loader').checked = false;
            }, 600);
        }

    }
}




// ---------------------------------------------------------------------------
// Função para sanitizar dados HTML, alternativa para biblitoca purify.js
// ---------------------------------------------------------------------------
// Exemplod de como usar:
// const descricaoSanitizada = sanitizeHTML(plano.descricao_plano);
// document.getElementById("description-plan").innerHTML = descricaoSanitizada;
function sanitizeHTML(html) {
    const allowedTags = {
        'p': [],
        'strong': [],
        'em': [],
        'ul': [],
        'li': [],
        'ol': [],
        'b': [],
        'i': [],
        'br': [],
        'a': ['href', 'target', 'rel'],
        'span': [],
        'div': []
    };

    const template = document.createElement("template");
    template.innerHTML = html.trim(); // Remove espaços em branco do início e fim

    const elementos = template.content.querySelectorAll("*");

    elementos.forEach(el => {
        const tag = el.tagName.toLowerCase();

        // Remove tags que não estão na whitelist
        if (!allowedTags.hasOwnProperty(tag)) {
            el.replaceWith(document.createTextNode(el.innerHTML));
            return;
        }

        // Remove atributos proibidos
        for (let attr of el.attributes) {
            const attrName = attr.name.toLowerCase();

            if (!allowedTags[tag].includes(attrName)) {
                el.removeAttribute(attrName);
            }

            // Links externos seguros
            if (tag === "a" && attrName === "href") {
                if (!attr.value.startsWith("http") && !attr.value.startsWith("#")) {
                    el.removeAttribute(attrName);
                }
                el.setAttribute("rel", "noopener noreferrer");
                el.setAttribute("target", "_blank");
            }
        }
    });

    // Remove espaços em branco entre as tags para deixar bonitinho
    return template.innerHTML.replace(/\s{2,}/g, ' ').trim();
}





//---------------------------------------------
// Exibe a mensagem de erro no campo adequado
//---------------------------------------------
function showMessageError(field, message) {
    if (field) {
        field.style.display = "block";
        field.textContent = message;
    }
}



//---------------------------------------------
// Remove a mensagem de erro no campo adequado
//---------------------------------------------
function removeMessageError(field) {
    if (field) {
        field.style.display = "none";
        field.textContent = "";
    }
}





// ------------------------------------------------------------------------------------------------
// Exibir ou remover mensagens de erro na tela
// ------------------------------------------------------------------------------------------------
function monitorMessages(minimumValue) {

    console.log(minimumValue);

    const msgContainer = document.getElementById("msg-step-00");
    const msgField = msgContainer?.querySelector("span");

    // Verifica se o total da compra atende ao valor mínimo
    if (!checkTotalAmount(minimumValue)) {
        return showMessageError(msgField, `Atenção, o valor mínimo para compra é de R$ ${minimumValue}.`);
    }else{
        return removeMessageError(msgField);
    }
}


