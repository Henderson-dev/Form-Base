

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


// --------------------------------------------------------------------------------
// Navegação entre as partes do formulário
// --------------------------------------------------------------------------------
function showStepLink(){
    // Seleciona todos os links dentro da lista de passos
    const stepLinks = document.querySelectorAll(".checkout_breadcrumbs a");

    stepLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault(); // Impede a navegação padrão

            // Exibe Resumo se estiver oculto na tela
            const boxResume = document.getElementById('resume').classList.remove('hidden-element');
    
            // Obtém o número do passo a partir do ID do link
            const stepNumber = this.id.replace("step-link-", ""); // Extrai "1", "2" ou "3"

            if (stepNumber) {
                showStepMain(`step-0${stepNumber}`); // Chama a função com o ID correto
            }

            // Remove a classe "active" de todos os <li>
            document.querySelectorAll(".checkout_breadcrumbs li").forEach(li => {
                li.classList.remove("active");
            });

            // Adiciona a classe "active" ao <li> do link clicado
            this.closest("li").classList.add("active");
        });
    }); 
}



function atictiveSteps(steps) {
    // Desativa todos os links
    document.querySelectorAll(".checkout_breadcrumbs a").forEach(link => {
        link.classList.add("disabled");
    });

    // Ativa apenas os passos recebidos no parâmetro
    steps.forEach(step => {
        const link = document.getElementById(step);
        if (link) {
            link.classList.remove("disabled");
        }
    });
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
// Valida se os e-mails digitados no formulário são iguais
//-------------------------------------------------------------------
function compareEmails(emailId, confirmEmailId) {
    const email = document.getElementById(emailId).value;
    const confirmEmail = document.getElementById(confirmEmailId).value;
    return email === confirmEmail;
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


//------------------------------------------------------------------
// Navega entre os metodos de pagamento
//------------------------------------------------------------------
function navigatePayments(){
    const navLinks = document.querySelectorAll(".box-pay-method a");
    const paymentBoxes = {
        "Cartão de crédito": "box-credit-card",
        "Boleto": "box-boleto",
        "Pix": "box-pix"
    };
    
    const paymentInput = document.getElementById("checkout_payment_method");

    navLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();

            // Chama função para limpar mensagens de erro dos campos de cartão de crédito se estiverem na tela
            clearInputCreditCard();
            
            // Remove active class de todos os links e adiciona ao clicado
            navLinks.forEach(nav => nav.classList.remove("active"));
            this.classList.add("active");
            
            // Define o método de pagamento no campo oculto
            const paymentMethod = this.textContent.trim();
            if(paymentMethod=="Cartão de crédito"){
                //paymentInput.value = paymentMethod.toLowerCase().replace(" ", "_");
                paymentInput.value = "credit_card";
            }else if(paymentMethod=="Boleto"){
                paymentInput.value = "boleto";
            }else if(paymentMethod=="Pix"){
                paymentInput.value = "pix";
            }
            
            // Esconde todas as divs de pagamento e exibe a correta
            Object.values(paymentBoxes).forEach(id => {
                document.getElementById(id).classList.add("hidden-element");
            });
            document.getElementById(paymentBoxes[paymentMethod]).classList.remove("hidden-element");

        });
    });
}



//------------------------------------------------------------------------
// Função para limpar mensagens de erros dos inputs de Cartão de Crédito
//------------------------------------------------------------------------
function clearInputCreditCard() {
    const msg_container = document.getElementById("msg-step-03");
    const msgField = msg_container ? msg_container.querySelector("span") : null;
    if (msgField) {
        msgField.textContent = "";
        msgField.style.display = "none";
    }
    
    // Ids dos campos
    const inputIds = [
        "ciclopay_credit_name",
        "ciclopay_credit_number",
        "ciclopay_credit_valid_date",
        "ciclopay_credit_secure_number"
    ];
    
    // Percorrer o array de ids dos campos e aplicar as alterações abaixo
    inputIds.forEach(inputId => {
        let inputField = document.getElementById(inputId);
        if (inputField) {
            inputField.classList.remove("alert-input");
        }
    });
}



