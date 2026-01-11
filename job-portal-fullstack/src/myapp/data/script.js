document.getElementById('contactForm').addEventListener('submit', function(e){
  e.preventDefault();
  
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const result = document.getElementById('formResult');

  // Simple client-side validation
  if(!name || !email || !message){
    result.textContent = 'Please fill all fields.';
    result.style.color = 'crimson';
    return;
  }

  // Simulate sending
  result.textContent = 'Sending...';
  result.style.color = 'black';
  
  setTimeout(()=>{
    result.textContent = 'Thanks, ' + (name||'friend') + '! Your application/message was received.';
    result.style.color = 'green';
    document.getElementById('contactForm').reset();
  }, 800);
});

/* Authentication helpers for demo (localStorage-based) */

function getUsers(){
  return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users){
  localStorage.setItem('users', JSON.stringify(users));
}

document.addEventListener('DOMContentLoaded', function(){
  const API_BASE = 'http://localhost:8080';
  function apiFetch(path, opts={}){
    opts.credentials = 'include';
    opts.headers = Object.assign({'Content-Type':'application/json'}, opts.headers || {});
    if (opts.body && typeof opts.body === 'object') opts.body = JSON.stringify(opts.body);
    return fetch(API_BASE + path, opts).then(r => r.json().then(b => ({ok:r.ok, status:r.status, body:b})).catch(()=>({ok:r.ok, status:r.status, body:null})));
  }

  // Signup (calls backend)
  const signupForm = document.getElementById('signupForm');
  if(signupForm){
    signupForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const name = signupForm.querySelector('#signupName').value.trim();
      const email = signupForm.querySelector('#signupEmail').value.trim().toLowerCase();
      const password = signupForm.querySelector('#signupPassword').value;
      const confirm = signupForm.querySelector('#signupConfirm').value;
      const role = signupForm.querySelector('#signupRole').value || 'JobSeeker';
      const msg = signupForm.querySelector('.formMsg');

      if(!name || !email || !password || !confirm){
        msg.textContent = 'Please fill all fields.';
        msg.className = 'formMsg error';
        return;
      }
      if(password !== confirm){
        msg.textContent = 'Passwords do not match.';
        msg.className = 'formMsg error';
        return;
      }

      const res = await apiFetch('/api/auth/register', {method:'POST', body:{username: email, email, password, role}});
      if(!res.ok){
        msg.textContent = res.body || ('Error: ' + res.status);
        msg.className = 'formMsg error';
        return;
      }
      msg.textContent = 'Account created. Redirecting to login...';
      msg.className = 'formMsg success';
      setTimeout(()=> location.href = 'login.html', 900);
    });
  }

  // Login (calls backend, cookie set by server)
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const email = loginForm.querySelector('#loginEmail').value.trim().toLowerCase();
      const password = loginForm.querySelector('#loginPassword').value;
      const msg = loginForm.querySelector('.formMsg');

      const res = await apiFetch('/api/auth/login', {method:'POST', body:{email, password}});
      if(!res.ok){
        msg.textContent = res.body || ('Error: ' + res.status);
        msg.className = 'formMsg error';
        return;
      }
      const user = res.body;
      // store minimal user info locally (token is HttpOnly cookie)
      localStorage.setItem('loggedInUser', JSON.stringify({name: user.username, role: user.role}));
      msg.textContent = 'Login successful! Redirecting...';
      msg.className = 'formMsg success';
      setTimeout(()=>{
        if(user.role === 'Employer') location.href = 'employer.html';
        else location.href = 'jobseeker.html';
      }, 800);
    });
  }

  // Get current user from server (me) and update header
  const userBanner = document.getElementById('userBanner');
  async function refreshUserBanner(){
    if(!userBanner) return;
    const res = await apiFetch('/api/auth/me', {method:'GET'});
    if(!res.ok){
      userBanner.innerHTML = '<a href="login.html">Login</a> • <a href="signup.html">Sign Up</a>';
      return;
    }
    const u = res.body;
    const dashboardHref = (u.role === 'Employer') ? 'employer.html' : 'jobseeker.html';
    userBanner.innerHTML = 'Welcome, ' + u.username + ' • <a href="'+dashboardHref+'">Dashboard</a> • <a id="logoutLink" href="#">Logout</a>';
    const logout = document.getElementById('logoutLink');
    logout.addEventListener('click', async function(e){
      e.preventDefault();
      await apiFetch('/api/auth/logout', {method:'POST'});
      localStorage.removeItem('loggedInUser');
      location.href = 'index.html';
    });
  }

  refreshUserBanner();
});