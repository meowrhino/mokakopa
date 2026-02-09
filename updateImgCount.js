// Script para actualizar automáticamente el imgCount de cada proyecto en data.json
const fs = require('fs');
const path = require('path');

// Función para contar imágenes en una carpeta
function countImages(folderPath) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    let count = 0;
    
    try {
        const files = fs.readdirSync(folderPath);
        files.forEach(file => {
            const ext = path.extname(file).toLowerCase();
            if (imageExtensions.includes(ext)) {
                count++;
            }
        });
    } catch (error) {
        console.error(`Error leyendo carpeta ${folderPath}:`, error.message);
    }
    
    return count;
}

// Función para contar imágenes en proyectos complejos (con subcarpetas)
function countComplexProjectImages(projectPath) {
    const subfolders = fs.readdirSync(projectPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    
    const counts = {};
    subfolders.forEach(subfolder => {
        const subfolderPath = path.join(projectPath, subfolder);
        counts[subfolder] = countImages(subfolderPath);
    });
    
    return counts;
}

// Leer data.json
const dataPath = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('Actualizando imgCount para cada proyecto...\n');

// Actualizar imgCount para cada proyecto
data.proyectos.forEach(projectData => {
    const projectName = projectData.id;
    const projectPath = path.join(__dirname, 'data', projectName);
    
    if (projectData.tipo === 'simple') {
        const imgCount = countImages(projectPath);
        projectData.imgCount = imgCount;
        console.log(`${projectName} (simple): ${imgCount} imágenes`);
    } else if (projectData.tipo === 'complejo') {
        const subfolderCounts = countComplexProjectImages(projectPath);
        projectData.imgCount = subfolderCounts;
        console.log(`${projectName} (complejo):`, subfolderCounts);
    }
});

// Guardar data.json actualizado
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('\n✓ data.json actualizado correctamente');
