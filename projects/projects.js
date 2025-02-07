import { fetchJSON, renderProjects } from '../global.js';

console.log("projects.js is running!");

async function renderProjects(projects, container, headingLevel = 'h2') {
    projects.forEach(project => {
        const article = document.createElement('article');
        
        const heading = document.createElement(headingLevel);
        heading.textContent = project.title;
        
        const description = document.createElement('div');
        description.className = 'project-text';
        
        const descriptionP = document.createElement('p');
        descriptionP.textContent = project.description;
        
        const year = document.createElement('p');
        year.textContent = `c. ${project.year}`;
        year.style.fontFamily = 'serif';
        year.style.fontStyle = 'italic';
        year.style.color = '#666';
        
        description.appendChild(descriptionP);
        description.appendChild(year);
        
        article.appendChild(heading);
        article.appendChild(description);
        
        container.appendChild(article);
    });
}

async function init() {
    try {
        const projects = await fetchJSON('../lib/projects.json');
        const projectsContainer = document.querySelector('.projects');
        const projectsTitle = document.querySelector('.projects-title');

        // Update title to show count
        if (projectsTitle && projects) {
            projectsTitle.textContent = `${projects.length} Projects`;
        }

        // Clear existing content first
        if (projectsContainer) {
            projectsContainer.innerHTML = '';
        }

        // Render all projects
        if (projectsContainer && projects) {
            renderProjects(projects, projectsContainer, 'h2');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

init();