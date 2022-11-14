const socket = io('ws://localhost:3000', {transports: ['websocket', 'polling', 'flashsocket']});
socket.on('connect', function () { 
    console.log('socket connected'); 
});

function login() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    if(email === '' || password === '') {
        document.getElementById('auth-alert').innerHTML = "email или пароль не указаны";
    } else {
        socket.emit('login', {email: email, password: password});
    }
}

socket.on('login', (data) => {
    if(data = true) {
        document.getElementById('auth-alert').innerHTML = "Вы вошли";
    } else {
        document.getElementById('auth-alert').innerHTML = "Неверный пароль!";
    }
})


    // socket.emit('getJournal', 'Exam');
    // socket.emit('getPortfolio');
// socket.on('journal', (data) => {
//     console.log(data);
// })

// socket.on('portfolio', (data) => {
//     console.log(data)
// })