//------------------------------------------------------------------------
// Função para atualizar o total com base no plano ativo e adicional
//------------------------------------------------------------------------
function updatePriceBasedOnPlan(data) {

    const planActiveInput = document.getElementById("plan-active");
    const planType = planActiveInput.value;
    const additionalPlanCheckbox = document.querySelector("input[name='additional-plan']");
    const totalCheckout = document.getElementById("total-checkout");
    let newPrice = "";
    let planNameEl = document.getElementById("desc_plan");
    let additionalEl = document.getElementById("add-additional");

    // Pega span do texto de parcelamento
    let spanInstallment = document.querySelector('.installment-up-to');
    let totalYear = document.getElementById('total-year');
    
  
    if (planType === "anual") {

        // Se adicional foi marcado
        if(additionalPlanCheckbox.checked){
            newPrice = document.getElementById("installment-upto-additional").value;
        }else{            
            newPrice = document.getElementById("installment-upto").value;
        }
        
        if(data){
            const dataPlans = data[planType];
            let planId = document.getElementById("idplan-anual");
            const planData = dataPlans.find(p => p.id_plano === planId.value);
            planNameEl.textContent = planData.nome_plano;
            additionalEl.textContent = planData.descricao_adicional;
            spanInstallment.textContent = "até 12x de";
            
            // Atualiza preço anual com base no adicional
            if(additionalPlanCheckbox.checked){
                // Adicional marcado
                totalYear.textContent = `Total: ${document.getElementById('price-anual-additional').value}`;
            }else{
                // Adicional desmarcado
                totalYear.textContent = `Total: ${document.getElementById('price-anual').value}`;
            }
        }

    } else {
        newPrice = additionalPlanCheckbox.checked ? document.getElementById("price-mensal-additional").value : document.getElementById("price-mensal").value;

        if(data){
            const dataPlans = data[planType];
            let planId = document.getElementById("idplan-mensal");
            const planData = dataPlans.find(p => p.id_plano === planId.value);
            planNameEl.textContent = planData.nome_plano;
            additionalEl.textContent = planData.descricao_adicional;
            spanInstallment.textContent = "";
            totalYear.innerHTML = "&nbsp;";
        }

    }
    
    totalCheckout.textContent = newPrice;
}



