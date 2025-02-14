let pages = [
  { url: '/', title: 'Home' },
  { url: '/projects/', title: 'Projects' },
  { url: '/contact/', title: 'Contact' },
  { url: '/resume/', title: 'Resume' },
  { url: '/meta/', title: 'Meta' },
  { url: 'https://github.com/stephanieyyue', title: 'GitHub' }
];

// ✅ Detect if we are inside a subdirectory (for local development)
const isInSubdirectory = location.pathname.split('/').length > 2;

// ✅ Set correct base path for GitHub Pages
const basePath = isInSubdirectory ? '../' : '/';

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;

  // ✅ Ensure correct relative paths for local and GitHub Pages
  if (!url.startsWith('http')) {
    url = basePath + p.url;
  }

  let a = document.createElement('a');
  a.href = url;
  a.textContent = p.title;

  // ✅ Fix "current" class to properly highlight active page
  a.classList.toggle('current', location.pathname.startsWith(p.url));

  // ✅ Open external links (GitHub) in a new tab
  if (a.host !== location.host) {
    a.target = "_blank";
  }

  nav.append(a);
}

console.log("✅ Navigation loaded:", nav.innerHTML);


// ✅ Add Theme Switcher
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

// ✅ Handle Theme Switching
const select = document.querySelector('.color-scheme select');

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
}

// Load saved preference
if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

// Save new preference when changed
select.addEventListener('input', (event) => {
  localStorage.colorScheme = event.target.value;
  setColorScheme(event.target.value);
});

// ✅ Handle Form Submissions
const form = document.querySelector('form');

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(form);
  let url = form.action + '?';

  for (let [name, value] of data) {
    url += `${name}=${encodeURIComponent(value)}&`;
  }

  location.href = url.slice(0, -1); // Remove trailing "&"
});

// ✅ Fetch JSON Data
export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching or parsing JSON:', error);
  }
}

// ✅ Fetch GitHub Data for User
export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

// ✅ Render Projects Function
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!Array.isArray(projects)) {
    console.error('Projects must be an array');
    return;
  }

  // ✅ Clear the container before rendering the projects
  containerElement.innerHTML = '';

  projects.forEach(project => {
    // ✅ Create an article element for each project
    const article = document.createElement('article');

    // ✅ Set the inner HTML of the article
    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <div class="project-text">
        <p>${project.description}</p>
        <p class="project-year">c. ${project.year}</p>
      </div>
    `;

    containerElement.appendChild(article);
  });
}

console.log("✅ global.js finished loading");
