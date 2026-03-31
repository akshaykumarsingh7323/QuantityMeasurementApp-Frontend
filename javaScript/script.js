// ===================== AUTH STATE =====================
let users = JSON.parse(localStorage.getItem("qm_users") || "[]");
let currentUser = null;
let loginMethod = "email";

function saveUsers() {
  localStorage.setItem("qm_users", JSON.stringify(users));
}

// ===================== TAB SWITCH =====================
function switchTab(tab) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((b, i) =>
      b.classList.toggle("active", tab === "login" ? i === 0 : i === 1),
    );
  document.getElementById("login-form").style.display =
    tab === "login" ? "block" : "none";
  document.getElementById("signup-form").style.display =
    tab === "signup" ? "block" : "none";
  document.getElementById("login-msg").textContent = "";
  document.getElementById("signup-msg").textContent = "";
}

// ===================== LOGIN METHOD TOGGLE =====================
function switchLoginMethod(method) {
  loginMethod = method;
  document
    .getElementById("lt-email")
    .classList.toggle("active", method === "email");
  document
    .getElementById("lt-mobile")
    .classList.toggle("active", method === "mobile");
  document.getElementById("login-email-group").style.display =
    method === "email" ? "block" : "none";
  document.getElementById("login-mobile-group").style.display =
    method === "mobile" ? "block" : "none";
  document.getElementById("login-msg").textContent = "";
  clearWrapErr("wrap-lemail", "err-lemail");
  clearWrapErr("wrap-lmobile", "err-lmobile");
  clearWrapErr("wrap-lpass", "err-lpass");
}

// ===================== PASSWORD TOGGLE =====================
function togglePass(id, btn) {
  const inp = document.getElementById(id);
  inp.type = inp.type === "password" ? "text" : "password";
  btn.textContent = inp.type === "password" ? "👁️" : "🙈";
}

// ===================== HELPERS =====================
function setErr(wrapId, errId, msg) {
  document.getElementById(wrapId).classList.add("error");
  document.getElementById(wrapId).classList.remove("success");
  document.getElementById(errId).textContent = msg;
}

function setOk(wrapId, errId) {
  document.getElementById(wrapId).classList.remove("error");
  document.getElementById(wrapId).classList.add("success");
  document.getElementById(errId).textContent = "";
}

function clearWrapErr(wrapId, errId) {
  const wrap = document.getElementById(wrapId);
  if (wrap) wrap.classList.remove("error", "success");
  const err = document.getElementById(errId);
  if (err) err.textContent = "";
}

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
function isValidMobile(m) {
  return /^[6-9]\d{9}$/.test(m);
}
function isValidPassword(p) {
  return p.length >= 6;
}

// ===================== LIVE VALIDATIONS =====================
function liveValidateEmail() {
  const val = document.getElementById("login-email").value.trim();
  if (!val) {
    clearWrapErr("wrap-lemail", "err-lemail");
    return;
  }
  if (isValidEmail(val)) setOk("wrap-lemail", "err-lemail");
  else
    setErr("wrap-lemail", "err-lemail", "Please enter a valid email address");
}

function liveValidateSignupEmail() {
  const val = document.getElementById("signup-email").value.trim();
  if (!val) {
    clearWrapErr("wrap-semail", "err-semail");
    return;
  }
  if (!isValidEmail(val)) {
    setErr("wrap-semail", "err-semail", "Please enter a valid email address");
    return;
  }
  if (users.find((u) => u.email === val)) {
    setErr("wrap-semail", "err-semail", "This email is already registered");
    return;
  }
  setOk("wrap-semail", "err-semail");
}

function liveValidateMobile(inputId, wrapId, errId) {
  const inp = document.getElementById(inputId);
  inp.value = inp.value.replace(/\D/g, "");
  const val = inp.value;
  if (!val) {
    clearWrapErr(wrapId, errId);
    return;
  }
  if (val.length < 10) {
    setErr(wrapId, errId, "Mobile number must be 10 digits");
    return;
  }
  if (!isValidMobile(val)) {
    setErr(wrapId, errId, "Enter a valid Indian mobile number");
    return;
  }
  setOk(wrapId, errId);
}