// --------------------------------------------------------
// Monitorar clique no botão "Mudar plano" dentro do modal
// ---------------------------------------------------------
function buttonChangePlan(idModal){
        
        // Simular clique no label correspondente ao plano anual
        const labelAnual = document.querySelector("label[for='radio-1']");
        if (labelAnual) {
            labelAnual.click();
        }

        // Remover o checked do modal através do id	indicado no parametro da função
        const modalCheckbox = document.getElementById(idModal);
        if (modalCheckbox) {
            modalCheckbox.checked = false;
        }

        // Habilita o botão de submit
        verificarBotaoSubmit();
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



// ---------------------------------------------------------------------------------
// Hebilita / Desabilita o botão de submit conforme tipo de pagamento e recorrência
// ---------------------------------------------------------------------------------
function verificarBotaoSubmit(type) {
    let planRecorrencia = document.getElementById("plan-active");
    let btoSubmit = document.getElementById("action-step-03");


    if (planRecorrencia && btoSubmit) {
        // Converte para minúsculas para evitar erros
        let planTyperec = planRecorrencia.value.toLowerCase();

        // Se o metodo de pagamento for cartão libera o submit
        if(type == "credit_card"){
            btoSubmit.disabled = false;
            btoSubmit.classList.remove("desable"); // Remove a classe
        }else{

            // Se o metodo de pagamento não for cartão verifica a recorrência do plano
            if (planTyperec === "mensal") {
                btoSubmit.disabled = true;
                btoSubmit.classList.add("desable"); // Adiciona a classe
            } else if (planTyperec === "anual") {
                btoSubmit.disabled = false;
                btoSubmit.classList.remove("desable"); // Remove a classe
            }
        }
    }
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
// Função que carrega dados de um arquivo JSON
// ---------------------------------------------------------------------------
async function fetchDataFile(filePath) {
    try {
      const response = await fetch(filePath);
      const data = await response.json();
  
      if (response.ok) {
        return {
          sucesso: true,
          dados: data,
          status: response.status
        };
      } else {
        return {
          sucesso: false,
          erro: `Erro: ${response.statusText}`,
          status: response.status
        };
      }
    } catch (error) {
      return {
        sucesso: false,
        erro: error.message,
        status: null
      };
    }
}



// ---------------------------------------------------------------------------
// Função que localiza um plano no arquivo JSON e exibe na tela
// ---------------------------------------------------------------------------
async function localizarPlano(id, recorrencia, dados) {
    const planos = dados[recorrencia];

    // Oculta modal dos planos
    showHiddenModal('target-modal-plans', false);
  
    if (!planos) {
      console.error(`Recorrência ${recorrencia} não encontrada.`);
      return;
    }
  
    const plano = planos.find(p => p.id_plano === id);
    
    if (!plano) {
      console.error(`Plano com ID ${id} não encontrado na recorrência ${recorrencia}.`);
      return;
    }


    if(recorrencia=="anual"){
        // Simular clique no label correspondente ao plano anual
        const labelAnual = document.querySelector("label[for='radio-1']");
        if (labelAnual) {
            labelAnual.click();
        }
    }

    if(recorrencia=="mensal"){
        // Simular clique no label correspondente ao plano mensal
        const labelMensal = document.querySelector("label[for='radio-2']");
        if (labelMensal) {
            labelMensal.click();
        }
    }


    // Altera informações do plano na tela
    document.getElementById("desc_plan").textContent = plano.nome_plano;
    document.getElementById("add-additional").textContent = plano.descricao_adicional;
    document.getElementById("total-checkout").textContent = plano.valor_plano;
    document.getElementById("additional-plan").checked = false;

    // Altera campos ocultos
    document.getElementById("plan-active").value = recorrencia;
    document.getElementById(`price-${recorrencia}`).value = plano.valor_plano;
    document.getElementById(`idplan-${recorrencia}`).value = plano.id_plano;
    document.getElementById(`idplan-${recorrencia}-correspondente`).value = plano.id_correspondente;
    document.getElementById(`${recorrencia}-additional`).value = plano.descricao_adicional;
    document.getElementById(`price-${recorrencia}-additional`).value = plano.valor_adicional;
    document.getElementById(`idplan-${recorrencia}-additional`).value = plano.id_adicional;
    
    // Define valor do parcelamento para planos anuais
    if(recorrencia=="anual"){
        // Calcula valor do parcelamento do plano anual dividindo o valor do plano por 12
        let InstallmentValue = divideValue(extractValue(plano.valor_plano), 12);
        // Adiciona o valor do parcelamento para o campo oculto
        document.getElementById('installment-upto').value = `R$ ${InstallmentValue}/mês`;
        
        let InstallmentValueAdicional = divideValue(extractValue(plano.valor_adicional), 12);
        document.getElementById('installment-upto-additional').value = `R$ ${InstallmentValueAdicional}/mês`;
        
        // Exibe os valores no front
        document.getElementById("total-checkout").textContent = `R$ ${InstallmentValue}/mês`;
        document.getElementById("total-year").textContent = `Total: ${plano.valor_plano}`;


    }

    // Pega o ID do plano corresponde a recorrência atual
    const idCorrespondente = plano.id_correspondente;

    // Determina qual o tipo de recorrência
    let recorrenceNow = "";
    if(recorrencia=="anual"){
        recorrenceNow = "mensal";
    }else if(recorrencia=="mensal"){
        recorrenceNow = "anual";
    }

    // Localiza os dados do plano correspondente
    const recorrenceData = dados[recorrenceNow];
    const recorrenceDataNow = recorrenceData.find(rePlan => rePlan.id_plano === idCorrespondente);

    // Altera os campos ocultos do plano correspondente
    document.getElementById(`price-${recorrenceNow}`).value = recorrenceDataNow.valor_plano;
    document.getElementById(`idplan-${recorrenceNow}`).value = recorrenceDataNow.id_plano;
    document.getElementById(`idplan-${recorrenceNow}-correspondente`).value = recorrenceDataNow.id_correspondente;
    document.getElementById(`${recorrenceNow}-additional`).value = recorrenceDataNow.descricao_adicional;
    document.getElementById(`price-${recorrenceNow}-additional`).value = recorrenceDataNow.valor_adicional;
    document.getElementById(`idplan-${recorrenceNow}-additional`).value = recorrenceDataNow.id_adicional;

}



// ---------------------------------------------------------------------------
// Função que localiza um plano no arquivo JSON e exibe detalhes no front
// ---------------------------------------------------------------------------
async function planDescription(id, recorrencia, dados) {

    const plano = dados.find(p => p.id_plano === id);
    
    if (!plano) {
      console.error(`Plano com ID ${id} não encontrado na recorrência ${recorrencia}.`);
      return;
    }

    if (recorrencia == "anual" || recorrencia == "mensal") {
        document.getElementById("name-plan").textContent = plano.nome_plano;

        // Sanitizando o HTML antes de exibir
        //const descricaoSanitizada = DOMPurify.sanitize(plano.descricao_plano);
        const descricaoSanitizada = DOMPurify.sanitize(plano.descricao_plano, {
            ALLOWED_TAGS: ['p', 'strong', 'br', 'ul', 'li']
        });
        document.getElementById("description-plan").innerHTML = descricaoSanitizada;
    }

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





// =================================================================================
// FUNÇÕES AUXILIARES CPMPRA CRÉDITOS
// =================================================================================


// ----------------------------------------------------------------------------
// Formata valores para exibição no formato monetário, remove ponto e coloca vírgula
// ----------------------------------------------------------------------------
function formatValue(value) {
    if (typeof value === "string") {
        return value.replace(/\.(\d{2})$/, ",$1");
    }
    return value;
}

function formatCurrencyBR(value) {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}



// ----------------------------------------------------------------------------
// Função que carrega os valores dos créditos de acordo com o plano selecionado
// ----------------------------------------------------------------------------
async function carregarValoresCreditos(idPlano) {

    // Chama modal de loader ao carregar a página
    document.getElementById('target-modal-loader').checked = true;

    try {
        const response = await fetch("base/amount_values.json");
        const data = await response.json();

        // Procurar o plano pelo ID dentro das categorias "anual" e "mensal"
        const plano = [...data.anual, ...data.mensal].find(p => p.id_plano === idPlano);

        if (plano) {          
            return {
                valor_sms: plano.valor_sms,
                valor_whatsapp: plano.valor_whatsapp,
                valor_email: plano.valor_email
            };
        } else {
            console.error("Plano não encontrado.");
            return null;
        }

    } catch (error) {
        console.error("Erro ao carregar os valores dos créditos:", error);
        return null;

    } finally {
        setTimeout(() => {
            document.getElementById('target-modal-loader').checked = false;
        }, 600);
    }
}



// --------------------------------------------------------------------------------
// Função monitora cliques nos botões de adicionar e remover quantidade de créditos
// --------------------------------------------------------------------------------
function monitorCreditButtons(creditType, minimumValue) {
    const buttons = document.querySelectorAll(`.btn-amount[data-input='amount-${creditType}']`);

    buttons.forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            const input = document.getElementById(button.getAttribute("data-input"));
            let value = parseInt(input.value, 10) || 0;

            if (button.id === `add-amount-${creditType}`) {
                value++;
            } else if (button.id === `remove-amount-${creditType}`) {
                value = Math.max(0, value - 1);
            }

            input.value = value;
            updateTotals(); // Atualiza os valores totais sempre que um botão for clicado
            monitorMessages(minimumValue); // Monitora as mensagens de erro na tela, valida se o total da compra atende ao valor mínimo	
        });

        const input = document.getElementById(button.getAttribute("data-input"));
        if (input) {
            // Restringe a entrada para números e impede valores negativos
            input.addEventListener("input", function () {
                this.value = this.value.replace(/\D/g, "");
                if (this.value === "" || parseInt(this.value, 10) < 0) {
                    this.value = "0";
                }
                updateTotals(); // Atualiza os valores totais quando o usuário digita
                monitorMessages(minimumValue);
            });

            // Corrige valores inválidos ao sair do campo
            input.addEventListener("blur", function () {
                if (this.value === "" || isNaN(this.value) || parseInt(this.value, 10) < 0) {
                    this.value = "0";
                }
                updateTotals(); // Garante que o total seja atualizado após saída do campo
                monitorMessages(minimumValue);
            });

            // Seleciona o conteúdo ao clicar no input
            input.addEventListener("focus", function () {
                this.select();
            });
        }
    });
}



