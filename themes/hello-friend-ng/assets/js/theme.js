// Toggle theme

const theme = window.localStorage && window.localStorage.getItem("theme");
const themeToggle = document.querySelector(".theme-toggle");
const isDark = theme === "dark";
var metaThemeColor = document.querySelector("meta[name=theme-color]");

if (theme !== null) {
    document.body.classList.toggle("dark-theme", isDark);
    isDark
        ? metaThemeColor.setAttribute("content", "#1b1c1d")
        : metaThemeColor.setAttribute("content", "#fafafa");
}

console.log("Exist!")
themeToggle.addEventListener("click", () => {
    console.log("Exist!")
    document.body.classList.toggle("dark-theme");

    window.localStorage &&
        window.localStorage.setItem(
            "theme",
            document.body.classList.contains("dark-theme") ? "dark" : "light"
        );

    document.body.classList.contains("dark-theme")
        ? metaThemeColor.setAttribute("content", "#1b1c1d")
        : metaThemeColor.setAttribute("content", "#fafafa");
});
