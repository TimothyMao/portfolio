console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a")

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );

// currentLink?.classList.add('current');


let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact'},
    { url: 'resume/', title: "Resume"},
    { url: 'https://github.com/TimothyMao', title: "Profile"}
    // add the rest of your pages here
  ];

  
const ARE_WE_HOME = document.documentElement.classList.contains('home');

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
      );
    
      if (a.host !== location.host) {
        a.target = "_blank";
    }

    nav.append(a);
  }


  document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select id="color-scheme-select">
            <option value="automatic">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
      </label>`
  );

  const select = document.querySelector('#color-scheme-select');

  if (localStorage.colorScheme) {
    document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
    select.value = localStorage.colorScheme;
  }
  
  select.addEventListener('input', function(event) {
    console.log('color scheme changed to', event.target.value);
  
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = event.target.value
  });

  export async function fetchJSON(url) {
    try {
        // Fetch the JSON data from the URL
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        // use console.log to see the response
        console.log(response);
        
        const data = await response.json();
        //add console.log to see the data
        console.log(data);
        return data;

    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

/*
  export function renderProjects(project, containerElement) {
    containerElement.innerHTML = '';
    // validate the parameters
    if (!project || !containerElement) {
      console.error('Invalid project or containerElement');
      return;
    }
    project.forEach(project => {
      const article = document.createElement('article');
      article.innerHTML = `
        <h3>${project.title}</h3>
        <img src="${project.image}" alt="${project.title}">
        <p>${project.description}</p>
      `;
      containerElement.appendChild(article);
  });
}
*/

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';
  // validate the parameters
  if (!project || !containerElement) {
    console.error('Invalid project or containerElement');
    return;
  }
  project.forEach(project => {
    const article = document.createElement('article');
    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <div class="project-text">
          <p>${project.description}</p>
          <p class="project-year">${project.year}</p>
      </div>
    `;
    containerElement.appendChild(article);
});
}
/* code to test renderProjects function
const projectsData = await fetchJSON('../lib/projects.json');
const container = document.querySelector('.projects');
renderProjects(projectsData, container, 'h3');
*/

export async function fetchGitHubData(username) {
  // return statement here
  return fetchJSON(`https://api.github.com/users/${username}`);
}