function livePasswordStrength() {
  const pass = document.getElementById("signup-pass").value;
  clearWrapErr("wrap-spass", "err-spass");
  const wrap = document.getElementById("pass-strength-wrap");
  if (!pass) {
    wrap.style.display = "none";
    return;
  }
  wrap.style.display = "block";

  let score = 0;
  if (pass.length >= 6) score++;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score++;

  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  ["seg1", "seg2", "seg3", "seg4"].forEach((s, i) => {
    document.getElementById(s).style.background =
      i < score ? colors[score - 1] : "#e5e7eb";
  });
  document.getElementById("strength-label").textContent =
    labels[score - 1] || "";
  document.getElementById("strength-label").style.color =
    colors[score - 1] || "#999";
}

// ===================== LOGIN =====================
function doLogin() {
  const pass = document.getElementById("login-pass").value;
  const msg = document.getElementById("login-msg");
  msg.textContent = "";
  let hasErr = false;

  // Validate password
  if (!pass) {
    setErr("wrap-lpass", "err-lpass", "Password is required");
    hasErr = true;
  } else if (!isValidPassword(pass)) {
    setErr("wrap-lpass", "err-lpass", "Password must be at least 6 characters");
    hasErr = true;
  }

  let user = null;

  if (loginMethod === "email") {
    const email = document.getElementById("login-email").value.trim();
    if (!email) {
      setErr("wrap-lemail", "err-lemail", "Email is required");
      hasErr = true;
    } else if (!isValidEmail(email)) {
      setErr("wrap-lemail", "err-lemail", "Please enter a valid email address");
      hasErr = true;
    }
    if (!hasErr) {
      user = users.find((u) => u.email === email && u.pass === pass);
      if (!user) {
        msg.textContent = "Incorrect email or password.";
        return;
      }
    }
  } else {
    const mobile = document.getElementById("login-mobile").value.trim();
    if (!mobile) {
      setErr("wrap-lmobile", "err-lmobile", "Mobile number is required");
      hasErr = true;
    } else if (!isValidMobile(mobile)) {
      setErr(
        "wrap-lmobile",
        "err-lmobile",
        "Enter a valid 10-digit mobile number",
      );
      hasErr = true;
    }
    if (!hasErr) {
      user = users.find((u) => u.mobile === mobile && u.pass === pass);
      if (!user) {
        msg.textContent = "Incorrect mobile number or password.";
        return;
      }
    }
  }

  if (hasErr) return;
  currentUser = user;
  showDashboard();
}

// ===================== SIGNUP =====================
function doSignup() {
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const mobile = document.getElementById("signup-mobile").value.trim();
  const pass = document.getElementById("signup-pass").value;
  const msg = document.getElementById("signup-msg");
  msg.textContent = "";
  let hasErr = false;

  if (!name) {
    setErr("wrap-sname", "err-sname", "Full name is required");
    hasErr = true;
  } else {
    setOk("wrap-sname", "err-sname");
  }

  if (!email) {
    setErr("wrap-semail", "err-semail", "Email is required");
    hasErr = true;
  } else if (!isValidEmail(email)) {
    setErr("wrap-semail", "err-semail", "Please enter a valid email address");
    hasErr = true;
  } else if (users.find((u) => u.email === email)) {
    setErr("wrap-semail", "err-semail", "This email is already registered");
    hasErr = true;
  }

  if (!mobile) {
    setErr("wrap-smobile", "err-smobile", "Mobile number is required");
    hasErr = true;
  } else if (!isValidMobile(mobile)) {
    setErr(
      "wrap-smobile",
      "err-smobile",
      "Enter a valid 10-digit Indian mobile number",
    );
    hasErr = true;
  } else if (users.find((u) => u.mobile === mobile)) {
    setErr(
      "wrap-smobile",
      "err-smobile",
      "This mobile number is already registered",
    );
    hasErr = true;
  }

  if (!pass) {
    setErr("wrap-spass", "err-spass", "Password is required");
    hasErr = true;
  } else if (!isValidPassword(pass)) {
    setErr("wrap-spass", "err-spass", "Password must be at least 6 characters");
    hasErr = true;
  }

  if (hasErr) return;

  const user = { name, email, mobile, pass };
  users.push(user);
  saveUsers();
  currentUser = user;
  showDashboard();
}

// ===================== GOOGLE LOGIN =====================
function googleLogin() {
  currentUser = {
    name: "Google User",
    email: "google@demo.com",
    mobile: "",
    pass: "",
  };
  showDashboard();
}

// ===================== LOGOUT =====================
function doLogout() {
  currentUser = null;
  document.getElementById("auth-page").style.display = "flex";
  document.getElementById("dashboard-page").style.display = "none";
  document.getElementById("login-email").value = "";
  document.getElementById("login-mobile").value = "";
  document.getElementById("login-pass").value = "";
  document.getElementById("login-msg").textContent = "";
  ["wrap-lemail", "wrap-lmobile", "wrap-lpass"].forEach((w) =>
    clearWrapErr(w, w.replace("wrap-l", "err-l")),
  );
}

