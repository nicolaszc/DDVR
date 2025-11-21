async function includeHTML(file, elementId, method) {
    const target = document.getElementById(elementId);
    const url = `${window.basePath}/${file}`;
  
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error cargando: ' + url);

    const html = await response.text();

    if (method === 'include') {
        target.innerHTML = html;
    } else {
        target.insertAdjacentHTML('afterbegin', html);
    }
}
