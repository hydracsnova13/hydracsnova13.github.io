const items = {
  "menu-position": { localStorage: "tablerMenuPosition", default: "top" },
  "menu-behavior": { localStorage: "tablerMenuBehavior", default: "sticky" },
  "container-layout": {
    localStorage: "tablerContainerLayout",
    default: "boxed"
  }
};
const config = {};
for (const [key, params] of Object.entries(items)) {
  const lsParams = localStorage.getItem(params.localStorage);
  config[key] = lsParams ? lsParams : params.default;
}
const parseUrl = () => {
  const search = window.location.search.substring(1);
  const params = search.split("&");
  for (let i = 0; i < params.length; i++) {
    const arr = params[i].split("=");
    const key = arr[0];
    const value = arr[1];
    if (!!items[key]) {
      localStorage.setItem(items[key].localStorage, value);
      config[key] = value;
    }
  }
};
const toggleFormControls = (form2) => {
  for (const [key, params] of Object.entries(items)) {
    const elem = form2.querySelector(
      `[name="settings-${key}"][value="${config[key]}"]`
    );
    if (elem) {
      elem.checked = true;
    }
  }
};
const submitForm = (form2) => {
  for (const [key, params] of Object.entries(items)) {
    const checkedInput = form2.querySelector(`[name="settings-${key}"]:checked`);
    if (checkedInput) {
      const value = checkedInput.value;
      localStorage.setItem(params.localStorage, value);
      config[key] = value;
    }
  }
  window.dispatchEvent(new Event("resize"));
  const bootstrap = window.bootstrap;
  if (bootstrap) {
    new bootstrap.Offcanvas(form2).hide();
  }
};
parseUrl();
const form = document.querySelector("#offcanvas-settings");
if (form) {
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    submitForm(form);
  });
  toggleFormControls(form);
}
//# sourceMappingURL=demo.js.map
