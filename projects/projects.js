import { fetchJSON, renderProjects } from '../global.js';

// Fetch the project data
const projects = await fetchJSON('../lib/projects.json');

// Select the container where projects will be displayed
const projectsContainer = document.querySelector('.projects');

// Render the projects
renderProjects(projects, projectsContainer, 'h2');

console.log("projects.js is running!");

import { fetchJSON, renderProjects } from '../global.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Log to verify the script is running
        console.log('projects.js is running!');
        
        // Fetch the projects
        const projects = await fetchJSON('../lib/projects.json');
        console.log('Fetched projects:', projects);
        
        // Update the title first
        const projectsTitle = document.querySelector('.projects-title');
        if (projectsTitle) {
            projectsTitle.textContent = `Projects (${projects.length})`;
        }
        
        // Then render the projects
        const projectsContainer = document.querySelector('.projects');
        if (projectsContainer) {
            renderProjects(projects, projectsContainer, 'h2');
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
});



