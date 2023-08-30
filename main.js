window.darkMode = window.localStorage.getItem('theme') !== 'light';
setColorMode();

function toggleColorMode() {
  window.darkMode = !window.darkMode;
  setColorMode();
}

function setColorMode() {
  var body = document.getElementsByTagName("body")[0];
  var link = document.getElementById("color-mode");
  if (window.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    window.localStorage.setItem('theme', 'dark');
    link.innerHTML = "light mode";
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    window.localStorage.setItem('theme', 'light');
    link.innerHTML = "dark mode";
  }
}