// --------------------------------------------------------------------------------
// Função que atualiza a o valor da compra de créditos
// --------------------------------------------------------------------------------
function updateTotals() {
    let totalCheckout = 0;

    // Lista de tipos de créditos
    const types = ["sms", "whatsapp", "email"];

    types.forEach(type => {
        const input = document.getElementById(`amount-${type}`);
        const qtSpan = document.getElementById(`qt-${type}`);
        const totalSpan = document.getElementById(`total-${type}`);
        const amountValue = parseFloat(input.getAttribute("amount-value").replace(",", "."));
        let quantity = parseInt(input.value) || 0;
      

        // Atualiza a exibição das quantidades
        //qtSpan.textContent = `${quantity}x ${type.toUpperCase()}`;
        qtSpan.textContent = `${quantity.toLocaleString('pt-BR')}x ${type.toUpperCase()}`;

        // Calcula e atualiza o total parcial
        let total = quantity * amountValue;
        //totalSpan.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
        totalSpan.textContent = `R$ ${formatCurrencyBR(total)}`;

        // Soma ao total final
        totalCheckout += total;
    });

    // Atualiza o total final no checkout
    //document.getElementById("total-checkout").textContent = `R$ ${totalCheckout.toFixed(2).replace(".", ",")}`;
    document.getElementById("total-checkout").textContent = `R$ ${formatCurrencyBR(totalCheckout)}`;
}



