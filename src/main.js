let isHelixMode = true;

window.addEventListener('message', (event) => {
    if (event.data.type === 'hover') {
        const base = event.data.base;
        const objects = scene.children;
        objects.forEach(obj => {
            if (obj.name === base) {
                highlightBase(obj);
            }
        });
    } else if (event.data.type === 'clearHighlight') {
        const objects = scene.children;
        objects.forEach(obj => {
            if (obj.name === 'A' || obj.name === 'T' || obj.name === 'C' || obj.name === 'G') {
                unhighlightBase(obj);
            }
        });
    }
}); 