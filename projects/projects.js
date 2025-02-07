import { fetchJSON } from '../global.js';
import * as d3 from 'https://unpkg.com/d3@7?module';

console.log("projects.js is running!");

// Create an arc generator with an inner radius of 0 and an outer radius of 50.
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Generate a full circle (arc path) by specifying the start and end angles in radians.
let arc = arcGenerator({
  startAngle: 0,
  endAngle: 2 * Math.PI,
});

// Append the arc as a new path element to the existing <svg> element.
d3.select('svg')
  .append('path')
  .attr('d', arc)
  .attr('fill', 'red');

async function init() {
    try {
        console.log("Calling fetchJSON...");
        const projects = await fetchJSON('../lib/projects.json');
        console.log("Fetched projects:", projects);

        // Select the container that holds static projects.
        const projectsContainer = document.querySelector('.projects');
        const projectsTitle = document.querySelector('.projects-title');

        // Extract static project titles
        const staticArticles = projectsContainer.querySelectorAll('article');
        const staticTitles = Array.from(staticArticles).map(article => {
            const h2 = article.querySelector('h2');
            return h2 ? h2.textContent.trim() : "";
        });
        console.log("Static titles:", staticTitles);

        // Filter dynamic projects to remove duplicates
        const filteredProjects = projects.filter(project => !staticTitles.includes(project.title));
        console.log("Filtered dynamic projects:", filteredProjects);

        // Create (or select) a container for dynamic projects
        let dynamicContainer = document.querySelector('.dynamic-projects');
        if (!dynamicContainer) {
            dynamicContainer = document.createElement('div');
            dynamicContainer.classList.add('dynamic-projects');
            projectsContainer.appendChild(dynamicContainer);
            console.log("Created new dynamic container:", dynamicContainer);
        }

        // Update heading with total count (static + filtered dynamic)
        if (projectsTitle) {
            const totalCount = staticArticles.length + filteredProjects.length;
            projectsTitle.textContent = `${totalCount} Projects`;
        }

        // Render only the filtered dynamic projects
        if (dynamicContainer && filteredProjects) {
            renderProjects(filteredProjects, dynamicContainer, 'h2');
        } else {
            console.log("Either dynamicContainer or filtered projects is missing.");
        }
    } catch (error) {
        console.error('Error in init():', error);
    }
}

init();

function renderProjects(projects, container, headingLevel = 'h2') {
    projects.forEach(project => {
        console.log("Rendering project:", project); // Debug log
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
        
        // Create the year element.
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
