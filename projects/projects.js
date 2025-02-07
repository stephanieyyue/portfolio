import { fetchJSON } from '../global.js';

console.log("projects.js is running!");

async function renderProjects(projects, container, headingLevel = 'h2') {
    console.log('Projects data:', projects); // Debug line
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
        year.style.marginTop = '0.5rem';
        
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
        console.log('Fetched projects:', projects); // Debug line
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

init();