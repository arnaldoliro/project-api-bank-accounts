// modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

//modulos internos
const fs = require('fs')

console.log('Iniciamos o Accounts')

operation()

function operation() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'action',
                message: 'O que você deseja fazer?',
                choices: 
                [
                    'Criar Conta', 
                    'Deletar Conta', 
                    'Consultar Saldo', 
                    'Depositar', 
                    'Sacar',
                    'Transferência',
                    'Sair'
                ],
            },
        ])
        .then((answer) => {
            const action = answer['action']

            if (action === 'Criar Conta') {
                createAccount()
            }
            else if(action === 'Deletar Conta') {
                deleteAccount()
            }
            else if(action === 'Depositar'){
                deposit()
            }
            else if(action === 'Consultar Saldo'){
                getAccountBalance()
            }
            else if(action === 'Sacar'){
                withdraw()
            }
            else if (action === 'Transferência') {
                transfer()
            }
            else if(action === 'Sair'){
                console.log(chalk.bgBlue.black('Obrigado por usar o accounts!'))
                process.exit()
            }
        })
        .catch((err) => console.log(err))
}

// create an account
function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))

    buildAccount();
}

function buildAccount() {
    inquirer
        .prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para sua conta:'
        }
    ])
    .then(answer => {
        const accountName = answer['accountName']
        console.info(accountName)

        if(!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if(fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Esta conta já existe, escolha outro nome!'))

            buildAccount();
            return
        }
        
        fs.writeFileSync(
            `accounts/${accountName}.json`, 
            '{"balance": 0}',
            function (err){
                console.log(err)
            },
        )

        console.log(chalk.green('Parabéns a sua conta foi criada'))
        operation()
    })
    .catch((err) => console.log(err))
}

// add an amount to user account

function deposit() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ])
    .then(function(answer) {
        const accountName = answer['accountName']
        
        if(!checkAccount(accountName)) {
            return deposit()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja depositar?'
            }
        ])
        .then(function(answer) {
            const amount = parseFloat(answer['amount'])

            if(addAmount(accountName, amount) === false){
                return deposit()
            }

            
        console.log(chalk.green(`Foi depositado um valor de R$${amount} na sua conta!`))

            operation()
        })
        .catch(err => console.log(err))

    })
    .catch(err => console.log(err))
}

//verify if account exists
function checkAccount(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Esta conta não existe, tente novamente'))
        return false
    }
    return true
}

// add an amount
function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return false
    }
    else if(amount < 0) {
        console.log(chalk.bgRed.black('O valor do depósito precisa ser um número real positivo!'))
        return false
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err) {
            console.log(err)
        },
    )
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })
    
    return JSON.parse(accountJSON)
}

// show account balance
function getAccountBalance() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ])
    .then(function(answer) {
        const accountName = answer['accountName']

        if(!checkAccount(accountName)) {
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(
            `Olá o saldo da sua conta é de R$${accountData.balance}`,

        ),
    )
    operation()
    })
    .catch(err => console.log(err))
}

// withdraw an amount from user account
function withdraw () {
    inquirer.prompt([
        {
            name: 'accountName', 
            message: 'Qual o nome da sua conta?'
        }
    ]).then(function(answer) {
        const accountName = answer['accountName']

        if(!checkAccount(accountName)) {
            return withdraw()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja sacar?'
            }
        ]).then(function(answer) {
            const amount = answer['amount']

            if(removeAmount(accountName, amount) === false){
                return withdraw()
            }
            
            console.log(chalk.green(`Foi efetuado um saque de R$${amount} da sua conta!`))

            operation()

        }).catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

function removeAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    amount = parseFloat(amount)

    if (!amount || amount < 0) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return false
    }
    else if (accountData.balance < amount) {
        console.log(chalk.bgRed.black('Sem saldo suficiente'))
        return false
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err) {
            console.log(err)
        }
    )
}

// transfer an amount

function transfer() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
            ]).then(function(answer) {
                const accountName = answer['accountName']

                if(!checkAccount(accountName)) {
                    return transfer()
                }
                inquirer.prompt([
                    {
                        name: 'accountName',
                        message: 'Qual o nome da conta de destino?'
                    }
                ]).then(function(answer) {
                    const accountDest = answer['accountName']
    
                    if(!checkAccount(accountDest)) {
                        return transfer()
                    }

                    else if(accountDest === accountName) {
                        console.log(chalk.bgRed.black('Não pode efetuar uma transferência para a própria conta!'))
                        return transfer()
                    }
                    
                    inquirer.prompt([
                        {
                            name: 'amount',
                            message: 'Quanto você quer transferir?'
                        }
                        
                    ]).then(function(answer) {
                        const amount = parseFloat(answer['amount'])
                        
                        if(removeAmount(accountName, amount) === false) {
                            return transfer()
                        }
                        
                        else if(addAmount(accountDest, amount) === false) {
                            return transfer()
                        }

                        console.log(chalk.green('Transferência realizada com sucesso!'))

                        operation()

                    }).catch(err => console.log(err))
                }).catch(err => console.log(err))
            }).catch(err => console.log(err))
}

// delete an account
function deleteAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual a conta gostaria de deletar?'
        }
    ]).then(function(answer) {
        const accountName = answer['accountName']
        
        if(!checkAccount(accountName)) {
            return deleteAccount()
        }

        inquirer.prompt([
            {
                name: 'verify',
                message: 'Todos os dados serão perdidos, certeza que deseja prosseguir? Y/N'
            }
        ]).then(function(answer) {

            const verify = answer['verify']

            if(verify === 'Sim' || verify === 'sim' || verify === 'Y' || verify ==='Yes' || verify === 'yes' || verify === 'S' || verify === 'y' || verify === 's') {
                fs.unlinkSync
                (
                    `accounts/${accountName}.json`,
                    function(err) {
                        console.log(err)
                    }
                )
            }
            else if(verify == 'Não' || verify === 'não' || verify === 'N' || verify === 'No' || verify === 'no' || verify === 'Nao' || verify === 'nao' || verify === 'n') {
                return operation()
            }
            else{
                console.log(chalk.bgYellow.black('Digite Sim ou Não para confirmar sua resposta'))
                return deleteAccount()
            }

            operation()

        }).catch(err => console.log(err))
    }).catch(err => console.log(err))
}