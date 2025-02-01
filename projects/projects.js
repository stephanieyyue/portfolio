import { fetchJSON, renderProjects } from '../global.js';

// Fetch the project data
const projects = await fetchJSON('../lib/projects.json');

// Select the container where projects will be displayed
const projectsContainer = document.querySelector('.projects');

// Render the projects
renderProjects(projects, projectsContainer, 'h2');

console.log("projects.js is running!");

async function init() {
    try {
        const projects = await fetchJSON('../lib/projects.json');
        const projectsContainer = document.querySelector('.projects');
        
        // Add this part to update the title with count
        const projectsTitle = document.querySelector('.projects-title');
        if (projectsTitle) {
            projectsTitle.textContent = `Projects (${projects.length})`;
        }

        if (projectsContainer) {
            renderProjects(projects, projectsContainer, 'h2');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

init();



