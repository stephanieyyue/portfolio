import { fetchJSON } from '../global.js';

console.log("projects.js is running!");

function createVisualization(projects, container) {
    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.style.width = "20em";
    svg.style.marginBlock = "2em";
    svg.style.display = "block";

    // Create circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "50");
    circle.setAttribute("cy", "50");
    circle.setAttribute("r", "50");
    circle.setAttribute("fill", "red");

    svg.appendChild(circle);
    container.insertBefore(svg, container.firstChild);
}

function renderProjects(projects, container, headingLevel = 'h2') {
    // Add visualization first
    createVisualization(projects, container);

    // Then render projects as before
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

async function init() {
    try {
        const projects = await fetchJSON('../lib/projects.json');
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