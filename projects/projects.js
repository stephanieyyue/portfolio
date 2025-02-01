import { fetchJSON, renderProjects } from '../global.js';

// Fetch the project data
const projects = await fetchJSON('../lib/projects.json');

// Select the container where projects will be displayed
const projectsContainer = document.querySelector('.projects');

// Render the projects
renderProjects(projects, projectsContainer, 'h2');

window.addEventListener("load", function () {
    console.log("Window fully loaded");

    const projectsTitle = document.querySelector(".projects-title");
    const projectItems = document.querySelectorAll(".projects article");

    console.log("Found project items:", projectItems.length);

    if (projectsTitle && projectItems.length > 0) {
        const newTitle = `Projects (${projectItems.length})`;
        projectsTitle.textContent = newTitle;
        console.log(`Updated title to: ${newTitle}`);
    } else {
        console.warn("Could not find .projects-title or no projects found.");
    }
});

