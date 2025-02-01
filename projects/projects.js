import { fetchJSON, renderProjects } from '../global.js';

console.log("projects.js is running!");

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