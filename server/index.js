const axios = require('axios');
const querystring = require('querystring');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const io = require('socket.io')(3000);
console.log('server started');
const jar = new CookieJar();


io.on('connection', (socket) => { 
  const client = wrapper(axios.create({ jar }));

  socket.on('login', function(data){
    client({
        method: 'GET',
        url: 'https://sksi.ru/Account/Login',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.124 YaBrowser/22.9.5.716 Yowser/2.5 Safari/537.36' 
        }
      })
      .then(function (response) {
        const DOM = new JSDOM(response.data);
        const setCookie = response.headers['set-cookie'];
        const loginToken = DOM.window.document.getElementsByName("__RequestVerificationToken")[0].value
        client({
            method: 'POST',
            url: 'https://sksi.ru/Account/Login',
            withCredentials: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.124 YaBrowser/22.9.5.716 Yowser/2.5 Safari/537.36',
                'Cookie': setCookie,
              },
            data: querystring.stringify({
                Email: data.email,
                Password: data.password,
                __RequestVerificationToken: loginToken
            })
          })
          .then(function (response) {
            if (response.request._redirectable._currentUrl === 'https://sksi.ru/') {
              socket.emit('login', true);
            } else {
              socket.emit('login', false);
            }
          })
    })
  });

  socket.on('getJournal', (data) => {
    if(data === 'Journal') {
      client({
        method: 'GET',
        url: 'https://sksi.ru/JournalStudent'
      })
      .then(function (response) {
        const DOM = new JSDOM(response.data);
        let studentId = DOM.window.document.getElementsByClassName('studentId')[0].id;
        let subs = [];
        for(let i = 0; i < DOM.window.document.getElementById('Disciplines').getElementsByTagName('option').length; i++) {
          subs[i] = {subs: DOM.window.document.getElementById('Disciplines').getElementsByTagName('option')[i].innerHTML, id: DOM.window.document.getElementById('Disciplines').getElementsByTagName('option')[i].value}
        }
        socket.emit('journal', subs);
      }) 
    } else {
      client({
        method: 'GET',
        url: 'https://sksi.ru/ExamStudent'
      })
      .then(function (response) {
        const DOM = new JSDOM(response.data);
        let studentId = DOM.window.document.getElementsByClassName('studentId')[0].id;
        let subs = [];
        for(let i = 0; i < DOM.window.document.getElementById('EduYears').getElementsByTagName('option').length; i++) {
          subs[i] = {subs: DOM.window.document.getElementById('EduYears').getElementsByTagName('option')[i].innerHTML, id: DOM.window.document.getElementById('EduYears').getElementsByTagName('option')[i].value}
        }
        socket.emit('journal', subs);
      }) 
    }
  })

  socket.on('getPortfolio', () => {
    client({
      method: 'GET',
      url: 'https://sksi.ru/Portfolio/GetCurrentStudentPortfolio/'
    })
    .then(function (response) {
      const DOM = new JSDOM(response.data);
      socket.emit('portfolio', DOM.window.document.getElementById('work_range').innerHTML);
    }) 
  })
})
