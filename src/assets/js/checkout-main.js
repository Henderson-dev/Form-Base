
//------------------------------------------------------------------------
// Quando a página carregar, chama funções
//------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async function () {


    // Monitora link de modal de termos
    linkTerms();
   
    // Monitorar o enter na página e ativa o clique do botão dos passos do formulário
    monitorarEnter();

    // Chama a função para definir o foco no campo de Nome e Sobrenome
    focusInInput('billing_first_name');

    // Adiciona mascara de telefone
    addMaskPhone('billing_phone');

    // Adicionando monitoramento aos campos do primeiro formulário para limpar mensagens de erro ao digitar no campo
    monitorInputFields("billing_first_name", "msg-step-02", "text");
    monitorInputFields("billing_phone", "msg-step-02", "text");
    monitorInputFields("billing_email", "msg-step-02", "text");
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


    // --------------------------------------------------------------------------
    // Adiciona um evento de input ao campo de texto para verificar se o nome
    // possui mais de uma palavra

    // Obtém a referência ao campo de texto no formulário
    let inputName = document.getElementById('billing_first_name');
    inputName.addEventListener('blur', function(event) {
        // Chama a função verificarNomeCompleto com o evento e o nome do campo
        if (inputName.value.trim() !== "") {
            validateFullName(event, 'billing_first_name', 'msg-step-02');
        }
    });

    
    // -----------------------------------------------------------
    // Monitora digitação no campo telefone
    // -----------------------------------------------------------
    let inputTelefone = document.getElementById('billing_phone');
    if (inputTelefone) {
        monitorarCampoTelefone(inputTelefone, 'msg-step-02');
    }


    // -----------------------------------------------------------
    // Monitora digitação no campo E-mail
    // -----------------------------------------------------------
    monitorarCampoEmail('billing_email', 'msg-step-02');



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


    const btnAvancar2 = document.getElementById("action-step-02");
    btnAvancar2.addEventListener("click", function () {

        // Define campos que precisam ser validados
        const fieldsAdress = [
            { input_name: 'billing_first_name', input_type: 'text', input_msg: 'Informe o seu nome e sobrenome' },
            { input_name: 'billing_phone', input_type: 'text', input_msg: 'Preenhca o telefone de contato no formato solicitado.' },
            { input_name: 'billing_email', input_type: 'email', input_msg: 'Informe o campo e-mail' },                
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

            let acceptTerms = isCheckboxChecked('accept_terms', 'msg-step-02', 'Para prosseguir, você deve aceitar os termos e condições da nossa Política de Privacidade' );
            
            // Se os termos foram aceitos
            if (acceptTerms) {
                alert("Formulário validado com sucesso!");
                console.log("Formulário validado com sucesso!");
            }
            
        }

    });


});
// DOMContentLoaded