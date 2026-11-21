 
const AUTH_USERS_KEY = "fishMarketAccounts";
const AUTH_SESSION_KEY = "fishMarketCurrentUser";

 
function getRegisteredUsers() {
    try {
        return JSON.parse(
            localStorage.getItem(AUTH_USERS_KEY) || "[]"
        );
    } catch (error) {
        return [];
    }
}

 
function saveRegisteredUsers(users) {
    localStorage.setItem(
        AUTH_USERS_KEY,
        JSON.stringify(users)
    );
}
 
function clearAuthErrors() {
    document.querySelectorAll(".auth-error").forEach(error => {
        error.textContent = "";
    });
}
 
function showLogin() {
    document.getElementById("loginPanel")?.classList.remove("hidden");
    document.getElementById("registerPanel")?.classList.add("hidden");

    clearAuthErrors();
}

 
function showRegister() {
    document.getElementById("loginPanel")?.classList.add("hidden");
    document.getElementById("registerPanel")?.classList.remove("hidden");

    resetRegisterSteps();
    clearAuthErrors();
}

 
function resetRegisterSteps() {
    const steps = document.querySelectorAll(".register-step");

    steps.forEach((step, index) => {
        step.classList.toggle("active", index === 0);
    });
}
 
function getCurrentRegisterStep() {
    const steps = document.querySelectorAll(".register-step");

    return Array.from(steps).findIndex(step =>
        step.classList.contains("active")
    );
}

 
function showRegisterError(message) {
    const error = document.getElementById("registerError");

    if (error) {
        error.textContent = message;
    }
}

 
function showLoginError(message) {
    const error = document.getElementById("loginError");

    if (error) {
        error.textContent = message;
    }
}

 
function nextRegisterStep() {

    const steps = document.querySelectorAll(".register-step");
    const currentIndex = getCurrentRegisterStep();

    if (currentIndex < 0 || currentIndex >= steps.length - 1) {
        return;
    }

    const currentStep = steps[currentIndex];
    const inputs = currentStep.querySelectorAll("input");

    for (const input of inputs) {

        if (!input.checkValidity()) {
            input.reportValidity();
            return;
        }

        if (!input.value.trim()) {
            input.focus();
            return;
        }
    }

   
    if (currentIndex === 0) {

        const usernameInput =
            document.getElementById("registerUsername");

        const username = usernameInput.value.trim().toLowerCase();

        const users = getRegisteredUsers();

        const exists = users.some(user =>
            user.username.toLowerCase() === username
        );

        if (exists) {
            showRegisterError("Username already exists.");
            usernameInput.focus();
            return;
        }
    }

    
    if (currentIndex === 1) {

        const emailInput =
            document.getElementById("registerEmail");

        const email = emailInput.value.trim().toLowerCase();

        const users = getRegisteredUsers();

        const exists = users.some(user =>
            user.email.toLowerCase() === email
        );

        if (exists) {
            showRegisterError("Email already registered.");
            emailInput.focus();
            return;
        }
    }

    steps[currentIndex].classList.remove("active");
    steps[currentIndex + 1].classList.add("active");

    clearAuthErrors();
}

 
function previousRegisterStep() {

    const steps = document.querySelectorAll(".register-step");
    const currentIndex = getCurrentRegisterStep();

    if (currentIndex <= 0) {
        return;
    }

    steps[currentIndex].classList.remove("active");
    steps[currentIndex - 1].classList.add("active");

    clearAuthErrors();
}

 
function togglePassword(inputId, button) {

    const input = document.getElementById(inputId);

    if (!input) return;

    if (input.type === "password") {

        input.type = "text";

        if (button) {
            button.textContent = "Hide";
        }

    } else {

        input.type = "password";

        if (button) {
            button.textContent = "Show";
        }
    }
}
 
