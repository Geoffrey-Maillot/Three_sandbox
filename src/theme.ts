type Theme = "pastel" | "dracula";

const initialTheme: Theme = "dracula";

const addThemeLocalStorage = (theme: Theme) => {
  localStorage.setItem("threeJsCourseTheme", theme);
};

const getThemeLocalStorage = () => {
  const theme = localStorage.getItem("threeJsCourseTheme") as Theme;

  if (theme) {
    return theme;
  } else {
    addThemeLocalStorage(initialTheme);
    return initialTheme;
  }
};

const applyTheme = (theme: Theme) => {
  document.querySelector("html")?.setAttribute("data-theme", theme);
};

const init = () => {
  const theme = getThemeLocalStorage();
  applyTheme(theme);

  const checkboxTheme = document.getElementById(
    "modify-theme",
  ) as HTMLInputElement;

  checkboxTheme.checked = theme === "pastel";

  checkboxTheme.addEventListener("click", (e: Event) => {
    console.dir(e.target);
    if (checkboxTheme.checked) {
      addThemeLocalStorage("pastel");
      applyTheme("pastel");
    } else {
      addThemeLocalStorage("dracula");
      applyTheme("dracula");
    }
  });
};

document.addEventListener("DOMContentLoaded", init);
