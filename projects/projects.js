import { fetchJSON, renderProjects } from '../global.js';

// Fetch the project data
const projects = await fetchJSON('../lib/projects.json');

// Select the container where projects will be displayed
const projectsContainer = document.querySelector('.projects');

// Render the projects
renderProjects(projects, projectsContainer, 'h2');

document.addEventListener("DOMContentLoaded", async function () {
    const projectsTitle = document.querySelector(".projects-title");
    const projectList = document.querySelectorAll("#projects-list li");
    
    if (projectsTitle && projectList.length > 0) {
        projectsTitle.textContent = `Projects (${projectList.length})`;
    }
    
    const containerElement = document.querySelector("#projects-container");
    if (containerElement) {
        try {
            const projects = await fetchJSON('/data/projects.json'); // Adjust URL if needed
            if (projects && projectsTitle) {
                projectsTitle.textContent = `Projects (${projects.length})`;
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    }
});
