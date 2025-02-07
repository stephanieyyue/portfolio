import { fetchJSON } from '../global.js';

console.log("projects.js is running!");

async function init() {
    try {
        const projects = await fetchJSON('../lib/projects.json');
        const projectsContainer = document.querySelector('.projects');
        const projectsTitle = document.querySelector('.projects-title');

        if (projectsTitle && projects) {
            projectsTitle.textContent = `${projects.length} Projects`;
        }

        if (projectsContainer) {
            projectsContainer.innerHTML = '';
        }

        if (projectsContainer && projects) {
            renderProjects(projects, projectsContainer, 'h2');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderProjects(projects, container, headingLevel = 'h2') {
    projects.forEach(project => {
        const article = document.createElement('article');
        
        const heading = document.createElement(headingLevel);
        heading.textContent = project.title;
        
        const img = document.createElement('img');
        img.src = project.image;
        img.alt = project.title;
        
        const textDiv = document.createElement('div');
        textDiv.className = 'project-text';
        
        const description = document.createElement('p');
        description.textContent = project.description;
        
        const yearText = document.createElement('p');
        yearText.textContent = `c. ${project.year}`;
        yearText.style.fontFamily = 'serif';
        yearText.style.fontStyle = 'italic';
        yearText.style.color = '#666';
        
        textDiv.appendChild(description);
        textDiv.appendChild(yearText);
        
        article.appendChild(heading);
        article.appendChild(img);
        article.appendChild(textDiv);
        
        container.appendChild(article);
    });
}

init();