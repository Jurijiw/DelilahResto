const bcryptjs = require('bcryptjs');
const { createUsersModel } = require('../model/models/users');
const { createStatusModel } = require('../model/models/status');

async function initialize() {
    initializeAdminUser();

    initializeStatus('Pendiente', 1);
    initializeStatus('Confirmado', 2);
    initializeStatus('En preparacion', 3);
    initializeStatus('Enviado', 4);  
    initializeStatus('Entregado', 5);
}

async function initializeAdminUser(params) {
    const User = createUsersModel();
    const current = await User.findOne({
        where: {
            username: 'admin'
        }
    });
    if(!current) {
        try {
            const password = 'Mimamamemima123*';
            const salt = bcryptjs.genSaltSync();
            passwordEncrypt = bcryptjs.hashSync(password, salt);

            const user = await User.create({
                username: 'admin',
                name: 'Lia Jurijiw',
                email: 'ljurijiw@gmail.com',
                phoneNumber: 2222336699,
                password: passwordEncrypt,
                admin: true,
                active: true,
                addresses: [
                    {
                        street: 'Almafuerte',
                        number: 645,
                        city: 'Rio Grande',
                        province: 'TDF'
                    }
                ]
            });
            console.log(user);
        } catch (error) {
            console.log(error)
        }
    }
}

async function initializeStatus(status, idNumber) {
    const Status = createStatusModel();

    let current = await Status.findOne({ where: { detail: status }});
    if(!current) {
        try {
            const statusAdded = await Status.create({
                detail: status,
                idNumber: idNumber
            });
        } catch (error) {
            console.log(error)
        }
    }
}
module.exports = {
    initialize,
}


