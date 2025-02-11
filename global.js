let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'meta/', title: 'Meta' },
  { url: 'https://github.com/stephanieyyue', title: 'GitHub' }
];

const ARE_WE_HOME = document.documentElement.classList.contains('home');
let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  if (!ARE_WE_HOME && !url.startsWith('http')) {
    url = '../' + url;
  }
  
  let a = document.createElement('a');
  a.href = url;
  a.textContent = p.title;
  
  // Add current class if it's the active page
  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );
  
  // Add target="_blank" for external links
  if (a.host !== location.host) {
    a.target = "_blank";
  }
  
  nav.append(a);
}

// Add theme switcher
document.body.insertAdjacentHTML(
  'afterbegin',
  `<label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>`
);

// Get reference to select element
const select = document.querySelector('.color-scheme select');

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
}

// Load saved preference
if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

// Handle changes
select.addEventListener('input', (event) => {
  localStorage.colorScheme = event.target.value;
  setColorScheme(event.target.value);
});

const form = document.querySelector('form');

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  
  const data = new FormData(form);
  let url = form.action + '?';
  
  for (let [name, value] of data) {
    url += `${name}=${encodeURIComponent(value)}&`;
  }
  
  location.href = url.slice(0, -1); // Remove trailing &
});

export async function fetchJSON(url) {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

export async function fetchGitHubData(stephanieyyue) {
  return fetchJSON(`https://api.github.com/users/${stephanieyyue}`);
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!Array.isArray(projects)) {
      console.error('Projects must be an array');
      return;
  }
  
  // Clear the container before rendering the projects.
  // containerElement.innerHTML = '';
  
  projects.forEach(project => {
      // Create an article element for each project.
      const article = document.createElement('article');
      
      // Set the inner HTML of the article.
      // Notice that the description and year are wrapped in a <div class="project-text">
      // and the year is given a class "project-year" for styling.
      article.innerHTML = `
          <${headingLevel}>${project.title}</${headingLevel}>
          <img src="${project.image}" alt="${project.title}">
          <div class="project-text">
              <p>${project.description}</p>
              <p class="project-year">
                  c. ${project.year}
              </p>
          </div>
      `;
      
      containerElement.appendChild(article);
  });
}