function registerAccount(event) {

    event.preventDefault();

    const usernameInput =
        document.getElementById("registerUsername");

    const emailInput =
        document.getElementById("registerEmail");

    const passwordInput =
        document.getElementById("registerPassword");

    const confirmInput =
        document.getElementById("confirmPassword");

    if (!usernameInput || !emailInput ||
        !passwordInput || !confirmInput) {
        return;
    }

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    
    if (username.length < 3) {
        showRegisterError(
            "Username must be at least 3 characters."
        );
        return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showRegisterError(
            "Username can only contain letters, numbers, and underscores."
        );
        return;
    }

 
    if (!emailInput.checkValidity()) {
        showRegisterError("Enter a valid email address.");
        return;
    }

 
    if (password.length < 6) {
        showRegisterError(
            "Password must be at least 6 characters."
        );
        return;
    }

    if (password !== confirmPassword) {
        showRegisterError("Passwords do not match.");
        return;
    }

 
    const users = getRegisteredUsers();

    if (users.some(user =>
        user.username.toLowerCase() === username.toLowerCase()
    )) {
        showRegisterError("Username already exists.");
        return;
    }

    if (users.some(user =>
        user.email.toLowerCase() === email
    )) {
        showRegisterError("Email already registered.");
        return;
    }
 
    users.push({
        username: username,
        email: email,
        password: password
    });

    saveRegisteredUsers(users);

    alert("Account created successfully! Please login.");

  
    const loginUsername =
        document.getElementById("loginUsername");

    if (loginUsername) {
        loginUsername.value = username;
    }

    const loginPassword =
        document.getElementById("loginPassword");

    if (loginPassword) {
        loginPassword.value = "";
    }

    showLogin();
}
 
function loginAccount(event) {

    event.preventDefault();

    const usernameInput =
        document.getElementById("loginUsername");

    const passwordInput =
        document.getElementById("loginPassword");

    if (!usernameInput || !passwordInput) {
        return;
    }

    const usernameOrEmail =
        usernameInput.value.trim().toLowerCase();

    const password = passwordInput.value;

    if (!usernameOrEmail || !password) {
        showLoginError(
            "Please enter your username/email and password."
        );
        return;
    }

    const users = getRegisteredUsers();

    const user = users.find(account =>
        account.username.toLowerCase() === usernameOrEmail ||
        account.email.toLowerCase() === usernameOrEmail
    );

    if (!user) {
        showLoginError("Account not found.");
        return;
    }

    if (user.password !== password) {
        showLoginError("Incorrect password.");
        return;
    }

 
    localStorage.setItem(
        AUTH_SESSION_KEY,
        user.username
    );

    openAuthenticatedApp(user.username);
}
 
function openAuthenticatedApp(username) {

    const authScreen = document.getElementById("authScreen");
    const appShell = document.getElementById("appShell");

    authScreen?.classList.add("hidden");
    appShell?.classList.remove("hidden");

    console.log("Logged in as:", username);
 
    renderPrices();
    renderBuyers();
    renderReports();
    renderAnalytics();
    updateDashboard();
}

 
function logout() {

    if (!confirm("Are you sure you want to logout?")) {
        return;
    }

    localStorage.removeItem(AUTH_SESSION_KEY);

    document.getElementById("appShell")?.classList.add("hidden");
    document.getElementById("authScreen")?.classList.remove("hidden");

    document.getElementById("loginForm")?.reset();

    clearAuthErrors();
    showLogin();
}

 
function checkAuthSession() {

    const currentUser =
        localStorage.getItem(AUTH_SESSION_KEY);

    const authScreen =
        document.getElementById("authScreen");

    const appShell =
        document.getElementById("appShell");

    if (currentUser) {

        authScreen?.classList.add("hidden");
        appShell?.classList.remove("hidden");

    } else {

        authScreen?.classList.remove("hidden");
        appShell?.classList.add("hidden");
    }
}
 
function initializeAuthentication() {

    const loginForm =
        document.getElementById("loginForm");

    const registerForm =
        document.getElementById("registerForm");

    if (loginForm) {
        loginForm.addEventListener(
            "submit",
            loginAccount
        );
    }

    if (registerForm) {
        registerForm.addEventListener(
            "submit",
            registerAccount
        );
    }

    checkAuthSession();
}

 
initializeAuthentication();
  
