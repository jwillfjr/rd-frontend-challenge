(() => {
    const selector = selector => {
        return document.querySelector(selector)
    }
    const create = element => {
        return document.createElement(element)
    }

    const app = selector('#app');

    const Login = create('div');
    Login.classList.add('login');

    const Logo = create('img');
    Logo.src = './assets/images/logo.svg';
    Logo.classList.add('logo');

    const Form = create('form');

    Form.onsubmit = async e => {
        e.preventDefault();
        const [email, password] = e.target.children;

        const { url } = await fakeAuthenticate(email.value, password.value);

        location.href = '#users';

        const users = await getDevelopersList(url);
        renderPageUsers(users);
    };

    Form.oninput = e => {
        const [email, password, button] = e.target.parentElement.children;
        (!email.validity.valid || !email.value || password.value.length <= 5)
            ? button.setAttribute('disabled', 'disabled')
            : button.removeAttribute('disabled');
    };

    Form.innerHTML = `
            <form>
                <input type="email" placeholder="Entre com seu e-mail"/>
                <input type="password" minlength="5" placeholder="Digite sua senha super secreta"/>
                <button type="submit" disabled>Entrar</button>
            </form>
    `


    app.appendChild(Logo);
    Login.appendChild(Form);

    async function requestMocky(url) {
        const myHeaders = new Headers();
        myHeaders.append("Connection", "keep-alive");
        myHeaders.append("Cache-Control", "max-age=0");
        myHeaders.append("DNT", "1");
        myHeaders.append("Upgrade-Insecure-Requests", "1");
        myHeaders.append("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36");
        myHeaders.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9");
        myHeaders.append("Accept-Language", "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7");

        const requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        return await fetch(url, requestOptions)
            .then(response => response.json())
            .catch(error => console.log('error', error));
    }

    async function fakeAuthenticate(email, password) {

        const data = await requestMocky("http://www.mocky.io/v2/5dba690e3000008c00028eb6");

        const fakeJwtToken = `${btoa(email + password)}.${btoa(data.url)}.${(new Date()).getTime() + 300000}`;

        localStorage.setItem('token', fakeJwtToken);

        return data;
    }

    async function getDevelopersList(url) {
        return await requestMocky(url);
    }

    function renderPageUsers(users) {
        app.classList.add('logged');
        Login.style.display = 'none';/* trecho omitido */

        const Ul = create('ul');
        Ul.classList.add('container')

        for (const user of users) {
            const li = create('li');

            const userEle = create('div');
            userEle.classList.add('user');

            const divImg = create('div');
            divImg.classList.add('div-avatar');

            const img = create('img');
            img.classList.add('avatar');
            img.src = user.avatar_url;
            
            divImg.appendChild(img);

            const p = create('p');
            p.innerHTML = user.login;

            userEle.appendChild(divImg);
            userEle.appendChild(p);

             li.appendChild(userEle);
             Ul.appendChild(li);
            //Ul.appendChild(userEle);


        }

        app.appendChild(Ul)
    }

    // init
    (async function () {
        const rawToken = localStorage.getItem('token');
        const token = rawToken ? rawToken.split('.') : null
        if (!token || token[2] < (new Date()).getTime()) {
            localStorage.removeItem('token');
            location.href = '#login';
            app.appendChild(Login);
        } else {
            location.href = '#users';
            const users = await getDevelopersList(atob(token[1]));
            renderPageUsers(users);
        }
    })()
})()