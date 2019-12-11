const localStorage = window.localStorage;
const pubRoot = new axios.create({baseurl:"http://localhost:3000/public"});
const privateRoot = new axios.create({baseurl:"http://localhost:3000/private"});
const userRoot = new axios.create({baseurl:"http://localhost:3000/account"});

const renderNavbar = function(loggedIn) {
    let element = '';
    if(loggedIn) {
        element = `<div class="navbar-brand">
                    <a class="navbar-item" href="/"><img src="/otter.png" width="50" height="50"></a>
                </div>
                <div class="navbar-menu">
                        <div class="navbar-start">
                            <div class="navbar-item"><a class="navlink">Profile</a></div>
                            <div class="navbar-item"><a class="navlink" href="/messages.html">Messages</a></div>
                            <div class="navbar-item"><a class="navlink" href="/post-job-page.html">Post Job</a></div>
                            <div class="navbar-item"><a class="navlink" href="/jobs.html">Jobs</a></div>
                        </div>
                    <div class="navbar-end">
                        <div class="navbar-item"><a class="navlink">Logout</a></div>
                    </div>
                </div>`
    } else {
        element = `<div class="navbar-brand">
                    <a class="navbar-item" href="/"><img src="/otter.png" width="50" height="50"></a>
                </div>
                <div class="navbar-menu">
                    <div class="navbar-start">
                        <div class="navbar-item">Job Listings</div>
                    </div>
                <div class="navbar-end">
                    <div class="navbar-item">Login/Register</div>
                </div>
            </div>`
    }
    const navroot = $("#navbar-root");
    navroot.append(element);
}

const renderMessages = function(messages) {
    const messageroot = $("#messages-root");
    const jobroot = $("#jobs-root");
    for(let i = 0; i < messages.length; i++) {
        let message = messages[i]
        let element = `<div class="box" id="`.concat(messages.id, `"><div class="media content"><span class="sender"><strong>`, message.from.name, 
        `</strong></span></div><div class="content"><span id="`, message.id, `-body">`, message.body, `</span></div></div>`);
        jobroot.append(element);
    }
}

const submitPostingEventHandler = function(event) {
    let job = {
        title: $('#title').val(),
        description: $('#description').val(),
        address: $('#address').val(),
        town: $('#town').val(),
        zip: $('#zip').val(),
        accepted: false        
    }
    console.log("was called.");
    createJob('Nick', job);
}

async function createJob(username, job) {
    const pubResult = await pubRoot.post('http://localhost:3000/public/'.concat(username,'/jobs'), {
        "data": [{"title":job.title,"description":job.description, "address": job.address, "town": job.town, "zip": job.zip}],
        "type": "merge"
    });
    const privResult = await axios({
        method:"POST",
        url:'http://localhost:3000/private/'.concat(username,'/',job.id),
        headers: {'Authorization': 'Bearer '.concat(localStorage.getItem('jwt'))},
        data: {
            "data": {
                "title":job.title,
                "description":job.description,
                "address": job.address,
                "town": job.town,
                "zip": job.zip,
                "accepted":false
            }
        }
    });
    const userResult = await axios({
        method:"POST",
        url:'http://localhost:3000/user/'.concat(job.id),
        headers: {'Authorization': 'Bearer '.concat(localStorage.getItem('jwt'))},
        data: {
            "data": {
                "title":job.title,
                "description":job.description,
                "address": job.address,
                "town": job.town,
                "zip": job.zip,
                "accepted":false,
                "messages":[{
                    "time":"Test time",
                    "body":"Test inquiry",
                    "from":{
                        "name":"Test user"
                    }
                }, {"time":"test time 2",
                    "body":"test response",
                    "from":{
                        "name":username
                    }
                }]
            }
        }
    });
}

async function deleteJob(username, id) {
    const pubResult = await axios({
        method:'DELETE',
        url:'http://localhost:3000/public/'.concat(username,'/',id),
    });
    const privResult = await axios({
        method:'DELETE',
        url:'http://localhost:3000/private/'.concat(username,'/',id),
    });
    const userResult = await axios({
        method:'DELETE',
        url:'http://localhost:3000/user/'.concat(id),
    });
}

async function getMessages(id) {
    const job = await pubRoot.get('/jobs/'.concat(id));
    renderMessages(job.data.result.messages);
}

async function createUser(user) {
    const result = await axios({
        method:'POST',
        url:'http://localhost:3000/account/create',
        data: {
            "name":user.name,
            "pass":user.pass,
            "data": {"email":user.email}
        }
    });
    console.log(result.data);
}

async function loginUser(user) {
    const result = await axios({
        method:'POST',
        url:'http://localhost:3000/account/login',
        data: {
            "name":user.name,
            "pass":user.pass
        }
    });
    localStorage.setItem('jwt', result.data.jwt);
    return result;
}



$(function() {
    const $formroot = $('#f-container');
    let user = {name:"Nick", pass:"pass123",email:"Nick@nick.com"};
    let job = {id:"2", title: "Test title 2", description:"Test description 2.", address:"sd", town:"sld", zip:"sdf"};
    // createUser(user);
    loginUser(user);
    // createJob('Nick', job);
    // console.log("did it!");
    $formroot.on('click', ".button.is-primary", submitPostingEventHandler);
    //deleteJob('nick','1');
    renderNavbar(true);
});