const fishPrices = [

    {fish:"Bangus", market:"Mamburao", price:220, status:"Regional reference"},
    {fish:"Tilapia", market:"Mamburao", price:120, status:"Regional reference"},
    {fish:"Galunggong", market:"Mamburao", price:215, status:"PSA provincial average"},
    {fish:"Lumahan", market:"Mamburao", price:280, status:"BFAR reference"},
    {fish:"Tambakol", market:"Mamburao", price:300, status:"Pending market price"},
    {fish:"Tulingan", market:"Mamburao", price:220, status:"Pending market price"},
    {fish:"Lapu-lapu", market:"Mamburao", price:520, status:"Pending market price"},
    {fish:"Squid", market:"Mamburao", price:200, status:"Pending market price"},

    {fish:"Bangus", market:"Sablayan", price:220, status:"Regional reference"},
    {fish:"Tilapia", market:"Sablayan", price:120, status:"Regional reference"},
    {fish:"Galunggong", market:"Sablayan", price:215, status:"Provincial reference"},
    {fish:"Lumahan", market:"Sablayan", price:280, status:"BFAR reference"},
    {fish:"Tambakol", market:"Sablayan", price:300, status:"Pending market price"},
    {fish:"Tulingan", market:"Sablayan", price:220, status:"Pending market price"},
    {fish:"Lapu-lapu", market:"Sablayan", price:500, status:"Pending market price"},
    {fish:"Squid", market:"Sablayan", price:200, status:"Pending market price"},

    {fish:"Bangus", market:"San Jose", price:220, status:"Regional reference"},
    {fish:"Tilapia", market:"San Jose", price:120, status:"Regional reference"},
    {fish:"Galunggong", market:"San Jose", price:215, status:"Provincial reference"},
    {fish:"Lumahan", market:"San Jose", price:280, status:"BFAR reference"},
    {fish:"Tambakol", market:"San Jose", price:300, status:"Regional reference - verify locally"},
    {fish:"Tulingan", market:"San Jose", price:200, status:"Estimated - verify locally"},
    {fish:"Lapu-lapu", market:"San Jose", price:500, status:"Reference price - verify locally"},
    {fish:"Squid", market:"San Jose", price:180, status:"Historical local reference - verify current price"},

    {fish:"Bangus", market:"Batangas", price:240, status:"DA regional reference"},
    {fish:"Tilapia", market:"Batangas", price:160, status:"DA regional reference"},
    {fish:"Galunggong", market:"Batangas", price:255, status:"PSA Batangas reference"},
    {fish:"Lumahan", market:"Batangas", price:280, status:"BFAR reference"},
    {fish:"Tambakol", market:"Batangas", price:340, status:"Public market comparison"},
    {fish:"Tulingan", market:"Batangas", price:190, status:"Public market comparison"},
    {fish:"Lapu-lapu", market:"Batangas", price:500, status:"Public market comparison"},
    {fish:"Squid", market:"Batangas", price:250, status:"Public market comparison"}

];

 
const buyers = [
    {
        name:"D&L Seafoods",
        address:"Barangay 7, Mamburao",
        type:"BFAR-listed buying station",
        status:"Available"
    },
    {
        name:"Mathy Fish Buyer",
        address:"6HFQ+HH2, Mamburao",
        type:"Buyer listing - verify",
        status:"Available"
    },
    {
        name:"Ricky Fish Buyer",
        address:"Salvador Street, Mamburao",
        type:"Buyer listing - verify",
        status:"Available"
    },
    {
        name:"Mamburao Public Market",
        address:"Rizal Street, Mamburao",
        type:"Public Market",
        status:"Available"
    },
    {
        name:"Sitio Aroma Fishing Port",
        address:"Barangay Tayamaan, Mamburao",
        type:"Fishing Port",
        status:"Available"
    }
];


 
try {
    const savedStatuses = JSON.parse(
        localStorage.getItem("buyerStatuses") || "null"
    );

    if (savedStatuses) {
        buyers.forEach(buyer => {
            if (
                savedStatuses[buyer.name] === "Available" ||
                savedStatuses[buyer.name] === "Unavailable"
            ) {
                buyer.status = savedStatuses[buyer.name];
            }
        });
    }
} catch (error) {
    console.log("Could not load buyer statuses.");
}


