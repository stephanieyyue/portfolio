import { fetchJSON } from '../global.js';
import * as d3 from 'd3';

console.log("projects.js is running!");

// Create an arc generator with an inner radius of 0 and an outer radius of 50.
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Generate a full circle (arc path) by specifying the start and end angles in radians.
let arc = arcGenerator({
  startAngle: 0,
  endAngle: 2 * Math.PI,
});

// Append a new path element to the SVG and use the generated arc path.
d3.select('svg')
  .append('path')
  .attr('d', arc)
  .attr('fill', 'red');

async function init() {
    try {
        const projects = await fetchJSON('../lib/projects.json');
        const projectsContainer = document.querySelector('.projects');
        const projectsTitle = document.querySelector('.projects-title');

        if (projectsTitle && projects) {
            projectsTitle.textContent = `${projects.length} Projects`;
        }

        if (projectsContainer && projects) {
            // Clear any static markup before rendering:
            projectsContainer.innerHTML = '';
            renderProjects(projects, projectsContainer, 'h2');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Call init() only once.
init();

function renderProjects(projects, container, headingLevel = 'h2') {
    projects.forEach(project => {
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