// --------------------------------------------------------------------------------
// Função que verifica se os campos de compra de crédito não estão vazios
// --------------------------------------------------------------------------------
function checkCreditsValue() {
    return ["sms", "whatsapp", "email"].some(type => {
        const value = document.getElementById(`amount-${type}`).value.replace(/^0+/, "") || "0";
        return parseInt(value, 10) > 0;
    });
}



// --------------------------------------------------------------------------------
// Função que verifica se o valor total é maior que o mínimo permitido
// --------------------------------------------------------------------------------
function checkTotalAmount(valueCompare) {
    // Obtém o valor do total da compra no HTML
    const totalText = document.getElementById("total-checkout").textContent.trim();

    // Remove "R$" e espaços extras, depois substitui vírgula por ponto para conversão correta
    const totalNumerico = parseFloat(totalText.replace("R$", "").trim().replace(/\./g, "").replace(",", "."));

    // Garante que o valor de comparação também esteja no formato correto
    const valorNumerico = parseFloat(valueCompare.toString().replace(",", "."));

    // Retorna verdadeiro se o total da compra for maior que o valor de comparação
    return totalNumerico >= valorNumerico;
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
// Monitora os botões de compra de créditos ao pressionar as teclas setas acima e abaixo do teclado
// ------------------------------------------------------------------------------------------------
function monitorArrowKeys(minimumValue){
    const inputs = document.querySelectorAll(".add-amount input");
    inputs.forEach(input => {
        input.addEventListener("keydown", function (event) {
            let value = parseInt(this.value, 10) || 0;

            if (event.key === "ArrowUp") {
                value++;
                event.preventDefault();
            } else if (event.key === "ArrowDown") {
                value = Math.max(0, value - 1);
                event.preventDefault();
            }

            this.value = value;
            // Atualiza os valores totais sempre que houver alteração
            updateTotals();
            // Verifica a mensagem de erro
            monitorMessages(minimumValue); 
        });
    });
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



// ------------------------------------------------------------------------
// Parcelar (dividir) o valor de acordo com a quantidade inserida na função
// ------------------------------------------------------------------------
function divideValue(value, amount) {
    if (amount <= 0) {
        throw new Error("A quantidade deve ser maior que zero.");
    }
    let resultado = value / amount;
    return formatCurrencyBR(resultado);
}



// ------------------------------------
// Extrai o valor numérico do texto
// ------------------------------------
// Exemplo de uso:
// let precoAnual = "R$ 478,80/ano";
// let valorExtraido = extrairValorMonetario(precoAnual);
// console.log(valorExtraido); // 478.80
function extractValue(textString) {
    let match = textString.match(/[\d,.]+/);
    if (match) {
        return parseFloat(match[0].replace(".", "").replace(",", "."));
    }
    return 0;
}



// ------------------------------------
// Atualiza parcelameto do select
// ------------------------------------
function atualizarParcelas() {
    const planActive = document.getElementById("plan-active").value;
    const additionalPlanCheckbox = document.querySelector("input[name='additional-plan']");
    
    let totalValue = 0;
    if (planActive === "anual") {
        totalValue = additionalPlanCheckbox.checked 
            ? document.getElementById("price-anual-additional").value
            : document.getElementById("price-anual").value;
    } else if (planActive === "mensal") {
        totalValue = additionalPlanCheckbox.checked 
            ? document.getElementById("price-mensal-additional").value
            : document.getElementById("price-mensal").value;
    }
    
    totalValue = extractValue(totalValue);
    
    const select = document.getElementById("cyclopay_installments");
    select.innerHTML = ""; // Limpa as opções existentes
    
    if (planActive === "anual") {
        for (let i = 1; i <= 12; i++) {
            let parcelaValor = divideValue(totalValue, i);
            let option = document.createElement("option");
            option.value = i;
            option.textContent = `${i} x Parcela${i > 1 ? 's' : ''} de R$ ${parcelaValor}`;
            select.appendChild(option);
        }
    } else if (planActive === "mensal") {
        let option = document.createElement("option");
        option.textContent = `1 x Parcela de R$ ${formatCurrencyBR(totalValue)}`;
        select.appendChild(option);       
    }
}