function saveBuyerStatuses() {
    const statuses = {};

    buyers.forEach(buyer => {
        statuses[buyer.name] = buyer.status;
    });

    localStorage.setItem(
        "buyerStatuses",
        JSON.stringify(statuses)
    );
}


function getAvailableBuyers() {
    return buyers.filter(
        buyer => buyer.status === "Available"
    );
}

 
let reports = [];

try {
    const savedReports = JSON.parse(
        localStorage.getItem("fishReports") || "[]"
    );

    reports = Array.isArray(savedReports) ? savedReports : [];

} catch (error) {
    reports = [];
}


function saveReports() {
    localStorage.setItem(
        "fishReports",
        JSON.stringify(reports)
    );
}

 

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#39;"
    })[c]);
}


 

function showPage(page, button) {

    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
    });

    document.querySelectorAll("nav button").forEach(b => {
        b.classList.remove("active");
    });

    const selectedPage = document.getElementById(page);

    if (!selectedPage) return;

    selectedPage.classList.add("active");

    if (button) {
        button.classList.add("active");
    }

    if (page === "analytics") renderAnalytics();
    if (page === "report") renderReports();
    if (page === "prices") renderPrices();
    if (page === "buyers") renderBuyers();

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
}

 

function updateMap() {

    const mapSelect = document.getElementById("mapSelect");
    const mapFrame = document.getElementById("mapFrame");

    if (!mapSelect || !mapFrame) return;

    mapFrame.src =
        "https://www.google.com/maps?q=" +
        encodeURIComponent(mapSelect.value) +
        "&output=embed";
}

 

function openMap() {

    const mapButton = document.querySelector(
        'nav button[onclick*="map"]'
    );

    showPage("map", mapButton);
    updateMap();
}

 

function getBuyerMapURL(buyer) {

    const location =
        buyer.name + ", " +
        buyer.address +
        ", Mamburao, Occidental Mindoro, Philippines";

    return "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(location);
}


 

function openBuyerLocation(index) {

    const buyer = buyers[index];

    if (!buyer) return;

    const mapButton = document.querySelector(
        'nav button[onclick*="map"]'
    );

    showPage("map", mapButton);

    const mapFrame = document.getElementById("mapFrame");

    if (mapFrame) {
        const location =
            buyer.name + ", " +
            buyer.address +
            ", Mamburao, Occidental Mindoro, Philippines";

        mapFrame.src =
            "https://www.google.com/maps?q=" +
            encodeURIComponent(location) +
            "&output=embed";
    }

    renderAvailableBuyerMapList();
}


 
function renderAvailableBuyerMapList() {

    const mapFrame = document.getElementById("mapFrame");

    if (!mapFrame) return;

    let buyerMapList = document.getElementById("buyerMapList");

    if (!buyerMapList) {
        buyerMapList = document.createElement("div");
        buyerMapList.id = "buyerMapList";
        mapFrame.insertAdjacentElement("afterend", buyerMapList);
    }

    const availableBuyers = getAvailableBuyers();

    if (availableBuyers.length === 0) {

        buyerMapList.innerHTML = `
            <h3>Available Buyers</h3>
            <p>No buyers are currently marked as available.</p>
        `;

        return;
    }

    buyerMapList.innerHTML = `
        <h3 style="margin-top:20px;">
            Available Buyers (${availableBuyers.length})
        </h3>

        ${availableBuyers.map(buyer => `

            <div class="buyer-card">

                <h3>${escapeHTML(buyer.name)}</h3>

                <p>📍 ${escapeHTML(buyer.address)}</p>

                <p>${escapeHTML(buyer.type)}</p>

                <p style="color:#20bd69;font-weight:bold;">
                    ● Available
                </p>

                <a
                    href="${getBuyerMapURL(buyer)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View on Google Maps
                </a>

            </div>

        `).join("")}
    `;
}


 

