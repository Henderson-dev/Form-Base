
document.addEventListener("DOMContentLoaded", function () {

    // ------------------------------------------------------
    // Função que recebe ID e Value dos campos para preencher
    // ------------------------------------------------------
    function preencherFormulario(campos) {
        campos.forEach(([id, value, type = "text"]) => {
            let input = document.getElementById(id);
            if (input) {
                if (type === "select") {
                    input.value = value;
                } else if (type === "checkbox") {
                    input.checked = Boolean(value);
                } else {
                    input.value = value;
                }
            }
        });
    }

    // Exemplo de array com os campos a serem preenchidos
    const camposParaPreencher = [
        
        ["billing_first_name", "João Silva"],
        ["billing_phone", "(99) 99999-9999"],
        ["billing_email", "joao@email.com"],
        ["accept_terms", true, "checkbox"],
        ["billing_persontype", "2", "select"],
        ["billing_cnpj", "57.937.689/0001-00"],
        ["billing_cpf", "074.718.000-89"],
        ["billing_company", "Empresa Ltda"],
        ["billing_postcode", "31080-310"],
        ["billing_address_1", "Rua Nova Serrana"],
        ["billing_number", "50"],
        ["billing_neighborhood", "Santa Inês"],
        ["billing_state", "MG", "select"],
        ["billing_city", "Belo Horizonte", "select"]

    ];


    // Preecher campos do formulário automaticamente
    preencherFormulario(camposParaPreencher);

});