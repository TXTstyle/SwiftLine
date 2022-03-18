const root = document.documentElement;

root.style.setProperty('--background-color', '#121212');
root.style.setProperty('--surface-color', "#181818");
root.style.setProperty('--font-color', "#ccc");


function openTab(n,c) {
    const sideMenu = document.querySelector(n);
    if (sideMenu.style.display == 'none') {
        sideMenu.style.display = "flex";
        sideMenu.toggleAttribute('closed');
        for (let i = 0; i < sideMenu.children.length; i++) {
            const child = sideMenu.children[i];
            if (child.classList.contains(c)) {
                child.style.display = "flex";
                continue;
            }
            child.style.display = "block";
        }
    } else {
        sideMenu.style.display = "none";
        sideMenu.toggleAttribute('closed');
        for (let i = 0; i < sideMenu.children.length; i++) {
            const child = sideMenu.children[i];
            
            child.style.display = "none";
        }
    }
}