function renderPrices() {

    const searchInput = document.getElementById("priceSearch");
    const fishFilter = document.getElementById("fishFilter");
    const marketFilter = document.getElementById("marketFilter");
    const priceList = document.getElementById("priceList");

    if (!searchInput || !fishFilter || !marketFilter || !priceList) return;

    const search = searchInput.value.toLowerCase();
    const fish = fishFilter.value;
    const market = marketFilter.value;

    const filtered = fishPrices.filter(item =>

        (
            item.fish.toLowerCase().includes(search) ||
            item.market.toLowerCase().includes(search)
        ) &&

        (fish === "all" || item.fish === fish) &&
        (market === "all" || item.market === market)

    );

    priceList.innerHTML = filtered.length

        ? filtered.map(item => `

            <div class="price-card">

                <div>
                    <h3>${escapeHTML(item.fish)}</h3>
                    <p>${escapeHTML(item.market)}</p>
                    <small>${escapeHTML(item.status)}</small>
                </div>

                <div class="price-right">
                    ₱${item.price.toLocaleString()}/kg
                </div>

            </div>

        `).join("")

        : "<p>No prices found.</p>";
}


 

document.getElementById("priceSearch")
    ?.addEventListener("input", renderPrices);

document.getElementById("fishFilter")
    ?.addEventListener("change", renderPrices);

document.getElementById("marketFilter")
    ?.addEventListener("change", renderPrices);

 

function renderBuyers() {

    const buyerSearch = document.getElementById("buyerSearch");
    const buyerList = document.getElementById("buyerList");

    if (!buyerSearch || !buyerList) return;

    const search = buyerSearch.value.toLowerCase();

    const filtered = buyers
        .map((buyer, index) => ({
            ...buyer,
            originalIndex:index
        }))
        .filter(b =>
            b.name.toLowerCase().includes(search) ||
            b.address.toLowerCase().includes(search)
        );

    buyerList.innerHTML = filtered.length

        ? filtered.map(b => `

            <div class="buyer-card">

                <h3>${escapeHTML(b.name)}</h3>

                <p>📍 ${escapeHTML(b.address)}</p>

                <p>${escapeHTML(b.type)}</p>

                <p>
                    Status:
                    <strong style="
                        color:${b.status === "Available" ? "#20bd69" : "#e74c3c"};
                    ">
                        ${b.status}
                    </strong>
                </p>

                <button onclick="toggleBuyerStatus(${b.originalIndex})">
                    Set ${b.status === "Available" ? "Unavailable" : "Available"}
                </button>

                <button onclick="openBuyerLocation(${b.originalIndex})">
                    View Location
                </button>

            </div>

        `).join("")

        : "<p>No buyers found.</p>";
}


 

function toggleBuyerStatus(index) {

    const buyer = buyers[index];

    if (!buyer) return;

    buyer.status =
        buyer.status === "Available"
            ? "Unavailable"
            : "Available";

    saveBuyerStatuses();

    renderBuyers();
    updateDashboard();

    if (document.getElementById("buyerMapList")) {
        renderAvailableBuyerMapList();
    }
}


 

document.getElementById("buyerSearch")
    ?.addEventListener("input", renderBuyers);


 

const catchDateInput = document.getElementById("catchDate");

if (catchDateInput) {
    const today = new Date();

    catchDateInput.value =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");
}
 

