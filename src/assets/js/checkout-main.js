
//------------------------------------------------------------------------
// Quando a página carregar, chama funções
//------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async function () {


    // Define o tipo de compra se é creditos ou plano
    let typePurchase = "";
    const step00 = document.getElementById("step-00");


    // Verifica se começa na página de compra de crédito
    if (step00 && !step00.classList.contains("hidden-element")) {

        typePurchase = "credits";

        // Ao carregar a página define os valores dos créditos
        const idPlanoSelecionado = "47125"; // ID do plano desejado
        const valores = await carregarValoresCreditos(idPlanoSelecionado);
        

        // Atribui os valores dos créditos
        if (valores) {
            document.querySelector(".box-cart:nth-child(1) .price-box span:last-child").textContent = `R$ ${formatValue(valores.valor_sms)}`;
            document.querySelector(".box-cart:nth-child(2) .price-box span:last-child").textContent = `R$ ${formatValue(valores.valor_whatsapp)}`;
            document.querySelector(".box-cart:nth-child(3) .price-box span:last-child").textContent = `R$ ${formatValue(valores.valor_email)}`;

            // Atribiu dados aos campos de input de quantidade ao carregar a página
            ["sms", "whatsapp", "email"].forEach(type => {
                const input = document.getElementById(`amount-${type}`);
                input.setAttribute("amount-value", valores[`valor_${type}`]);
                input.setAttribute("id-credit", idPlanoSelecionado);
            });

        }

        const minimumValue = "10.00";
        console.log("Definição inicial de minimumValue:", minimumValue); 


        // Atualiza os valores iniciais ao carregar a página
        updateTotals();

        // Monitora os botões de compra de créditos
        ["sms", "whatsapp", "email"].forEach(type => monitorCreditButtons(type, minimumValue));
        
        // Monitora os botões de compra de créditos ao pressionar as teclas setas acima e abaixo do teclado
        monitorArrowKeys(minimumValue);

        
        
        // Monitora interação nos campos de input
        const inputsAmount = document.querySelectorAll(".add-amount input");
        inputsAmount.forEach(input => {
            input.addEventListener("keydown", function (event) {
                monitorMessages(minimumValue);
            });
        });
        


        // -----------------------------------------------------------
        // Botões de navegação entre formulários
        // -----------------------------------------------------------
        document.getElementById("action-step-00").addEventListener("click", function () {

            const msgContainer = document.getElementById("msg-step-00");
            const msgField = msgContainer?.querySelector("span");
        
            // Verifica se há créditos selecionados
            if (!checkCreditsValue()) {
                return showMessageError(msgField, "Selecione a quantidade mínima de créditos para pelo menos um adicional.");
            }
        
            const minimumValue = "10.00";
        
            // Verifica se o total da compra atende ao valor mínimo
            if (!checkTotalAmount(minimumValue)) {
                return showMessageError(msgField, `Atenção, o valor mínimo para compra é de R$ ${minimumValue}.`);
            }
    
            // Remove a mensagem de erro
            removeMessageError(msgField);

            // Exibe o próximo passo e foca no campo "Nome e Sobrenome"
            showStepMain("step-01");

            // Define os links que devem estar ativos nos passos de compra
            const steps = ['step-link-0', 'step-link-1'];
            atictiveSteps(steps);
        
            if (!document.getElementById("step-01").classList.contains("hidden-element")) {
                focusInInput("billing_first_name");
            }
        });        


    }else{

        typePurchase = "plans";

        // ---------------------------------------------------------------------------
        // Carrega dados dos planos
        // ---------------------------------------------------------------------------

        // Variável com escopo global, armazena os dados dos planos
        let resultado; 

        // Chama modal de loader ao carregar a página
        document.getElementById('target-modal-loader').checked = true;

        try {
            //resultado = await fetchDataFile('https://testes.arquivar.com.br/wp-content/themes/theme_arquivar_2024/services/api_get_data_plans.php');
            resultado = await fetchDataFile('base/plans.json');
            
            
            if (resultado.sucesso) {
                console.log("Dados puxados com sucesso:", resultado.dados);
                setTimeout(() => {
                    document.getElementById('target-modal-loader').checked = false;
                }, 1000);
            } else {
                console.error(`Erro ao carregar planos: ${resultado.erro}`);
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
        }    

        // Monitora clique nos links de troca de planos dentro do modal
        document.querySelectorAll('.change-for-plan').forEach(link => {
            link.addEventListener('click', async function (e) {
                e.preventDefault();

                const id = this.getAttribute('id-plan');
                const recorrencia = this.getAttribute('recurrence-plan');

                // Optional chaining para evitar erro se resultado for undefined
                if (resultado?.sucesso) { 
                    // Esconde modal de loader
                    showHiddenModal('target-modal-loader', false);
                    localizarPlano(id, recorrencia, resultado.dados);
                    atualizarParcelas();
                } else {
                    console.error(`Erro ao carregar planos: ${resultado?.erro}`);
                }
            });
        });


        // Atualiza parcelas do cartão
        atualizarParcelas();


        // Monitorar mudanças na recorrência do plano e no checkbox adicional
        const additionalPlanCheckbox = document.querySelector("input[name='additional-plan']");
        if (additionalPlanCheckbox) {
            additionalPlanCheckbox.addEventListener("change", () => {
                updatePriceBasedOnPlan(resultado.dados);
                atualizarParcelas();
            });
            atualizarParcelas();
        }        

        // Monitorar mudanças na recorrencia Anual / Mensal
        const recurrenceRadios = document.querySelectorAll("input[name='recorrencia']");
        recurrenceRadios.forEach(radio => {
            radio.addEventListener("change", function () {
                document.getElementById("plan-active").value = this.value;
                
                updatePriceBasedOnPlan(resultado.dados);
                atualizarParcelas();

                // Informação do estagio do processo de compra
                let stageInfo = document.getElementById("stage").value;

                // Pega informação do tipo de recorrência selecioando
                let recurrencePlan = document.getElementById("plan-active").value;
                
                // Pega informação do metodo de pagamento selecionado
                let paymentSelect = document.getElementById("payment-method").value;


                if(stageInfo == "pagamento" && recurrencePlan == "anual"){
                    verificarBotaoSubmit();
                }  

                // Se estiver na tela de pagamento for mensal e não for cartão exibe modal
                if(stageInfo == "pagamento" && recurrencePlan == "mensal" && paymentSelect != "credit-card"){
                    document.getElementById('target-modal-boleto-pix').checked = true;
                    verificarBotaoSubmit();
                }
            
            });
        });


        // Botão de mudança de plano
        document.getElementById('change_plan').addEventListener('click', function(event) {
            event.preventDefault();
            document.getElementById('target-modal-plans').checked = true;
        });


        // Modal descrição do plano
        document.querySelectorAll('#desc_plan, #desc_plan_icon').forEach(element => {
            element.addEventListener('click', function(event) {
                event.preventDefault();
                document.getElementById('target-modal').checked = true;
    
                let idPlanSelect = "";
                let recurrencePlan = document.getElementById("plan-active").value;
    
                if (recurrencePlan === "anual") {
                    idPlanSelect = document.getElementById("idplan-anual").value;
                } else if (recurrencePlan === "mensal") {
                    idPlanSelect = document.getElementById("idplan-mensal").value;
                }
    
                if (idPlanSelect) {
                    planDescription(idPlanSelect, recurrencePlan, resultado.dados[recurrencePlan]);
                }
            });
        });


        // Modal mudança de plano
        document.getElementById('modal-change-plan').addEventListener('click', function(event) {
            event.preventDefault();
            document.getElementById('target-modal').checked = false;
            document.getElementById('target-modal-plans').checked = true;
        });

        
    } // Verfica se é página de compra de créditos ou planos




    // Modais
    // Monitora link de modal de termos
    linkTerms();

    // Monitora clique no botão de pagamento cartão de crédito
    document.getElementById('link-credit-card').addEventListener('click', function(event) {

        // Define qual o método de pagamento escolhido
        let paymentMethod = document.getElementById("payment-method");
        paymentMethod.value = "credit-card";

        // habilita  botão submit se estiver desabilitado
        verificarBotaoSubmit('credit_card');
    });

    // Exibe modal boleto
    // Verifica se o plano é mensal, o modal não deve ser exibido se o plano for anual
    document.getElementById('link-boleto').addEventListener('click', function(event) {
        event.preventDefault();

        // Define qual o método de pagamento escolhido
        let paymentMethod = document.getElementById("payment-method");
        paymentMethod.value = "boleto";

        let planRecorrencia = document.getElementById("plan-active");
        let planTyperec = planRecorrencia.value;
        if(planTyperec == "mensal"){
            document.getElementById('target-modal-boleto-pix').checked = true;
            verificarBotaoSubmit('boleto');
        }
    });

    // Exibe modal pix
    document.getElementById('link-pix').addEventListener('click', function(event) {
        event.preventDefault();

        // Define qual o método de pagamento escolhido
        let paymentMethod = document.getElementById("payment-method");
        paymentMethod.value = "pix";

        let planRecorrencia = document.getElementById("plan-active");
        let planTyperec = planRecorrencia.value;         
        if(planTyperec == "mensal"){
            document.getElementById('target-modal-boleto-pix').checked = true;
            verificarBotaoSubmit('pix');
        }
    });

    // Botão verificar informações no modal de erro
    document.getElementById('close-info').addEventListener('click', function(event) {
        event.preventDefault();
        document.getElementById('target-modal-recusado').checked = false;
    });    

    
    // Monitorar o enter na página e ativa o clique do botão dos passos do formulário
    monitorarEnter();

    // Monitora o clique nos links do header da página
    showStepLink();




    // ============================================================
    // Form 1
    // ============================================================

    // Chama a função para definir o foco no campo de Nome e Sobrenome
    focusInInput('billing_first_name');

    // Adiciona mascara de telefone
    addMaskPhone('billing_phone');

    // Adicionando monitoramento aos campos do primeiro formulário para limpar mensagens de erro ao digitar no campo
    monitorInputFields("billing_first_name", "msg-step-01", "text");
    monitorInputFields("billing_phone", "msg-step-01", "text");
    monitorInputFields("billing_email", "msg-step-01", "text");
    monitorInputFields("billing_confirme_seu_email_2", "msg-step-01", "text");


    // --------------------------------------------------------------------------
    // Adiciona um evento de input ao campo de texto para verificar se o nome
    // possui mais de uma palavra

    // Obtém a referência ao campo de texto no formulário
    let inputName = document.getElementById('billing_first_name');
    inputName.addEventListener('blur', function(event) {
        // Chama a função verificarNomeCompleto com o evento e o nome do campo
        if (inputName.value.trim() !== "") {
            validateFullName(event, 'billing_first_name', 'msg-step-01');
        }
    });

    
    // -----------------------------------------------------------
    // Monitora digitação no campo telefone
    // -----------------------------------------------------------
    let inputTelefone = document.getElementById('billing_phone');
    if (inputTelefone) {
        monitorarCampoTelefone(inputTelefone, 'msg-step-01');
    }


    // -----------------------------------------------------------
    // Monitora digitação no campo E-mail
    // -----------------------------------------------------------
    monitorarCampoEmail('billing_email', 'msg-step-01');


    // -----------------------------------------------------------
    // Botões de navegação entre formulários
    // -----------------------------------------------------------
    // Seleciona o botão pelo ID
    const btnAvancar = document.getElementById("action-step-01");
    
    // Adiciona um evento de clique ao botão
    btnAvancar.addEventListener("click", function () {

        // Define campos que precisam ser validados
        const fieldsConatct = [
            { input_name: 'billing_first_name', input_type: 'text', input_msg: 'Informe o seu nome e sobrenome' },
            { input_name: 'billing_phone', input_type: 'text', input_msg: 'Preenhca o telefone de contato no formato solicitado.' },
            { input_name: 'billing_email', input_type: 'email', input_msg: 'Informe o campo e-mail' },
            { input_name: 'billing_confirme_seu_email_2', input_type: 'email', input_msg: 'Confirme o seu e-mail' }
        ];

        // Chama a função para validar os campos e passa o id do campo de mensagen
        const validationResult = validateForm(fieldsConatct, 'msg-step-01');
                
        if (validationResult.valid) {

            let acceptTerms = isCheckboxChecked('accept_terms', 'msg-step-01', 'Para prosseguir, você deve aceitar os termos e condições da nossa Política de Privacidade' );

            // Se os termos foram aceitos
            if (acceptTerms) {
                
                // Captura recorrencia selecionada no campo hidden
                const planActiveInput = document.getElementById("plan-active");
                const planType = planActiveInput.value;

                // Exibe modal de desconto para os planos anuais
                if (planType === "mensal") {
                    document.getElementById('target-modal-desconto-anul').checked = true;
                }
                
                // Chama a função para exibir o step-02 e ocultar o step-01
                showStepMain("step-02");
                
                // Define os links que devem estar ativos nos passos de compra
                if(typePurchase == "credits"){
                    const steps = ['step-link-0', 'step-link-1', 'step-link-2'];
                    atictiveSteps(steps);
                }else{
                    const steps = ['step-link-1', 'step-link-2'];
                    atictiveSteps(steps);
                }
            }
            
        }
    });



    // ============================================================
    // Form 2
    // ============================================================
    
    // Adicionando monitoramento aos campos do primeiro formulário para limpar mensagens de erro ao digitar no campo
    monitorInputFields("billing_persontype", "msg-step-02", "select");
    monitorInputFields("billing_cnpj", "msg-step-02", "text");
    monitorInputFields("billing_cpf", "msg-step-02", "text");
    monitorInputFields("billing_company", "msg-step-02", "text");
    monitorInputFields("billing_postcode", "msg-step-02", "text");
    monitorInputFields("billing_address_1", "msg-step-02", "text");
    monitorInputFields("billing_number", "msg-step-02", "text");
    monitorInputFields("billing_neighborhood", "msg-step-02", "text");
    monitorInputFields("billing_state", "msg-step-02", "select");
    monitorInputFields("billing_city", "msg-step-02", "select");



    //------------------------------------------------------------------------
    // Alterna campos de CNPJ e CPF conforme a escolha
    //------------------------------------------------------------------------
    const personTypeSelect = document.getElementById("billing_persontype");
    const boxCompany = document.getElementById("box-company");
    const boxDocument = document.getElementById("box-document");

    // Monitora clique no select de Tipo de Documento
    personTypeSelect.addEventListener("change", function () {
        const selectedValue = personTypeSelect.value;
        
        // Verifica se o box-document existe antes de buscar os inputs
        if (boxDocument) {
            let billingCNPJ = document.getElementById("billing_cnpj");
            let billingCPF = document.getElementById("billing_cpf");
            let billingCompany = document.getElementById("billing_company");

            if (selectedValue === "2") {
                if (billingCNPJ) {
                    billingCNPJ.classList.remove("d-none");
                    billingCNPJ.disabled = false;
                    billingCNPJ.placeholder = "CNPJ";
                    billingCNPJ.classList.remove("alert-input");
                    focusInInput('billing_cnpj');
                    billingCompany.classList.remove("alert-input");
                }
                if (billingCPF){
                    billingCPF.classList.add("d-none");
                    billingCPF.classList.remove("alert-input");
                }
                boxCompany.classList.remove("d-none");
                boxCompany.classList.remove("alert-input");

            } else if (selectedValue === "1") {
                if (billingCNPJ) {
                    billingCNPJ.classList.add("d-none");
                    billingCNPJ.classList.remove("alert-input");
                    billingCNPJ.disabled = true;
                }
                if (billingCPF) {
                    billingCPF.classList.remove("d-none");
                    billingCPF.classList.remove("alert-input");
                    focusInInput('billing_cpf');
                }
                boxCompany.classList.add("d-none");
                boxCompany.classList.remove("alert-input");

            } else if (selectedValue === "0") {
                if (billingCNPJ) {
                    billingCNPJ.classList.remove("d-none");
                    billingCNPJ.classList.remove("alert-input");
                    billingCNPJ.disabled = true;
                    billingCNPJ.placeholder = "CNPJ / CPF";
                }
                if (billingCPF) { 
                    billingCPF.classList.add("d-none"); 
                }
                boxCompany.classList.add("d-none");
                boxCompany.classList.remove("alert-input");
                billingCPF.value = "";
                billingCNPJ.value = "";
            }
        }
    });


    // Aplica máscara nos campos
    applyMask(document.querySelector("#billing_cpf"), "000.000.000-00");
    applyMask(document.querySelector("#billing_cnpj"), "00.000.000/0000-00");
    applyMask(document.querySelector("#billing_postcode"), "00000-000");

    // Validar campos CPF e CNPJ
    validateField(document.querySelector("#billing_cpf"), validateCPF, "Por favor informe um CPF válido!", "msg-step-02");
    validateField(document.querySelector("#billing_cnpj"), validateCNPJ, "Por favor informe um CNPJ válido!", "msg-step-02");


    // Autocompleta campos pelo CEP
    const cepInput = document.getElementById("billing_postcode");
    // Dispara a função ao perder o foco
    cepInput.addEventListener("blur", function () {
        checkoutCepAutocomplete(this.value);
    });


    const stateSelect = document.getElementById("billing_state");
    const citySelectInput = document.getElementById("billing_city");

    // Monitora mudança no campo Estado
    stateSelect.addEventListener("change", function () {
        const uf = this.value;

        if (uf) {
            carregarCidades(uf, "billing_city");
        } else {
            citySelectInput.innerHTML = "";
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Informe sua cidade";
            citySelectInput.appendChild(defaultOption);
        }
    });

    // Se já tiver algum estado carregado na página (caso de edição)
    // if (stateSelect.value !== "") {
    //     carregarCidades(stateSelect.value, "billing_city");
    // }    


    const btnAvancar2 = document.getElementById("action-step-02");
    btnAvancar2.addEventListener("click", function () {

        // Define campos que precisam ser validados
        const fieldsAdress = [
            { input_name: 'billing_persontype', input_type: 'select', input_msg: 'Selecione o tipo de documento' },
            { input_name: 'billing_postcode', input_type: 'text', input_msg: 'Informe o campo CEP' },
            { input_name: 'billing_address_1', input_type: 'text', input_msg: 'Informe o campo Endereço' },
            { input_name: 'billing_number', input_type: 'text', input_msg: 'Informe o campo Número' },
            { input_name: 'billing_neighborhood', input_type: 'text', input_msg: 'Informe o nome do Bairro' },
            { input_name: 'billing_state', input_type: 'select', input_msg: 'Selecione um Estado' },
            { input_name: 'billing_city', input_type: 'select', input_msg: 'Selecione uma Cidade' }
        ];

        // Chama a função para validar os campos e passa o id do campo de mensagen
        const validationfieldsAdress = validateForm(fieldsAdress, 'msg-step-02');
                
        if (validationfieldsAdress.valid) {
            showStepMain("step-03");

            // Define os links que devem estar ativos nos passos de compra
            if(typePurchase == "credits"){
                const steps = ['step-link-0', 'step-link-1', 'step-link-2', 'step-link-3'];
                atictiveSteps(steps);
            }else{
                const steps = ['step-link-1', 'step-link-2', 'step-link-3'];
                atictiveSteps(steps);            
            }
            
            // Adiciona descrição do plano no resumo
            const planDescrptionResume = document.querySelector('.plan-description').classList.remove('hidden-element');

        }

    });


    // ============================================================
    // Form 3 submit 
    // ============================================================

    // Monitora clique nos lonks de pagamento
    navigatePayments();

    // Adiciona um evento de clique ao botão de alternar visibilidade do código de segurança
    const toggleButton = document.getElementById('togglePasswordVisibility');
    toggleButton.addEventListener('click', function() {
        // Chama a função togglePasswordVisibility com o nome do campo de senha
        togglePasswordVisibility('ciclopay_credit_secure_number');
    });


    // Inicializa imagem do cartão de crédito
    let card = new Card({
        form: document.querySelector('form'),
        container: '.box-pay-credit-card',

        placeholders: {
            number: '•••• •••• •••• ••••',
            name: 'Nome Completo',
            expiry: '••/••',
            cvc: '•••'
        },

        formSelectors: {
            nameInput: 'input#ciclopay_credit_name', // optional - defaults input[name="name"]
            //cvcInput: 'input#cvc', // optional — default input[name="cvc"]
        }  
        
    });

    // Adicionando monitoramento aos campos do formulário para limpar mensagens de erro ao digitar no campo
    monitorInputFields("ciclopay_credit_name", "msg-step-03", "text");
    monitorInputFields("ciclopay_credit_number", "msg-step-03", "text");
    monitorInputFields("ciclopay_credit_valid_date", "msg-step-03", "text");
    monitorInputFields("ciclopay_credit_secure_number", "msg-step-03", "text");

    const formPlan = document.getElementById("checkout-primary");
    const btnAvancar3 = document.getElementById("action-step-03");
    btnAvancar3.addEventListener("click", function (event) {

        // Impede o envio do formulário
        event.preventDefault();

        // Define campos que precisam ser validados
        const fieldsCards = [
            { input_name: 'ciclopay_credit_name', input_type: 'text', input_msg: 'Informe o Nome impresso no cartão de crédito' },
            { input_name: 'ciclopay_credit_number', input_type: 'text', input_msg: 'Informe o Número do cartão de crédito' },
            { input_name: 'ciclopay_credit_valid_date', input_type: 'text', input_msg: 'Informe o mês e ano de validade do cartão de crédito' },
            { input_name: 'ciclopay_credit_secure_number', input_type: 'text', input_msg: 'Informe o código de segurança' }
        ];


        // Chama a função para validar os campos e passa o id do campo de mensagen
        const validationfieldsCards = validateForm(fieldsCards, 'msg-step-03');

        // Obtem o nome do método de pagamento escolhido
        const paymentInput = document.getElementById("payment-method");
        // Se é boleto ou pix não precisa validar cartão
        if(paymentInput.value == "boleto" || paymentInput.value == "pix"){

            // Envia dados o formulário
            //formPlan.submit();
            showPageEnd();

        }else{
            
            // Valida campos do cartão de crédito
            if (validationfieldsCards.valid) {

                // Força erro de pagamento
                const error = getParametroUrl("erro");
                if(error==1){
                    document.getElementById('target-modal-recusado').checked = true;
                }else{
                    // Exibe página final
                    // Envia dados o formulário
                    //formPlan.submit();
                    showPageEnd();
                }
            }
        }
    });


});
// DOMContentLoaded