function showDashboard() {
  document.getElementById("auth-page").style.display = "none";
  document.getElementById("dashboard-page").style.display = "flex";
  initDashboard();
}

// ===================== DASHBOARD STATE =====================
let selectedType = "Length";
let selectedAction = "Comparison";
let selectedOp = "+";

const units = {
  Length: [
    "Kilometer",
    "Meter",
    "Centimeter",
    "Millimeter",
    "Mile",
    "Yard",
    "Foot",
    "Inch",
  ],
  Weight: ["Kilogram", "Gram", "Milligram", "Metric Ton", "Pound", "Ounce"],
  Temperature: ["Celsius", "Fahrenheit", "Kelvin"],
  Volume: [
    "Liter",
    "Milliliter",
    "Cubic Meter",
    "Gallon",
    "Quart",
    "Pint",
    "Cup",
    "Fluid Ounce",
  ],
};

const toBase = {
  // Length -> meters
  Kilometer: 1000,
  Meter: 1,
  Centimeter: 0.01,
  Millimeter: 0.001,
  Mile: 1609.344,
  Yard: 0.9144,
  Foot: 0.3048,
  Inch: 0.0254,
  // Weight -> grams
  Kilogram: 1000,
  Gram: 1,
  Milligram: 0.001,
  "Metric Ton": 1e6,
  Pound: 453.592,
  Ounce: 28.3495,
  // Volume -> liters
  Liter: 1,
  Milliliter: 0.001,
  "Cubic Meter": 1000,
  Gallon: 3.78541,
  Quart: 0.946353,
  Pint: 0.473176,
  Cup: 0.24,
  "Fluid Ounce": 0.0295735,
};

// ===================== UNIT CONVERSION HELPERS =====================
function convertToBase(value, unit) {
  return value * toBase[unit];
}

function convertTemp(value, from, to) {
  let celsius;
  if (from === "Celsius") celsius = value;
  else if (from === "Fahrenheit") celsius = ((value - 32) * 5) / 9;
  else celsius = value - 273.15;

  if (to === "Celsius") return celsius;
  if (to === "Fahrenheit") return (celsius * 9) / 5 + 32;
  return celsius + 273.15;
}

// ===================== POPULATE UNIT DROPDOWNS =====================
function populateUnits() {
  const u = units[selectedType];
  ["unit1", "unit2"].forEach((id, i) => {
    const sel = document.getElementById(id);
    sel.innerHTML = u.map((x) => "<option>" + x + "</option>").join("");
    sel.selectedIndex = i === 0 ? 0 : 1;
  });
}

// ===================== TYPE SELECTION =====================
function selectType(type, el) {
  selectedType = type;
  document
    .querySelectorAll(".type-card")
    .forEach((c) => c.classList.remove("selected"));
  el.classList.add("selected");
  populateUnits();
  clearResult();
}

// ===================== ACTION SELECTION =====================
function selectAction(action, el) {
  selectedAction = action;
  document
    .querySelectorAll(".action-tab")
    .forEach((b) => b.classList.remove("active"));
  el.classList.add("active");

  const arithRow = document.getElementById("arith-op-row");
  const toBox = document.getElementById("to-box");
  const fromLabel = document.getElementById("from-label");
  const toLabel = document.getElementById("to-label");

  if (action === "Arithmetic") {
    arithRow.style.display = "flex";
    toBox.style.display = "flex";
    fromLabel.textContent = "VALUE 1";
    toLabel.textContent = "VALUE 2";
  } else if (action === "Conversion") {
    arithRow.style.display = "none";
    toBox.style.display = "none";
    fromLabel.textContent = "FROM";
  } else {
    arithRow.style.display = "none";
    toBox.style.display = "flex";
    fromLabel.textContent = "FROM";
    toLabel.textContent = "TO";
  }
  clearResult();
}

// ===================== OPERATOR SELECTION =====================
function selectOp(op, el) {
  selectedOp = op;
  document
    .querySelectorAll(".arith-op-btn")
    .forEach((b) => b.classList.remove("active"));
  el.classList.add("active");
}

// ===================== CLEAR RESULT =====================
function clearResult() {
  document.getElementById("result-card").style.display = "none";
  document.getElementById("error-msg").textContent = "";
}