document.getElementById("catchForm")
    ?.addEventListener("submit", function(e) {

        e.preventDefault();

        const buyerName =
            document.getElementById("sellingLocation").value;

        const selectedBuyer = buyers.find(
            b => b.name === buyerName
        );

        const report = {

            id:Date.now(),

            name:
                document.getElementById("fisherName").value.trim(),

            species:
                document.getElementById("species").value,

            quantity:
                Number(document.getElementById("quantity").value),

            price:
                Number(document.getElementById("sellingPrice").value),

            location:buyerName,

            address:selectedBuyer
                ? selectedBuyer.address
                : "Address not available",

            date:
                document.getElementById("catchDate").value,

            notes:
                document.getElementById("notes").value.trim()
        };

        if (
            report.quantity <= 0 ||
            report.price <= 0 ||
            !report.name ||
            !report.species ||
            !report.location ||
            !report.date
        ) {
            alert("Please complete all fields correctly.");
            return;
        }

        reports.unshift(report);

        saveReports();

        alert("Report submitted successfully!");

        this.reset();

        const today = new Date();

        document.getElementById("catchDate").value =
            today.getFullYear() + "-" +
            String(today.getMonth() + 1).padStart(2, "0") + "-" +
            String(today.getDate()).padStart(2, "0");

        renderReports();
        renderAnalytics();
        updateDashboard();

        const analyticsButton = document.querySelector(
            'nav button[onclick*="analytics"]'
        );

        showPage("analytics", analyticsButton);
    });


 

function renderReports() {

    const container = document.getElementById("myReports");

    if (!container) return;

    container.innerHTML = reports.length

        ? reports.map(r => `

            <div class="report-item">

                <h3>
                    ${escapeHTML(r.species)} - ${r.quantity} kg
                </h3>

                <p>Fisherfolk: ${escapeHTML(r.name)}</p>
                <p>Buyer: ${escapeHTML(r.location)}</p>

                <p>
                    Address: ${escapeHTML(r.address || "Address not available")}
                </p>

                <p>Price: ₱${r.price.toLocaleString()}/kg</p>
                <p>Date: ${escapeHTML(r.date)}</p>

                <p>
                    Total: ₱${(r.quantity * r.price).toLocaleString()}
                </p>

                ${r.notes ? `
                    <p>Notes: ${escapeHTML(r.notes)}</p>
                ` : ""}

                <button onclick="deleteReport(${r.id})">
                    Delete
                </button>

            </div>

        `).join("")

        : "<p>No reports submitted.</p>";
}

 

function deleteReport(id) {

    if (!confirm("Delete this report?")) return;

    reports = reports.filter(r => r.id !== id);

    saveReports();

    renderReports();
    renderAnalytics();
    updateDashboard();
}
 

function renderAnalytics() {

    const totalKg = reports.reduce(
        (sum, r) => sum + r.quantity, 0
    );

    const totalSales = reports.reduce(
        (sum, r) => sum + (r.quantity * r.price), 0
    );

    const average = reports.length
        ? reports.reduce((sum, r) => sum + r.price, 0) / reports.length
        : 0;

    const analyticsCatch = document.getElementById("analyticsCatch");
    const analyticsReports = document.getElementById("analyticsReports");
    const averagePrice = document.getElementById("averagePrice");
    const totalSalesElement = document.getElementById("totalSales");

    if (analyticsCatch) analyticsCatch.textContent = totalKg + " kg";
    if (analyticsReports) analyticsReports.textContent = reports.length;
    if (averagePrice) averagePrice.textContent = "₱" + average.toFixed(2);

    if (totalSalesElement) {
        totalSalesElement.textContent = "₱" + totalSales.toLocaleString();
    }
 

    const totals = {};

    reports.forEach(r => {
        totals[r.species] =
            (totals[r.species] || 0) + r.quantity;
    });

    const max = Math.max(1, ...Object.values(totals));

    const speciesChart = document.getElementById("speciesChart");

    if (speciesChart) {

        speciesChart.innerHTML = Object.entries(totals).length

            ? Object.entries(totals).map(([name, kg]) => `

                <p>${escapeHTML(name)} - ${kg} kg</p>

                <div style="
                    height:12px;
                    background:#edf1f5;
                    border-radius:20px;
                    margin:8px 0 15px;
                ">

                    <div style="
                        height:12px;
                        width:${kg / max * 100}%;
                        background:#079bd5;
                        border-radius:20px;
                    "></div>

                </div>

            `).join("")

            : "<p>No catch data available.</p>";
    }

 
    const analyticsList = document.getElementById("analyticsList");

    if (analyticsList) {

        analyticsList.innerHTML = reports.length

            ? reports.map(r => `

                <div class="report-item">

                    <h3>
                        ${escapeHTML(r.species)} - ${r.quantity} kg
                    </h3>

                    <p>Fisherfolk: ${escapeHTML(r.name)}</p>
                    <p>Buyer: ${escapeHTML(r.location)}</p>

                    <p>
                        Address: ${escapeHTML(r.address || "Address not available")}
                    </p>

                    <p>Price: ₱${r.price.toLocaleString()}/kg</p>
                    <p>Date: ${escapeHTML(r.date)}</p>

                    <p>
                        Total: ₱${(r.quantity * r.price).toLocaleString()}
                    </p>

                    ${r.notes ? `
                        <p>Notes: ${escapeHTML(r.notes)}</p>
                    ` : ""}

                    <button onclick="deleteReport(${r.id})">
                        Delete
                    </button>

                </div>

            `).join("")

            : "<p>No reports submitted yet.</p>";
    }
}


 

