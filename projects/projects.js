import { fetchJSON, renderProjects } from '../global.js';

// Fetch the project data
const projects = await fetchJSON('../lib/projects.json');

// Select the container where projects will be displayed
const projectsContainer = document.querySelector('.projects');

// Render the projects
renderProjects(projects, projectsContainer, 'h2');

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM is fully loaded");

    const projectsTitle = document.querySelector(".projects-title");
    const projectItems = document.querySelectorAll(".projects article"); 

    console.log("projectsTitle element:", projectsTitle);
    console.log("Found project items:", projectItems.length);

    if (projectsTitle && projectItems.length > 0) {
        projectsTitle.textContent = `Projects (${projectItems.length})`;
        console.log(`Updated title to: Projects (${projectItems.length})`);
    } else {
        console.warn("No projects found in .projects");
    }
});

