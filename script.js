// --- STATE MANAGEMENT ---
let appState = { isPaid: false };

// Initialize
document.addEventListener('DOMContentLoaded', () => {

    const storedState = localStorage.getItem('portal_access');
    if (storedState === 'granted') updateUIForAccess();

    // File input display
    const fileInput = document.getElementById('doc-upload');
    const fileNameSpan = document.getElementById('file-name');

    if(fileInput){
        fileInput.addEventListener('change',(e)=>{
            fileNameSpan.textContent = e.target.files[0]?.name || "No file chosen";
        });
    }

    // Load admin applications
    if(document.getElementById('admin')){
        loadAdminApplications();
    }

});


// --- NAVIGATION ---
function navigateTo(pageId){

    const protectedPages = ['services','application','dashboard'];

    if(protectedPages.includes(pageId) && !appState.isPaid){

        showToast("Access denied. Please unlock premium access.");
        showSection("payment");
        return;
    }

    showSection(pageId);
}

function showSection(pageId){

    document.querySelectorAll(".page-section").forEach(section=>{
        section.classList.remove("active");
    });

    const target = document.getElementById(pageId);

    if(target){
        target.classList.add("active");
    }

    window.scrollTo(0,0);

    if(pageId === "admin"){
        loadAdminApplications();
    }

}


// --- PAYMENT ---
function processPayment(e){

    e.preventDefault();

    const btn = e.target.querySelector('button[type="submit"]');

    btn.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Processing...";
    btn.disabled = true;

    setTimeout(()=>{

        appState.isPaid = true;
        localStorage.setItem("portal_access","granted");

        updateUIForAccess();

        showToast("Payment successful! Premium unlocked.");

        showSection("dashboard");

        btn.innerHTML = "Pay Now";
        btn.disabled = false;

    },2000);

}


function updateUIForAccess(){

    document.querySelectorAll(".nav-link-protected").forEach(link=>{
        link.style.opacity="1";
        link.style.pointerEvents="auto";
    });

    document.getElementById("access-btn").classList.add("hidden");
    document.getElementById("logout-btn").classList.remove("hidden");

    const badge = document.getElementById("user-status-badge");

    badge.textContent = "Premium Member";
    badge.style.background = "#d4edda";
    badge.style.color = "#155724";

}


function logout(){

    appState.isPaid = false;

    localStorage.removeItem("portal_access");

    document.querySelectorAll(".nav-link-protected").forEach(link=>{
        link.style.opacity="0.5";
        link.style.pointerEvents="none";
    });

    document.getElementById("access-btn").classList.remove("hidden");
    document.getElementById("logout-btn").classList.add("hidden");

    const badge = document.getElementById("user-status-badge");

    badge.textContent = "Guest";
    badge.style.background = "#e9ecef";
    badge.style.color = "#555";

    showToast("Logged out successfully");

    showSection("home");

}



// --- APPLICATION FORM ---
async function submitApplication(e){

    e.preventDefault();

    const form = document.getElementById("app-form");
    const formData = new FormData(form);

    const btn = form.querySelector("button");

    btn.innerHTML = "Submitting...";
    btn.disabled = true;

    try{

        const res = await fetch("/apply",{
            method:"POST",
            body:formData
        });

        const data = await res.json();

        showToast(data.message || "Application submitted successfully");

        form.reset();

        const fileName = document.getElementById("file-name");
        if(fileName) fileName.textContent = "No file chosen";

        if(document.getElementById("admin")){
            loadAdminApplications();
        }

        showSection("dashboard");

    }catch(err){

        console.error(err);

        showToast("Error submitting application. Please try again.");

    }

    btn.innerHTML = "Submit Application";
    btn.disabled = false;

}



// --- CONTACT FORM ---
async function sendMessage(e){

    e.preventDefault();

    const form = e.target;

    const data = {
        name:form.name.value,
        email:form.email.value,
        message:form.message.value
    };

    const btn = form.querySelector("button");

    btn.innerHTML = "Sending...";
    btn.disabled = true;

    try{

        const res = await fetch("/contact",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(data)
        });

        const result = await res.json();

        showToast(result.message || "Message sent successfully");

        form.reset();

    }catch(err){

        console.error(err);

        showToast("Error sending message");

    }

    btn.innerHTML = "Send Message";
    btn.disabled = false;

}



// --- ADMIN PANEL ---
async function loadAdminApplications(){

    try{

        const res = await fetch("/admin/applications");

        const applications = await res.json();

        const tbody = document.getElementById("admin-applications-body");

        if(!tbody) return;

        tbody.innerHTML = "";

        applications.forEach(app=>{

            const tr = document.createElement("tr");

            tr.innerHTML = `
            <td>#${app.id}</td>
            <td>${app.full_name}</td>
            <td>${app.company_type}</td>
            <td><span class="status-badge ${app.status.toLowerCase()}">${app.status}</span></td>
            <td><button class="btn-sm">View</button></td>
            `;

            tbody.appendChild(tr);

        });

    }catch(err){

        console.error("Error loading admin applications:",err);

    }

}



// --- TOAST MESSAGE ---
function showToast(message){

    const toast = document.getElementById("toast-message");

    if(!toast) return;

    toast.innerText = message;

    toast.style.display = "block";

    setTimeout(()=>{
        toast.style.display = "none";
    },3000);

}