function updateDashboard() {

    if (fishPrices.length > 0) {

        const highest = fishPrices.reduce(
            (a, b) => a.price > b.price ? a : b
        );

        const lowest = fishPrices.reduce(
            (a, b) => a.price < b.price ? a : b
        );

        document.getElementById("highest").textContent =
            "₱" + highest.price;

        document.getElementById("highestFish").textContent =
            highest.fish + " - " + highest.market;

        document.getElementById("lowest").textContent =
            "₱" + lowest.price;

        document.getElementById("lowestFish").textContent =
            lowest.fish + " - " + lowest.market;
    }

    const totalCatch = reports.reduce(
        (sum, r) => sum + r.quantity, 0
    );

    document.getElementById("totalCatch").textContent =
        totalCatch + " kg";
 

    const availableCount = getAvailableBuyers().length;

    document.getElementById("buyerCount").textContent =
        availableCount;

     

    const homeMarkets = document.getElementById("homeMarkets");

    if (homeMarkets) {
        homeMarkets.innerHTML = `

            <div class="card">
                <h3>Mamburao Public Market</h3>
                <p>Rizal Street, Mamburao</p>
            </div>

            <div class="card">
                <h3>Sitio Aroma Fishing Port</h3>
                <p>Barangay Tayamaan, Mamburao</p>
            </div>

        `;
    }
 

    const homeBuyers = document.getElementById("homeBuyers");

    if (homeBuyers) {

        homeBuyers.innerHTML = buyers.slice(0, 3).map(b => {

            const index = buyers.indexOf(b);

            return `

                <div class="card">

                    <h3>${escapeHTML(b.name)}</h3>

                    <p>${escapeHTML(b.address)}</p>

                    <p style="
                        color:${b.status === "Available" ? "#20bd69" : "#e74c3c"};
                        font-weight:bold;
                    ">
                        ● ${b.status}
                    </p>

                    <button onclick="openBuyerLocation(${index})">
                        View Location
                    </button>

                </div>

            `;

        }).join("");
    }
}


 
function openHighestPrice() {

    if (!fishPrices.length) return;

    const highest = fishPrices.reduce(
        (a, b) => b.price > a.price ? b : a
    );

    document.getElementById("priceSearch").value = highest.fish;
    document.getElementById("fishFilter").value = "all";
    document.getElementById("marketFilter").value = highest.market;

    const pricesButton = document.querySelector(
        'nav button[onclick*="prices"]'
    );

    showPage("prices", pricesButton);
    renderPrices();
}


 

function openLowestPrice() {

    if (!fishPrices.length) return;

    const lowest = fishPrices.reduce(
        (a, b) => b.price < a.price ? b : a
    );

    document.getElementById("priceSearch").value = lowest.fish;
    document.getElementById("fishFilter").value = "all";
    document.getElementById("marketFilter").value = lowest.market;

    const pricesButton = document.querySelector(
        'nav button[onclick*="prices"]'
    );

    showPage("prices", pricesButton);
    renderPrices();
}


 
function openTotalCatch() {

    const reportButton = document.querySelector(
        'nav button[onclick*="report"]'
    );

    showPage("report", reportButton);

    renderReports();

    const reportsSection = document.getElementById("myReports");

    if (reportsSection) {
        reportsSection.scrollIntoView({
            behavior:"smooth",
            block:"start"
        });
    }
}


 

