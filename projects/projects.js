import { fetchJSON, renderProjects } from '../global.js';

// Fetch the project data
const projects = await fetchJSON('../lib/projects.json');

// Select the container where projects will be displayed
const projectsContainer = document.querySelector('.projects');

// Render the projects
renderProjects(projects, projectsContainer, 'h2');

console.log("projects.js is running!");

document.addEventListener("DOMContentLoaded", function () {
    console.log(" DOM fully loaded");

    const projectsTitle = document.querySelector(".projects-title");
    console.log("projectsTitle element:", projectsTitle);

    const projectItems = document.querySelectorAll(".projects article");
    console.log("Found project items:", projectItems.length);

    if (projectsTitle && projectItems.length > 0) {
        const newTitle = `Projects (${projectItems.length})`;
        projectsTitle.textContent = newTitle;
        console.log(`Updated title to: ${newTitle}`);
    } else {
        console.warn("⚠️ Could not find .projects-title or no projects found.");
    }
});