// ===================== CALCULATE =====================
function calculate() {
  const v1 = parseFloat(document.getElementById("val1").value);
  const u1 = document.getElementById("unit1").value;
  const v2 = parseFloat(document.getElementById("val2").value);
  const u2 = document.getElementById("unit2").value;
  const errEl = document.getElementById("error-msg");
  const rc = document.getElementById("result-card");
  const rv = document.getElementById("result-value");
  const rl = document.getElementById("result-label");
  const rs = document.getElementById("result-sub");
  errEl.textContent = "";

  if (isNaN(v1)) {
    errEl.textContent = "Please enter a valid number.";
    return;
  }

  if (selectedAction === "Conversion") {
    const result =
      selectedType === "Temperature"
        ? convertTemp(v1, u1, u2)
        : convertToBase(v1, u1) / toBase[u2];
    rc.style.display = "block";
    rl.textContent = "Conversion Result";
    rv.textContent = round(result) + " " + u2;
    rs.textContent = v1 + " " + u1 + " = " + round(result) + " " + u2;
  } else if (selectedAction === "Comparison") {
    if (isNaN(v2)) {
      errEl.textContent = "Please enter both values.";
      return;
    }
    const b1 =
      selectedType === "Temperature"
        ? convertTemp(v1, u1, "Celsius")
        : convertToBase(v1, u1);
    const b2 =
      selectedType === "Temperature"
        ? convertTemp(v2, u2, "Celsius")
        : convertToBase(v2, u2);
    rc.style.display = "block";
    rl.textContent = "Comparison Result";
    if (Math.abs(b1 - b2) < 1e-10) {
      rv.textContent = "Equal ✅";
      rs.textContent = v1 + " " + u1 + " = " + v2 + " " + u2;
    } else if (b1 > b2) {
      rv.textContent = v1 + " " + u1 + " is Greater";
      rs.textContent =
        v1 +
        " " +
        u1 +
        " > " +
        v2 +
        " " +
        u2 +
        (selectedType !== "Temperature" ? " (" + round(b1 / b2) + "x)" : "");
    } else {
      rv.textContent = v2 + " " + u2 + " is Greater";
      rs.textContent =
        v2 +
        " " +
        u2 +
        " > " +
        v1 +
        " " +
        u1 +
        (selectedType !== "Temperature" ? " (" + round(b2 / b1) + "x)" : "");
    }
  } else if (selectedAction === "Arithmetic") {
    if (isNaN(v2)) {
      errEl.textContent = "Please enter both values.";
      return;
    }
    if (selectedType === "Temperature") {
      errEl.textContent = "Arithmetic not applicable for Temperature.";
      return;
    }
    const b1 = convertToBase(v1, u1);
    const b2 = convertToBase(v2, u2);
    let res;
    if (selectedOp === "+") res = b1 + b2;
    else if (selectedOp === "-") res = b1 - b2;
    else if (selectedOp === "x") res = b1 * b2;
    else if (selectedOp === "/") {
      if (b2 === 0) {
        errEl.textContent = "Cannot divide by zero.";
        return;
      }
      res = b1 / b2;
    }
    const baseLabels = { Length: "meters", Weight: "grams", Volume: "liters" };
    rc.style.display = "block";
    rl.textContent = "Arithmetic Result";
    rv.textContent = round(res) + " " + baseLabels[selectedType];
    rs.textContent =
      v1 +
      " " +
      u1 +
      " " +
      selectedOp +
      " " +
      v2 +
      " " +
      u2 +
      " (in " +
      baseLabels[selectedType] +
      ")";
  }
}

// ===================== ROUND =====================
function round(n) {
  if (Math.abs(n) >= 1000) return Math.round(n).toLocaleString();
  if (Math.abs(n) >= 1) return Math.round(n * 1000) / 1000;
  return parseFloat(n.toPrecision(4));
}

// ===================== INIT DASHBOARD =====================
function initDashboard() {
  selectedType = "Length";
  selectedAction = "Comparison";
  selectedOp = "+";

  document
    .querySelectorAll(".type-card")
    .forEach((c, i) => c.classList.toggle("selected", i === 0));
  document
    .querySelectorAll(".action-tab")
    .forEach((b, i) => b.classList.toggle("active", i === 0));

  document.getElementById("arith-op-row").style.display = "none";
  document.getElementById("to-box").style.display = "flex";
  document.getElementById("from-label").textContent = "FROM";
  document.getElementById("to-label").textContent = "TO";
  document.getElementById("val1").value = "1";
  document.getElementById("val2").value = "1000";

  populateUnits();
  clearResult();
}