function openAllBuyerLocations() {

    const mapButton = document.querySelector(
        'nav button[onclick*="map"]'
    );

    showPage("map", mapButton);

    const availableBuyers = getAvailableBuyers();
    const mapFrame = document.getElementById("mapFrame");

    if (availableBuyers.length > 0 && mapFrame) {

        const firstBuyer = availableBuyers[0];

        const location =
            firstBuyer.name + ", " +
            firstBuyer.address +
            ", Mamburao, Occidental Mindoro, Philippines";

        mapFrame.src =
            "https://www.google.com/maps?q=" +
            encodeURIComponent(location) +
            "&output=embed";

    } else if (mapFrame) {

        mapFrame.src =
            "https://www.google.com/maps?q=Mamburao,Occidental+Mindoro&output=embed";
    }

    renderAvailableBuyerMapList();
}

 

renderPrices();
renderBuyers();
renderReports();
renderAnalytics();
updateDashboard();

 

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const chatSendButton = document.getElementById("chatSendButton");

 
const CHATBOT_API_URL = "http://localhost:3000/api/chat";
 
let chatHistory = [];


 

function addChatMessage(message, sender) {

    if (!chatMessages) return null;

    const messageDiv = document.createElement("div");

    messageDiv.className =
        sender === "user"
            ? "chat-message user-message"
            : "chat-message bot-message";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = sender === "user" ? "You" : "AI";

    const content = document.createElement("div");
    content.className = "message-content";

    const name = document.createElement("strong");

    name.textContent = sender === "user"
        ? "You"
        : "FishMarket AI";

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    content.appendChild(name);
    content.appendChild(paragraph);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    chatMessages.appendChild(messageDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageDiv;
}


 

function getFishMarketContext() {

    return {

        fishPrices: fishPrices,

        buyers: buyers,

        reports: reports.slice(-10)

    };
}


 

async function sendChatMessage(message) {

    const userMessage = message.trim();

    if (!userMessage) return;

    if (!chatMessages || !chatInput || !chatSendButton) {
        console.error("Chatbot HTML elements were not found.");
        return;
    }

    addChatMessage(userMessage, "user");

    chatHistory.push({
        role: "user",
        content: userMessage
    });

    chatInput.value = "";

    chatSendButton.disabled = true;
    chatSendButton.textContent = "Sending...";

    const loadingMessage = addChatMessage(
        "Please wait. I'm preparing your answer...",
        "bot"
    );

    try {

        const response = await fetch(CHATBOT_API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                message: userMessage,

                history: chatHistory.slice(-10, -1),

                context: JSON.stringify(getFishMarketContext())

            })

        });

        const data = await response.json();

        if (loadingMessage) {
            loadingMessage.remove();
        }

        if (!response.ok) {

            throw new Error(
                data.error || "Unable to get an AI response."
            );

        }

        const aiReply = data.fallbackMode
            ? "LOCAL MODE (no API credits)\\n\\n" + data.reply
            : data.reply;

        if (!aiReply) {
            throw new Error("The AI returned an empty response.");
        }

        addChatMessage(aiReply, "bot");

        chatHistory.push({

            role: "assistant",

            content: aiReply

        });

      
        chatHistory = chatHistory.slice(-10);

    } catch (error) {

        if (loadingMessage) {
            loadingMessage.remove();
        }

        console.error("Chatbot error:", error);

        addChatMessage(
            "Sorry, I couldn't connect to the AI server. Please check if your backend is running and try again.",
            "bot"
        );

    } finally {

        chatSendButton.disabled = false;
        chatSendButton.textContent = "Send";

        chatInput.focus();

    }
}

 

if (chatForm && chatInput && chatSendButton) {

    chatForm.addEventListener("submit", function(event) {

        event.preventDefault();

        sendChatMessage(chatInput.value);

    });

} else {

    console.warn(
        "Chatbot elements not found. Check the chatbot section in index.html."
    );

}
