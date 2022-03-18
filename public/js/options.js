function openTab(n,c) {
    const sideMenu = document.querySelector(n);
    console.log("click");
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